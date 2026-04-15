import base64
import hashlib
import hmac
import json
import os
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Optional, Tuple

from fastapi import Depends, Header, HTTPException, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload, selectinload

from .database import get_db
from .models import (
    Brand,
    DigitalPassport,
    MarketplaceListing,
    MarketplaceOrder,
    Product,
    ProductJourneyStep,
    ScanHistory,
    Supplier,
    SupplierBrandLink,
    User,
    VerificationRequest,
    WardrobeEvent,
    WardrobeItem,
)


SECRET_KEY = os.getenv("SECRET_KEY", "circular-finder-dev-secret")
TOKEN_TTL_HOURS = int(os.getenv("TOKEN_TTL_HOURS", "18"))
UPLOADS_DIR = Path(__file__).resolve().parent / "static" / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def slugify(value: str) -> str:
    stripped = "".join(char.lower() if char.isalnum() else "-" for char in value)
    collapsed = "-".join(part for part in stripped.split("-") if part)
    return collapsed or secrets.token_hex(4)


def json_dumps(value: Any) -> str:
    return json.dumps(value, ensure_ascii=True)


def json_loads(value: Optional[str], default: Any) -> Any:
    if not value:
        return default
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return default


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120_000)
    return f"{salt}${digest.hex()}"


def verify_password(password: str, hashed: str) -> bool:
    salt, stored_digest = hashed.split("$", 1)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120_000)
    return hmac.compare_digest(digest.hex(), stored_digest)


def encode_token(payload: dict[str, Any]) -> str:
    raw_payload = base64.urlsafe_b64encode(json.dumps(payload).encode("utf-8")).decode("utf-8").rstrip("=")
    signature = hmac.new(SECRET_KEY.encode("utf-8"), raw_payload.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{raw_payload}.{signature}"


def decode_token(token: str) -> dict[str, Any]:
    try:
        raw_payload, signature = token.split(".", 1)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.") from exc

    expected = hmac.new(SECRET_KEY.encode("utf-8"), raw_payload.encode("utf-8"), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token signature.")

    padded = raw_payload + "=" * (-len(raw_payload) % 4)
    payload = json.loads(base64.urlsafe_b64decode(padded.encode("utf-8")).decode("utf-8"))
    if payload.get("exp", 0) < int(now_utc().timestamp()):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired.")
    return payload


def create_access_token(user: User) -> str:
    expires_at = now_utc() + timedelta(hours=TOKEN_TTL_HOURS)
    payload = {"sub": user.id, "email": user.email, "role": user.role, "exp": int(expires_at.timestamp())}
    return encode_token(payload)


def get_optional_user(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> Optional[User]:
    if not authorization:
        return None
    if not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token required.")
    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)
    user = db.get(User, payload["sub"])
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")
    return user


def get_current_user(user: Optional[User] = Depends(get_optional_user)) -> User:
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required.")
    return user


def get_admin_user(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
    return user


def get_brand_from_key(db: Session, brand_key: Optional[str]) -> Brand:
    if not brand_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="X-Brand-Key header is required.")
    brand = db.scalar(select(Brand).where(Brand.api_key == brand_key))
    if not brand:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Brand API key is invalid.")
    return brand


def condition_multiplier(condition: str) -> float:
    return {
        "new": 0.85,
        "excellent": 0.72,
        "good": 0.58,
        "fair": 0.4,
        "repairable": 0.27,
    }.get(condition.lower(), 0.55)


def demand_multiplier(brand: Brand, product: Product) -> float:
    premium_bonus = 1 + (brand.transparency_score / 400)
    category_bonus = {
        "outerwear": 1.18,
        "dress": 1.08,
        "knitwear": 1.04,
        "accessories": 0.92,
    }.get(product.category.lower(), 1.0)
    return round(premium_bonus * category_bonus, 2)


def predict_resale(product: Product, passport: DigitalPassport, brand: Brand, condition: str) -> Tuple[float, int]:
    base = product.msrp * condition_multiplier(condition)
    brand_demand = demand_multiplier(brand, product)
    rarity_boost = 1 + (passport.circularity_score / 600)
    predicted = round(base * brand_demand * rarity_boost, 2)
    expected_days = max(4, int(22 - (brand.transparency_score / 10) - (passport.circularity_score / 20)))
    return predicted, expected_days


def brand_score_label(score: float) -> str:
    if score >= 4.6:
        return "Exceptional"
    if score >= 4.0:
        return "Strong"
    if score >= 3.2:
        return "Emerging"
    return "Needs work"


def serialize_brand(brand: Brand) -> dict[str, Any]:
    return {
        "id": brand.id,
        "name": brand.name,
        "slug": brand.slug,
        "description": brand.description,
        "headquartersRegion": brand.headquarters_region,
        "transparencyScore": brand.transparency_score,
        "sustainabilityRating": brand.sustainability_rating,
        "ratingLabel": brand_score_label(brand.sustainability_rating),
        "demographics": json_loads(brand.demographics_json, []),
        "certifications": json_loads(brand.certifications_json, []),
        "website": brand.website,
        "isVerified": brand.is_verified,
    }


def serialize_supplier(supplier: Supplier) -> dict[str, Any]:
    associated_brands = [
        {
            "id": link.brand.id,
            "name": link.brand.name,
            "relationshipType": link.relationship_type,
            "transparencyScore": link.brand.transparency_score,
        }
        for link in supplier.brand_links
    ]
    return {
        "id": supplier.id,
        "name": supplier.name,
        "supplierType": supplier.supplier_type,
        "region": supplier.region,
        "country": supplier.country,
        "city": supplier.city,
        "latitude": supplier.latitude,
        "longitude": supplier.longitude,
        "certifications": json_loads(supplier.certifications_json, []),
        "materials": json_loads(supplier.materials_json, []),
        "laborStandard": supplier.labor_standard,
        "transparencyNotes": supplier.transparency_notes,
        "isVerified": supplier.is_verified,
        "brands": associated_brands,
    }


def serialize_passport(passport: DigitalPassport, include_product: bool = True) -> dict[str, Any]:
    product = passport.product
    brand = product.brand
    journey = [
        {
            "id": step.id,
            "stepType": step.step_type,
            "name": step.name,
            "country": step.country,
            "latitude": step.latitude,
            "longitude": step.longitude,
            "details": step.details,
            "stepOrder": step.step_order,
            "supplierId": step.supplier_id,
        }
        for step in sorted(passport.journey_steps, key=lambda item: item.step_order)
    ]

    payload = {
        "passportDbId": passport.id,
        "passportId": passport.passport_id,
        "manufacturer": passport.manufacturer,
        "factoryLocation": passport.factory_location,
        "countryOfOrigin": passport.country_of_origin,
        "materialComposition": json_loads(passport.material_composition_json, []),
        "carbonFootprintKg": passport.carbon_kg,
        "waterUsageLiters": passport.water_liters,
        "sustainabilityCertifications": json_loads(passport.sustainability_certifications_json, []),
        "repairInstructions": passport.repair_instructions,
        "recyclingInstructions": passport.recycling_instructions,
        "durabilityRating": passport.durability_rating,
        "circularityScore": passport.circularity_score,
        "resaleValueEstimate": passport.resale_estimate,
        "passportStatus": passport.passport_status,
        "qrCode": passport.qr_code,
        "barcode": passport.barcode,
        "nfcTag": passport.nfc_tag,
        "verifiedAt": passport.verified_at.isoformat(),
        "journey": journey,
    }
    if include_product:
        payload["product"] = serialize_product(product, include_passport=False)
        payload["brand"] = serialize_brand(brand)
    return payload


def serialize_product(product: Product, include_passport: bool = True) -> dict[str, Any]:
    payload = {
        "id": product.id,
        "productCode": product.product_code,
        "name": product.name,
        "garmentType": product.garment_type,
        "category": product.category,
        "targetDemographic": product.target_demographic,
        "baseColor": product.base_color,
        "materialsSummary": product.materials_summary,
        "msrp": product.msrp,
        "productStory": product.product_story,
        "imageUrl": product.image_url,
        "styleTags": json_loads(product.style_tags_json, []),
        "brand": serialize_brand(product.brand),
    }
    if include_passport and product.passport:
        payload["passport"] = serialize_passport(product.passport, include_product=False)
    return payload


def serialize_listing(listing: MarketplaceListing) -> dict[str, Any]:
    return {
        "id": listing.id,
        "title": listing.title,
        "description": listing.description,
        "sizeLabel": listing.size_label,
        "condition": listing.condition,
        "price": listing.price,
        "predictedPrice": listing.predicted_price,
        "expectedDaysToSell": listing.expected_days_to_sell,
        "status": listing.status,
        "imageUrl": listing.image_url or listing.product.image_url,
        "seller": {"id": listing.seller.id, "name": listing.seller.full_name},
        "product": serialize_product(listing.product, include_passport=False),
        "passport": serialize_passport(listing.passport, include_product=False),
    }


def serialize_wardrobe_item(item: WardrobeItem) -> dict[str, Any]:
    predicted_value, _ = predict_resale(item.product, item.passport, item.product.brand, item.condition)
    return {
        "id": item.id,
        "nickname": item.nickname,
        "condition": item.condition,
        "status": item.status,
        "wearCount": item.wear_count,
        "repairCount": item.repair_count,
        "lastWornAt": item.last_worn_at.isoformat() if item.last_worn_at else None,
        "acquiredOn": item.acquired_on.isoformat() if item.acquired_on else None,
        "purchasePrice": item.purchase_price,
        "notes": item.notes,
        "resaleOpportunity": predicted_value,
        "product": serialize_product(item.product, include_passport=False),
        "passport": serialize_passport(item.passport, include_product=False),
        "events": [
            {
                "id": event.id,
                "eventType": event.event_type,
                "note": event.note,
                "createdAt": event.created_at.isoformat(),
            }
            for event in sorted(item.events, key=lambda event: event.created_at, reverse=True)
        ],
    }


def serialize_verification_request(request: VerificationRequest) -> dict[str, Any]:
    return {
        "id": request.id,
        "requestType": request.request_type,
        "productName": request.product_name,
        "brandName": request.brand_name,
        "status": request.status,
        "payload": json_loads(request.payload_json, {}),
        "reviewNotes": request.review_notes,
        "submittedAt": request.submitted_at.isoformat(),
        "reviewedAt": request.reviewed_at.isoformat() if request.reviewed_at else None,
        "submitter": {"id": request.submitter.id, "name": request.submitter.full_name} if request.submitter else None,
    }


def calculate_wardrobe_insights(items: list[WardrobeItem]) -> dict[str, Any]:
    if not items:
        return {
            "inventoryCount": 0,
            "usageRate": 0,
            "outfitPotential": 0,
            "totalWardrobeValue": 0,
            "resaleValue": 0,
            "unusedClothingValue": 0,
            "repairReadyCount": 0,
            "recommendations": [],
        }

    total_value = 0.0
    total_resale = 0.0
    unused_value = 0.0
    repair_ready = 0
    worn_items = 0
    categories = set()

    for item in items:
        predicted, _ = predict_resale(item.product, item.passport, item.product.brand, item.condition)
        total_value += item.product.msrp
        total_resale += predicted
        categories.add(item.product.category)
        if item.wear_count > 0:
            worn_items += 1
        else:
            unused_value += predicted
        if item.condition.lower() in {"fair", "repairable"}:
            repair_ready += 1

    usage_rate = round((worn_items / len(items)) * 100)
    outfit_potential = len(categories) * max(1, len(items) // 2)

    recommendations = []
    if repair_ready:
        recommendations.append("Schedule repair work on lower-condition pieces to protect long-term wardrobe value.")
    if unused_value:
        recommendations.append("List low-wear pieces with verified passports to unlock dormant resale value.")
    if usage_rate < 60:
        recommendations.append("Use the styling engine to remix forgotten wardrobe items into new outfits.")
    if not recommendations:
        recommendations.append("Your wardrobe is performing well. Keep logging wear data to sharpen insights.")

    return {
        "inventoryCount": len(items),
        "usageRate": usage_rate,
        "outfitPotential": outfit_potential,
        "totalWardrobeValue": round(total_value, 2),
        "resaleValue": round(total_resale, 2),
        "unusedClothingValue": round(unused_value, 2),
        "repairReadyCount": repair_ready,
        "recommendations": recommendations,
    }


def generate_outfits(items: list[WardrobeItem]) -> list[dict[str, Any]]:
    tops = [item for item in items if item.product.category.lower() in {"top", "shirt", "knitwear"}]
    bottoms = [item for item in items if item.product.category.lower() in {"bottom", "trouser", "skirt"}]
    outerwear = [item for item in items if item.product.category.lower() == "outerwear"]
    dresses = [item for item in items if item.product.category.lower() == "dress"]
    accessories = [item for item in items if item.product.category.lower() == "accessories"]

    outfits: list[dict[str, Any]] = []

    for dress in dresses[:2]:
        accent = accessories[0] if accessories else None
        outfits.append(
            {
                "title": f"{dress.product.base_color.title()} one-piece reset",
                "summary": "Lean into rewear by elevating a single hero garment with texture and polish.",
                "items": [serialize_wardrobe_item(dress)] + ([serialize_wardrobe_item(accent)] if accent else []),
            }
        )

    combinations = zip(tops[:3], bottoms[:3], outerwear[:3] or [None] * max(1, len(tops[:3])))
    for top, bottom, layer in combinations:
        item_payloads = [serialize_wardrobe_item(top), serialize_wardrobe_item(bottom)]
        if layer:
            item_payloads.append(serialize_wardrobe_item(layer))
        outfits.append(
            {
                "title": f"{top.product.base_color.title()} + {bottom.product.base_color.title()} capsule blend",
                "summary": "Balanced color pairing designed to increase repeat wear while keeping the silhouette premium.",
                "items": item_payloads,
            }
        )

    return outfits[:4]


def save_upload(file: UploadFile) -> str:
    suffix = Path(file.filename or "upload.bin").suffix or ".bin"
    filename = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{secrets.token_hex(6)}{suffix}"
    destination = UPLOADS_DIR / filename
    file.file.seek(0)
    destination.write_bytes(file.file.read())
    return f"/static/uploads/{filename}"


def _score_scan_match(scan_blob: str, product: Product, passport: DigitalPassport) -> float:
    keywords = " ".join(
        [
            product.name,
            product.product_code,
            product.garment_type,
            product.category,
            product.base_color,
            product.materials_summary,
            product.ai_fingerprint,
            passport.passport_id,
            passport.qr_code,
            passport.barcode,
            passport.nfc_tag,
            product.brand.name,
        ]
    ).lower()
    token_hits = [token for token in set(scan_blob.split()) if token and token in keywords]
    return min(0.99, 0.18 + len(token_hits) * 0.11)


def lookup_passport_match(
    db: Session,
    scan_type: str,
    scan_value: str,
    hints: str = "",
    user: Optional[User] = None,
) -> Tuple[Optional[DigitalPassport], float]:
    normalized_value = (scan_value or "").strip().lower()
    normalized_hints = (hints or "").strip().lower()

    passports = db.scalars(
        select(DigitalPassport)
        .options(
            joinedload(DigitalPassport.product).joinedload(Product.brand),
            selectinload(DigitalPassport.journey_steps),
        )
    ).all()

    matched_passport = None
    confidence = 0.0

    if scan_type in {"qr", "barcode", "nfc", "passport"}:
        field_name = {
            "qr": DigitalPassport.qr_code,
            "barcode": DigitalPassport.barcode,
            "nfc": DigitalPassport.nfc_tag,
            "passport": DigitalPassport.passport_id,
        }[scan_type]
        matched_passport = db.scalar(
            select(DigitalPassport)
            .where(func.lower(field_name) == normalized_value)
            .options(
                joinedload(DigitalPassport.product).joinedload(Product.brand),
                selectinload(DigitalPassport.journey_steps),
            )
        )
        confidence = 0.98 if matched_passport else 0.0

    if not matched_passport and normalized_value:
        blob = f"{normalized_value} {normalized_hints}".strip()
        for passport in passports:
            score = _score_scan_match(blob, passport.product, passport)
            if score > confidence:
                matched_passport = passport
                confidence = score

    matched_passport = matched_passport if confidence >= 0.34 else None

    db.add(
        ScanHistory(
            user_id=user.id if user else None,
            scan_type=scan_type,
            scan_value=scan_value[:500],
            matched_passport_id=matched_passport.id if matched_passport else None,
            confidence=round(confidence, 2),
        )
    )
    db.commit()
    return matched_passport, round(confidence, 2)


def create_wardrobe_event(db: Session, item: WardrobeItem, event_type: str, note: str = "") -> WardrobeEvent:
    event = WardrobeEvent(wardrobe_item_id=item.id, event_type=event_type, note=note)
    db.add(event)

    if event_type == "worn":
        item.wear_count += 1
        item.status = "worn"
        item.last_worn_at = datetime.utcnow()
    elif event_type == "repaired":
        item.repair_count += 1
        item.status = "repaired"
    elif event_type in {"donated", "resold", "recycled"}:
        item.status = event_type

    db.commit()
    db.refresh(item)
    return event


def fetch_dashboard_bundle(db: Session, user: Optional[User]) -> dict[str, Any]:
    brands = db.scalars(select(Brand).order_by(Brand.transparency_score.desc())).all()
    suppliers = db.scalars(
        select(Supplier).options(selectinload(Supplier.brand_links).joinedload(SupplierBrandLink.brand)).order_by(Supplier.region, Supplier.name)
    ).all()
    listings = db.scalars(
        select(MarketplaceListing)
        .where(MarketplaceListing.status == "active")
        .options(
            joinedload(MarketplaceListing.product).joinedload(Product.brand),
            joinedload(MarketplaceListing.passport),
            joinedload(MarketplaceListing.seller),
        )
        .order_by(MarketplaceListing.created_at.desc())
    ).all()
    products = db.scalars(
        select(Product)
        .options(joinedload(Product.brand), selectinload(Product.passport).selectinload(DigitalPassport.journey_steps))
        .order_by(Product.created_at.desc())
    ).all()

    user_bundle = None
    if user:
        wardrobe_items = db.scalars(
            select(WardrobeItem)
            .where(WardrobeItem.user_id == user.id)
            .options(
                joinedload(WardrobeItem.product).joinedload(Product.brand),
                joinedload(WardrobeItem.passport).selectinload(DigitalPassport.journey_steps),
                selectinload(WardrobeItem.events),
            )
            .order_by(WardrobeItem.created_at.desc())
        ).all()
        user_bundle = {
            "profile": {"id": user.id, "fullName": user.full_name, "email": user.email, "role": user.role},
            "wardrobe": [serialize_wardrobe_item(item) for item in wardrobe_items],
            "insights": calculate_wardrobe_insights(wardrobe_items),
            "outfits": generate_outfits(wardrobe_items),
        }

    return {
        "app": {
            "name": "Circular Finder",
            "philosophy": ["Reuse", "Repair", "Reimagine"],
        },
        "brands": [serialize_brand(brand) for brand in brands],
        "knownBrandOptions": [{"id": brand.id, "name": brand.name, "slug": brand.slug} for brand in brands if brand.is_verified],
        "suppliers": [serialize_supplier(supplier) for supplier in suppliers],
        "products": [serialize_product(product) for product in products],
        "marketplace": [serialize_listing(listing) for listing in listings],
        "user": user_bundle,
    }

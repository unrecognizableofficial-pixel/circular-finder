from datetime import date, datetime
from pathlib import Path
from typing import Any, Optional

import os

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, Request, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from .database import Base, SessionLocal, engine, get_db
from .models import Brand, DigitalPassport, MarketplaceListing, MarketplaceOrder, Product, Supplier, SupplierBrandLink, User, VerificationRequest, WardrobeItem
from .seed import seed_database
from .services import (
    create_access_token,
    create_wardrobe_event,
    fetch_dashboard_bundle,
    get_admin_user,
    get_brand_from_key,
    get_current_user,
    get_optional_user,
    json_dumps,
    json_loads,
    lookup_passport_match,
    now_utc,
    predict_resale,
    save_upload,
    serialize_listing,
    serialize_passport,
    serialize_supplier,
    serialize_verification_request,
    serialize_wardrobe_item,
    verify_password,
)


BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(title="Circular Finder", version="1.0.0")
allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://127.0.0.1:3000,http://localhost:3000,http://127.0.0.1:8000,http://localhost:8000",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


@app.on_event("startup")
def startup_event() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_database(db)


class RegisterPayload(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=120)


class LoginPayload(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=120)


class ScanPayload(BaseModel):
    scan_type: str
    scan_value: str = ""
    hints: str = ""


class WardrobeCreatePayload(BaseModel):
    passport_id: str
    nickname: str = ""
    condition: str = "excellent"
    purchase_price: Optional[float] = None
    acquired_on: Optional[date] = None
    notes: str = ""


class WardrobeEventPayload(BaseModel):
    event_type: str
    note: str = ""


class VerificationCreatePayload(BaseModel):
    request_type: str = "product_passport"
    product_name: str
    brand_name: str
    brand_website: Optional[str] = None
    target_demographic: Optional[str] = None
    materials: list[str] = Field(default_factory=list)
    country_of_origin: Optional[str] = None
    notes: str = ""
    image_url: Optional[str] = None


class ListingCreatePayload(BaseModel):
    passport_id: str
    wardrobe_item_id: Optional[int] = None
    title: str
    description: str = ""
    size_label: str
    condition: str
    price: float
    image_url: Optional[str] = None


class OrderCreatePayload(BaseModel):
    listing_id: int
    shipping_address: str


class ReviewPayload(BaseModel):
    status: str
    review_notes: str = ""


class BrandApiPayload(BaseModel):
    product_code: str
    name: str
    garment_type: str
    category: str
    target_demographic: str
    base_color: str
    materials_summary: str
    msrp: float
    product_story: str = ""
    image_url: str = ""
    style_tags: list[str] = Field(default_factory=list)
    ai_fingerprint: str = ""
    passport: dict[str, Any]
    journey: list[dict[str, Any]] = Field(default_factory=list)


@app.get("/", response_class=HTMLResponse)
def index(request: Request) -> HTMLResponse:
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "title": "Circular Finder",
            "philosophy": ["Reuse", "Repair", "Reimagine"],
        },
    )


@app.get("/api/bootstrap")
def bootstrap(user: Optional[User] = Depends(get_optional_user), db: Session = Depends(get_db)) -> JSONResponse:
    return JSONResponse(fetch_dashboard_bundle(db, user))


@app.post("/api/auth/register")
def register(payload: RegisterPayload, db: Session = Depends(get_db)) -> JSONResponse:
    existing = db.scalar(select(User).where(User.email == payload.email.lower()))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account already exists for this email.")
    from .services import hash_password

    user = User(full_name=payload.full_name.strip(), email=payload.email.lower(), password_hash=hash_password(payload.password), role="user")
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user)
    return JSONResponse({"token": token, "user": {"id": user.id, "fullName": user.full_name, "email": user.email, "role": user.role}})


@app.post("/api/auth/login")
def login(payload: LoginPayload, db: Session = Depends(get_db)) -> JSONResponse:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password.")
    token = create_access_token(user)
    return JSONResponse({"token": token, "user": {"id": user.id, "fullName": user.full_name, "email": user.email, "role": user.role}})


@app.get("/api/auth/me")
def auth_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> JSONResponse:
    return JSONResponse(fetch_dashboard_bundle(db, user)["user"])


@app.post("/api/scan/lookup")
def scan_lookup(payload: ScanPayload, user: Optional[User] = Depends(get_optional_user), db: Session = Depends(get_db)) -> JSONResponse:
    matched_passport, confidence = lookup_passport_match(db, payload.scan_type.lower(), payload.scan_value, payload.hints, user=user)
    if not matched_passport:
        response = {
            "recognized": False,
            "confidence": confidence,
            "message": "No verified passport matched this garment yet. Submit it for passport creation and verification.",
            "nextStep": "verification",
        }
        return JSONResponse(response)
    return JSONResponse({"recognized": True, "confidence": confidence, "passport": serialize_passport(matched_passport)})


@app.post("/api/scan/upload")
async def scan_upload(
    file: UploadFile = File(...),
    hints: str = Form(default=""),
    brand_hint: str = Form(default=""),
    user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
) -> JSONResponse:
    stored_url = save_upload(file)
    scan_blob = f"{file.filename} {hints} {brand_hint}".strip()
    matched_passport, confidence = lookup_passport_match(db, "image", scan_blob, hints, user=user)
    if not matched_passport:
        return JSONResponse(
            {
                "recognized": False,
                "confidence": confidence,
                "uploadedImageUrl": stored_url,
                "message": "Image recognition could not confidently match a verified product. You can submit this garment for verification.",
            }
        )
    return JSONResponse({"recognized": True, "confidence": confidence, "uploadedImageUrl": stored_url, "passport": serialize_passport(matched_passport)})


@app.post("/api/verification/passports")
def create_verification_request(payload: VerificationCreatePayload, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> JSONResponse:
    request = VerificationRequest(
        request_type=payload.request_type,
        submitter_id=user.id,
        product_name=payload.product_name,
        brand_name=payload.brand_name,
        status="pending",
        payload_json=json_dumps(
            {
                "brandWebsite": payload.brand_website,
                "targetDemographic": payload.target_demographic,
                "materials": payload.materials,
                "countryOfOrigin": payload.country_of_origin,
                "notes": payload.notes,
                "imageUrl": payload.image_url,
            }
        ),
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return JSONResponse({"message": "Submitted to the digital passport verification pipeline.", "request": serialize_verification_request(request)})


@app.get("/api/passports/{passport_id}")
def get_passport(passport_id: str, db: Session = Depends(get_db)) -> JSONResponse:
    passport = db.scalar(
        select(DigitalPassport)
        .where(DigitalPassport.passport_id == passport_id)
        .options(
            joinedload(DigitalPassport.product).joinedload(Product.brand),
            selectinload(DigitalPassport.journey_steps),
        )
    )
    if not passport:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Passport not found.")
    return JSONResponse(serialize_passport(passport))


@app.get("/api/brands")
def list_brands(search: str = "", demographic: str = "", db: Session = Depends(get_db)) -> JSONResponse:
    brands = db.scalars(select(Brand).order_by(Brand.transparency_score.desc())).all()
    query = search.strip().lower()
    demographic_lower = demographic.strip().lower()

    filtered = []
    for brand in brands:
        demographics = [item.lower() for item in json_loads(brand.demographics_json, [])]
        matches_search = not query or query in brand.name.lower() or query in brand.description.lower()
        matches_demo = not demographic_lower or demographic_lower in demographics
        if matches_search and matches_demo:
            filtered.append(brand)
    return JSONResponse({"items": [serialize_brand(brand) for brand in filtered]})


@app.get("/api/suppliers/map")
def supplier_map(
    search: str = "",
    brand: str = "",
    country: str = "",
    supplier_type: str = "",
    region: str = "",
    certification: str = "",
    material: str = "",
    labor_standard: str = "",
    demographic: str = "",
    verified_only: bool = False,
    db: Session = Depends(get_db),
) -> JSONResponse:
    suppliers = db.scalars(
        select(Supplier).options(selectinload(Supplier.brand_links).joinedload(SupplierBrandLink.brand)).order_by(Supplier.region, Supplier.name)
    ).all()
    search_filter = search.strip().lower()
    brand_filter = brand.strip().lower()
    country_filter = country.strip().lower()
    supplier_type_filter = supplier_type.strip().lower()
    region_filter = region.strip().lower()
    certification_filter = certification.strip().lower()
    material_filter = material.strip().lower()
    labor_filter = labor_standard.strip().lower()
    demographic_filter = demographic.strip().lower()

    filtered = []
    for supplier in suppliers:
        supplier_brands = [link.brand for link in supplier.brand_links]
        certs = [item.lower() for item in json_loads(supplier.certifications_json, [])]
        materials = [item.lower() for item in json_loads(supplier.materials_json, [])]
        brand_names = [brand.name.lower() for brand in supplier_brands]
        demographics = [demo.lower() for brand in supplier_brands for demo in json_loads(brand.demographics_json, [])]
        search_targets = [
            supplier.name.lower(),
            supplier.region.lower(),
            supplier.country.lower(),
            supplier.city.lower(),
            supplier.supplier_type.lower(),
            supplier.labor_standard.lower(),
            *certs,
            *materials,
            *brand_names,
            *demographics,
        ]

        matches = (
            (not search_filter or any(search_filter in target for target in search_targets))
            and (not brand_filter or brand_filter in brand_names)
            and (not country_filter or country_filter in supplier.country.lower())
            and (not supplier_type_filter or supplier_type_filter in supplier.supplier_type.lower())
            and (not region_filter or region_filter in supplier.region.lower() or region_filter in supplier.country.lower())
            and (not certification_filter or certification_filter in certs)
            and (not material_filter or material_filter in materials)
            and (not labor_filter or labor_filter in supplier.labor_standard.lower())
            and (not demographic_filter or demographic_filter in demographics)
            and (not verified_only or supplier.is_verified)
        )
        if matches:
            filtered.append(supplier)
    return JSONResponse({"items": [serialize_supplier(supplier) for supplier in filtered]})


@app.get("/api/marketplace/listings")
def list_marketplace(search: str = "", brand: str = "", db: Session = Depends(get_db)) -> JSONResponse:
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
    query = search.strip().lower()
    brand_filter = brand.strip().lower()
    filtered = []
    for listing in listings:
        haystack = f"{listing.title} {listing.description} {listing.product.name} {listing.product.brand.name}".lower()
        if query and query not in haystack:
            continue
        if brand_filter and brand_filter != listing.product.brand.name.lower():
            continue
        filtered.append(listing)
    return JSONResponse({"items": [serialize_listing(listing) for listing in filtered]})


@app.post("/api/marketplace/listings")
def create_listing(payload: ListingCreatePayload, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> JSONResponse:
    passport = db.scalar(
        select(DigitalPassport)
        .where(DigitalPassport.passport_id == payload.passport_id)
        .options(joinedload(DigitalPassport.product).joinedload(Product.brand))
    )
    if not passport or passport.passport_status != "verified":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only products with verified digital passports can be listed in the resale marketplace.",
        )

    wardrobe_item = None
    if payload.wardrobe_item_id:
        wardrobe_item = db.scalar(
            select(WardrobeItem)
            .where(WardrobeItem.id == payload.wardrobe_item_id, WardrobeItem.user_id == user.id)
            .options(joinedload(WardrobeItem.product).joinedload(Product.brand), joinedload(WardrobeItem.passport))
        )
        if not wardrobe_item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wardrobe item not found for this account.")
        if wardrobe_item.passport_id != passport.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Wardrobe item passport does not match listing passport.")

    predicted_price, expected_days = predict_resale(passport.product, passport, passport.product.brand, payload.condition)
    listing = MarketplaceListing(
        seller_id=user.id,
        product_id=passport.product.id,
        passport_id=passport.id,
        wardrobe_item_id=wardrobe_item.id if wardrobe_item else None,
        title=payload.title,
        description=payload.description,
        size_label=payload.size_label,
        condition=payload.condition,
        price=payload.price,
        predicted_price=predicted_price,
        expected_days_to_sell=expected_days,
        image_url=payload.image_url or passport.product.image_url,
        status="active",
    )
    db.add(listing)
    if wardrobe_item:
        wardrobe_item.status = "resale-listed"
    db.commit()
    db.refresh(listing)
    listing = db.scalar(
        select(MarketplaceListing)
        .where(MarketplaceListing.id == listing.id)
        .options(
            joinedload(MarketplaceListing.product).joinedload(Product.brand),
            joinedload(MarketplaceListing.passport),
            joinedload(MarketplaceListing.seller),
        )
    )
    return JSONResponse({"message": "Listing created with verified passport transparency.", "listing": serialize_listing(listing)})


@app.post("/api/marketplace/orders")
def create_order(payload: OrderCreatePayload, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> JSONResponse:
    listing = db.scalar(
        select(MarketplaceListing)
        .where(MarketplaceListing.id == payload.listing_id)
        .options(
            joinedload(MarketplaceListing.product).joinedload(Product.brand),
            joinedload(MarketplaceListing.passport),
            joinedload(MarketplaceListing.seller),
        )
    )
    if not listing or listing.status != "active":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing is no longer available.")
    if listing.seller_id == user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot purchase your own listing.")

    order = MarketplaceOrder(
        listing_id=listing.id,
        buyer_id=user.id,
        total_price=listing.price,
        shipping_address=payload.shipping_address,
        order_status="paid",
        tracking_reference=f"CF-{listing.id:04d}-{user.id:04d}",
    )
    listing.status = "sold"
    if listing.wardrobe_item:
        listing.wardrobe_item.status = "resold"
    db.add(order)
    db.commit()
    return JSONResponse(
        {
            "message": "Purchase confirmed. Order tracking has started.",
            "order": {
                "id": order.id,
                "trackingReference": order.tracking_reference,
                "orderStatus": order.order_status,
                "totalPrice": order.total_price,
            },
        }
    )


@app.get("/api/wardrobe")
def get_wardrobe(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> JSONResponse:
    from .services import calculate_wardrobe_insights, generate_outfits

    items = db.scalars(
        select(WardrobeItem)
        .where(WardrobeItem.user_id == user.id)
        .options(
            joinedload(WardrobeItem.product).joinedload(Product.brand),
            joinedload(WardrobeItem.passport).selectinload(DigitalPassport.journey_steps),
            selectinload(WardrobeItem.events),
        )
        .order_by(WardrobeItem.created_at.desc())
    ).all()
    return JSONResponse(
        {
            "items": [serialize_wardrobe_item(item) for item in items],
            "insights": calculate_wardrobe_insights(items),
            "outfits": generate_outfits(items),
        }
    )


@app.post("/api/wardrobe/items")
def create_wardrobe_item(payload: WardrobeCreatePayload, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> JSONResponse:
    passport = db.scalar(
        select(DigitalPassport)
        .where(DigitalPassport.passport_id == payload.passport_id)
        .options(joinedload(DigitalPassport.product).joinedload(Product.brand), selectinload(DigitalPassport.journey_steps))
    )
    if not passport:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Digital passport not found.")

    item = WardrobeItem(
        user_id=user.id,
        product_id=passport.product.id,
        passport_id=passport.id,
        nickname=payload.nickname,
        condition=payload.condition,
        purchase_price=payload.purchase_price,
        acquired_on=payload.acquired_on,
        notes=payload.notes,
        status="active",
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    item = db.scalar(
        select(WardrobeItem)
        .where(WardrobeItem.id == item.id)
        .options(
            joinedload(WardrobeItem.product).joinedload(Product.brand),
            joinedload(WardrobeItem.passport).selectinload(DigitalPassport.journey_steps),
            selectinload(WardrobeItem.events),
        )
    )
    return JSONResponse({"message": "Added to your wardrobe dashboard.", "item": serialize_wardrobe_item(item)})


@app.post("/api/wardrobe/items/{item_id}/events")
def add_wardrobe_event(item_id: int, payload: WardrobeEventPayload, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> JSONResponse:
    item = db.scalar(
        select(WardrobeItem)
        .where(WardrobeItem.id == item_id, WardrobeItem.user_id == user.id)
        .options(
            joinedload(WardrobeItem.product).joinedload(Product.brand),
            joinedload(WardrobeItem.passport).selectinload(DigitalPassport.journey_steps),
            selectinload(WardrobeItem.events),
        )
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wardrobe item not found.")
    create_wardrobe_event(db, item, payload.event_type, payload.note)
    item = db.scalar(
        select(WardrobeItem)
        .where(WardrobeItem.id == item_id)
        .options(
            joinedload(WardrobeItem.product).joinedload(Product.brand),
            joinedload(WardrobeItem.passport).selectinload(DigitalPassport.journey_steps),
            selectinload(WardrobeItem.events),
        )
    )
    return JSONResponse({"message": "Wardrobe history updated.", "item": serialize_wardrobe_item(item)})


@app.get("/api/styling/outfits")
def get_outfits(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> JSONResponse:
    from .services import generate_outfits

    items = db.scalars(
        select(WardrobeItem)
        .where(WardrobeItem.user_id == user.id)
        .options(
            joinedload(WardrobeItem.product).joinedload(Product.brand),
            joinedload(WardrobeItem.passport),
            selectinload(WardrobeItem.events),
        )
    ).all()
    return JSONResponse({"items": generate_outfits(items)})


@app.get("/api/admin/verification-requests")
def admin_verifications(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)) -> JSONResponse:
    requests = db.scalars(
        select(VerificationRequest).options(joinedload(VerificationRequest.submitter)).order_by(VerificationRequest.submitted_at.desc())
    ).all()
    return JSONResponse({"items": [serialize_verification_request(request) for request in requests], "viewer": {"id": admin.id, "role": admin.role}})


@app.post("/api/admin/verification-requests/{request_id}/review")
def review_verification_request(
    request_id: int,
    payload: ReviewPayload,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
) -> JSONResponse:
    request = db.get(VerificationRequest, request_id)
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Verification request not found.")

    request.status = payload.status
    request.review_notes = payload.review_notes
    request.reviewer_id = admin.id
    request.reviewed_at = datetime.utcnow()
    db.commit()
    db.refresh(request)
    return JSONResponse({"message": "Verification request reviewed.", "request": serialize_verification_request(request)})


@app.post("/api/brands/api/passports")
def brand_api_create_passport(
    payload: BrandApiPayload,
    x_brand_key: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> JSONResponse:
    brand = get_brand_from_key(db, x_brand_key)
    existing = db.scalar(select(Product).where(Product.product_code == payload.product_code))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A product already exists with this product code.")

    product = Product(
        brand_id=brand.id,
        product_code=payload.product_code,
        name=payload.name,
        garment_type=payload.garment_type,
        category=payload.category,
        target_demographic=payload.target_demographic,
        base_color=payload.base_color,
        materials_summary=payload.materials_summary,
        msrp=payload.msrp,
        product_story=payload.product_story,
        image_url=payload.image_url,
        style_tags_json=json_dumps(payload.style_tags),
        ai_fingerprint=payload.ai_fingerprint,
    )
    db.add(product)
    db.flush()

    passport_payload = dict(payload.passport)
    passport_payload["product_id"] = product.id
    passport_payload.setdefault("passport_status", "verified")
    passport_payload.setdefault("verified_at", now_utc())
    passport = DigitalPassport(**passport_payload)
    db.add(passport)
    db.flush()

    for index, step in enumerate(payload.journey, start=1):
        supplier = db.scalar(select(Supplier).where(Supplier.name == step["name"]))
        if not supplier:
            supplier = Supplier(
                name=step["name"],
                supplier_type=step.get("stepType", "Supplier"),
                region=step.get("region", step.get("country", "Unknown")),
                country=step.get("country", "Unknown"),
                city=step.get("city", ""),
                latitude=step.get("latitude", 0.0),
                longitude=step.get("longitude", 0.0),
                certifications_json=json_dumps(step.get("certifications", [])),
                materials_json=json_dumps(step.get("materials", [])),
                labor_standard=step.get("laborStandard", "Pending verification"),
                transparency_notes=step.get("details", ""),
                is_verified=False,
            )
            db.add(supplier)
            db.flush()
            db.add(
                SupplierBrandLink(
                    supplier_id=supplier.id,
                    brand_id=brand.id,
                    relationship_type=step.get("stepType", "Supplier"),
                )
            )
        from .models import ProductJourneyStep

        db.add(
            ProductJourneyStep(
                passport_id=passport.id,
                supplier_id=supplier.id,
                step_order=index,
                step_type=step.get("stepType", "Supplier"),
                name=supplier.name,
                country=supplier.country,
                latitude=supplier.latitude,
                longitude=supplier.longitude,
                details=step.get("details", ""),
            )
        )
    db.commit()
    passport = db.scalar(
        select(DigitalPassport)
        .where(DigitalPassport.id == passport.id)
        .options(joinedload(DigitalPassport.product).joinedload(Product.brand), selectinload(DigitalPassport.journey_steps))
    )
    return JSONResponse({"message": "Brand passport created.", "passport": serialize_passport(passport)})


@app.get("/api/admin/dashboard")
def admin_dashboard(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)) -> JSONResponse:
    pending_requests = db.scalars(select(VerificationRequest).where(VerificationRequest.status == "pending")).all()
    pending_brand_names = [request.brand_name for request in pending_requests if request.brand_name]
    recent_brands = db.scalars(select(Brand).order_by(Brand.created_at.desc())).all()
    return JSONResponse(
        {
            "viewer": {"id": admin.id, "role": admin.role},
            "pendingCount": len(pending_requests),
            "pendingBrands": pending_brand_names,
            "recentBrands": [brand.name for brand in recent_brands[:5]],
        }
    )

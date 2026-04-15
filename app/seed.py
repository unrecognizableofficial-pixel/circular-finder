from datetime import date, datetime

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from .models import (
    Brand,
    DigitalPassport,
    MarketplaceListing,
    MarketplaceOrder,
    Product,
    ProductJourneyStep,
    Supplier,
    SupplierBrandLink,
    User,
    VerificationRequest,
    WardrobeEvent,
    WardrobeItem,
)
from .services import hash_password, json_dumps, predict_resale, slugify


def _brand_payloads():
    return [
        {
            "name": "Eterna Loom",
            "description": "Luxury essentials built on traceable fibers, regenerative sourcing, and repair-first design.",
            "headquarters_region": "London, United Kingdom",
            "transparency_score": 94,
            "sustainability_rating": 4.8,
            "demographics_json": json_dumps(["Women", "Men", "Unisex", "Professionals"]),
            "certifications_json": json_dumps(["GOTS", "B Corp", "Fair Trade"]),
            "website": "https://eternaloom.example",
            "api_key": "brand_eternaloom_dev_key",
        },
        {
            "name": "Aureline",
            "description": "Precision tailoring with durable natural fibers, fully indexed through digital passports.",
            "headquarters_region": "Copenhagen, Denmark",
            "transparency_score": 91,
            "sustainability_rating": 4.6,
            "demographics_json": json_dumps(["Women", "Professionals", "Unisex"]),
            "certifications_json": json_dumps(["B Corp", "OEKO-TEX", "SA8000"]),
            "website": "https://aureline.example",
            "api_key": "brand_aureline_dev_key",
        },
        {
            "name": "Loop Standard",
            "description": "Circular denim and outerwear with buy-back guarantees and resale-ready product records.",
            "headquarters_region": "Los Angeles, United States",
            "transparency_score": 88,
            "sustainability_rating": 4.4,
            "demographics_json": json_dumps(["Men", "Women", "Gen Z", "Streetwear"]),
            "certifications_json": json_dumps(["Climate Neutral", "GRS"]),
            "website": "https://loopstandard.example",
            "api_key": "brand_loopstandard_dev_key",
        },
        {
            "name": "Renewal Atelier",
            "description": "Design-led knitwear that treats repair, re-dye, and resale as part of the original product strategy.",
            "headquarters_region": "Seoul, South Korea",
            "transparency_score": 86,
            "sustainability_rating": 4.2,
            "demographics_json": json_dumps(["Women", "Creative", "Minimalist"]),
            "certifications_json": json_dumps(["Responsible Wool Standard", "OEKO-TEX"]),
            "website": "https://renewalatelier.example",
            "api_key": "brand_renewalatelier_dev_key",
        },
    ]


def seed_database(db: Session) -> None:
    has_users = db.scalar(select(User).limit(1))
    has_products = db.scalar(select(Product).limit(1))
    if has_users and has_products:
        return
    if has_users or db.scalar(select(Brand).limit(1)):
        for model in [
            MarketplaceOrder,
            MarketplaceListing,
            WardrobeEvent,
            WardrobeItem,
            ProductJourneyStep,
            DigitalPassport,
            VerificationRequest,
            SupplierBrandLink,
            Supplier,
            Product,
            Brand,
            User,
        ]:
            db.execute(delete(model))
        db.commit()

    admin = User(full_name="Circular Finder Admin", email="admin@circularfinder.com", password_hash=hash_password("Circular123!"), role="admin")
    mia = User(full_name="Mia Alvarez", email="mia@circularfinder.com", password_hash=hash_password("Circular123!"), role="user")
    db.add_all([admin, mia])
    db.flush()

    brands_by_name: dict[str, Brand] = {}
    for payload in _brand_payloads():
        brand = Brand(slug=slugify(payload["name"]), **payload)
        db.add(brand)
        db.flush()
        brands_by_name[brand.name] = brand

    suppliers = [
        Supplier(
            name="Vidarbha Regenerative Cotton Collective",
            supplier_type="Cotton Farm",
            region="South Asia",
            country="India",
            city="Nagpur",
            latitude=21.1458,
            longitude=79.0882,
            certifications_json=json_dumps(["GOTS", "Regenerative Organic"]),
            materials_json=json_dumps(["Organic Cotton"]),
            labor_standard="Farmer-owned cooperative",
            transparency_notes="Farmer cooperatives publish seasonal soil and water restoration metrics.",
        ),
        Supplier(
            name="Porto Trace Textile Mill",
            supplier_type="Textile Mill",
            region="Europe",
            country="Portugal",
            city="Porto",
            latitude=41.1579,
            longitude=-8.6291,
            certifications_json=json_dumps(["OEKO-TEX", "ISO 14001"]),
            materials_json=json_dumps(["Organic Cotton", "TENCEL"]),
            labor_standard="Collective bargaining in place",
            transparency_notes="Low-impact finishing and fiber traceability are integrated at batch level.",
        ),
        Supplier(
            name="Biella Renewal Wool House",
            supplier_type="Textile Mill",
            region="Europe",
            country="Italy",
            city="Biella",
            latitude=45.5628,
            longitude=8.0583,
            certifications_json=json_dumps(["Responsible Wool Standard"]),
            materials_json=json_dumps(["Merino Wool", "Recycled Cashmere"]),
            labor_standard="Third-party audited",
            transparency_notes="Specialized in repair-friendly knit structures and recycled yarn blending.",
        ),
        Supplier(
            name="Hue Waterless Dye Lab",
            supplier_type="Dye Facility",
            region="Southeast Asia",
            country="Vietnam",
            city="Hue",
            latitude=16.4637,
            longitude=107.5909,
            certifications_json=json_dumps(["ZDHC", "Bluesign"]),
            materials_json=json_dumps(["Natural Dyes", "Low-impact Pigments"]),
            labor_standard="SA8000 aligned",
            transparency_notes="Publishes chemistry disclosures and dye-bath recovery rates.",
        ),
        Supplier(
            name="Da Nang Circular Factory",
            supplier_type="Garment Factory",
            region="Southeast Asia",
            country="Vietnam",
            city="Da Nang",
            latitude=16.0544,
            longitude=108.2022,
            certifications_json=json_dumps(["Fair Trade", "WRAP Platinum"]),
            materials_json=json_dumps(["Organic Cotton", "TENCEL", "Wool"]),
            labor_standard="Living wage verified",
            transparency_notes="Line-level defect and repairability data are linked directly to product passports.",
        ),
        Supplier(
            name="Los Angeles Renewal Studio",
            supplier_type="Repair Hub",
            region="North America",
            country="United States",
            city="Los Angeles",
            latitude=34.0522,
            longitude=-118.2437,
            certifications_json=json_dumps(["Circularity Lab Verified"]),
            materials_json=json_dumps(["Repairs", "Tailoring", "Upcycling"]),
            labor_standard="Local artisan network",
            transparency_notes="Supports repair bookings, re-dye services, and resale conditioning.",
        ),
        Supplier(
            name="Copenhagen Brand House",
            supplier_type="Brand Headquarters",
            region="Europe",
            country="Denmark",
            city="Copenhagen",
            latitude=55.6761,
            longitude=12.5683,
            certifications_json=json_dumps(["B Corp"]),
            materials_json=json_dumps(["Operations"]),
            labor_standard="Public ESG reporting",
            transparency_notes="Publishes material innovation and lifecycle accountability goals.",
        ),
    ]
    db.add_all(suppliers)
    db.flush()

    supplier_by_name = {supplier.name: supplier for supplier in suppliers}

    links = [
        ("Vidarbha Regenerative Cotton Collective", "Eterna Loom", "Raw material source"),
        ("Porto Trace Textile Mill", "Eterna Loom", "Textile partner"),
        ("Hue Waterless Dye Lab", "Eterna Loom", "Dye partner"),
        ("Da Nang Circular Factory", "Eterna Loom", "Assembly"),
        ("Los Angeles Renewal Studio", "Eterna Loom", "Repair network"),
        ("Porto Trace Textile Mill", "Aureline", "Textile partner"),
        ("Copenhagen Brand House", "Aureline", "Headquarters"),
        ("Da Nang Circular Factory", "Aureline", "Assembly"),
        ("Vidarbha Regenerative Cotton Collective", "Loop Standard", "Raw material source"),
        ("Da Nang Circular Factory", "Loop Standard", "Assembly"),
        ("Biella Renewal Wool House", "Renewal Atelier", "Textile partner"),
        ("Los Angeles Renewal Studio", "Loop Standard", "Repair network"),
    ]
    for supplier_name, brand_name, relationship in links:
        db.add(
            SupplierBrandLink(
                supplier_id=supplier_by_name[supplier_name].id,
                brand_id=brands_by_name[brand_name].id,
                relationship_type=relationship,
            )
        )

    products_data = [
        {
            "product_code": "CF-EL-TRN-001",
            "brand_name": "Eterna Loom",
            "name": "Sage Meridian Trench",
            "garment_type": "Trench Coat",
            "category": "outerwear",
            "target_demographic": "Women",
            "base_color": "sage",
            "materials_summary": "Organic cotton twill with TENCEL lining",
            "msrp": 420.0,
            "image_url": "/static/images/trench.svg",
            "product_story": "Engineered for high repeat wear with modular buttons and traceable fabric lots.",
            "style_tags_json": json_dumps(["capsule", "tailored", "minimal"]),
            "ai_fingerprint": "sage trench coat organic cotton twill polished minimal outerwear eterna loom",
            "passport": {
                "passport_id": "DPP-EL-TRN-001",
                "manufacturer": "Eterna Loom Manufacturing",
                "factory_location": "Da Nang, Vietnam",
                "country_of_origin": "Vietnam",
                "material_composition_json": json_dumps(
                    [
                        {"material": "Organic Cotton", "percentage": 78},
                        {"material": "TENCEL Lyocell", "percentage": 22},
                    ]
                ),
                "carbon_kg": 16.4,
                "water_liters": 920.0,
                "sustainability_certifications_json": json_dumps(["GOTS", "Fair Trade", "ZDHC"]),
                "repair_instructions": "Reinforce cuff stitching after 70 wears. Replace corozo buttons through the repair hub if needed.",
                "recycling_instructions": "Detach lining and buttons before fiber recycling. Eligible for brand take-back.",
                "durability_rating": 92,
                "circularity_score": 95,
                "resale_estimate": 268.0,
                "qr_code": "QR-EL-TRN-001",
                "barcode": "880100010001",
                "nfc_tag": "NFC-EL-TRN-001",
                "journey": [
                    ("Raw Material Source", "Vidarbha Regenerative Cotton Collective", "Organic cotton harvested through regenerative irrigation baselines."),
                    ("Textile Mill", "Porto Trace Textile Mill", "Twill woven and indexed for batch-level traceability."),
                    ("Dye Facility", "Hue Waterless Dye Lab", "Low-water sage finish using chemistry disclosure tracking."),
                    ("Factory", "Da Nang Circular Factory", "Constructed with replaceable trims and repair notes."),
                    ("Brand", "Copenhagen Brand House", "Transparency reporting and QR provisioning handled here."),
                ],
            },
        },
        {
            "product_code": "CF-AU-SHR-014",
            "brand_name": "Aureline",
            "name": "Oatline Studio Shirt",
            "garment_type": "Overshirt",
            "category": "top",
            "target_demographic": "Unisex",
            "base_color": "oatmeal",
            "materials_summary": "Organic cotton poplin",
            "msrp": 185.0,
            "image_url": "/static/images/shirt.svg",
            "product_story": "Designed for desk-to-dinner wear cycles with hidden spare buttons in the hem.",
            "style_tags_json": json_dumps(["smart casual", "layering", "minimal"]),
            "ai_fingerprint": "oatmeal shirt overshirt poplin cotton aureline minimal capsule",
            "passport": {
                "passport_id": "DPP-AU-SHR-014",
                "manufacturer": "Aureline Atelier",
                "factory_location": "Da Nang, Vietnam",
                "country_of_origin": "Vietnam",
                "material_composition_json": json_dumps([{"material": "Organic Cotton", "percentage": 100}]),
                "carbon_kg": 8.9,
                "water_liters": 540.0,
                "sustainability_certifications_json": json_dumps(["OEKO-TEX", "SA8000"]),
                "repair_instructions": "Steam collar after laundering and reinforce buttons with hidden repair thread.",
                "recycling_instructions": "Remove fusible collar stays before mono-material recycling.",
                "durability_rating": 88,
                "circularity_score": 90,
                "resale_estimate": 112.0,
                "qr_code": "QR-AU-SHR-014",
                "barcode": "880100010014",
                "nfc_tag": "NFC-AU-SHR-014",
                "journey": [
                    ("Textile Mill", "Porto Trace Textile Mill", "Poplin finished with low-impact softening."),
                    ("Factory", "Da Nang Circular Factory", "Constructed with reinforced yoke seams."),
                    ("Brand", "Copenhagen Brand House", "Passport IDs and supplier evidence maintained here."),
                ],
            },
        },
        {
            "product_code": "CF-RA-KNT-042",
            "brand_name": "Renewal Atelier",
            "name": "Verdant Loop Knit",
            "garment_type": "Crewneck Knit",
            "category": "knitwear",
            "target_demographic": "Women",
            "base_color": "forest",
            "materials_summary": "RWS merino with recycled cashmere",
            "msrp": 265.0,
            "image_url": "/static/images/knit.svg",
            "product_story": "Repair-first knit architecture with re-dye compatibility and low-pilling yarn engineering.",
            "style_tags_json": json_dumps(["soft tailoring", "transitional", "quiet luxury"]),
            "ai_fingerprint": "green knit crewneck merino recycled cashmere renewal atelier soft tailoring",
            "passport": {
                "passport_id": "DPP-RA-KNT-042",
                "manufacturer": "Renewal Atelier Knitworks",
                "factory_location": "Biella, Italy",
                "country_of_origin": "Italy",
                "material_composition_json": json_dumps(
                    [
                        {"material": "RWS Merino Wool", "percentage": 82},
                        {"material": "Recycled Cashmere", "percentage": 18},
                    ]
                ),
                "carbon_kg": 10.2,
                "water_liters": 310.0,
                "sustainability_certifications_json": json_dumps(["Responsible Wool Standard", "OEKO-TEX"]),
                "repair_instructions": "Depill with a fine comb every 20 wears and repair elbow stress points through darning kits.",
                "recycling_instructions": "Eligible for mechanical recycling or take-back re-spinning.",
                "durability_rating": 89,
                "circularity_score": 91,
                "resale_estimate": 168.0,
                "qr_code": "QR-RA-KNT-042",
                "barcode": "880100010042",
                "nfc_tag": "NFC-RA-KNT-042",
                "journey": [
                    ("Textile Mill", "Biella Renewal Wool House", "Yarn selection and knit gauge tuning optimized for longevity."),
                    ("Brand", "Copenhagen Brand House", "Passport and supplier compliance oversight."),
                ],
            },
        },
        {
            "product_code": "CF-LS-DNM-077",
            "brand_name": "Loop Standard",
            "name": "Second Mile Denim",
            "garment_type": "Straight Jean",
            "category": "bottom",
            "target_demographic": "Unisex",
            "base_color": "indigo",
            "materials_summary": "Regenerative cotton denim with recycled trim",
            "msrp": 198.0,
            "image_url": "/static/images/jeans.svg",
            "product_story": "Built for resale from day one with repairable hems and authenticated wash data.",
            "style_tags_json": json_dumps(["denim", "streetwear", "everyday"]),
            "ai_fingerprint": "indigo denim jeans regenerative cotton loop standard straight jean resale",
            "passport": {
                "passport_id": "DPP-LS-DNM-077",
                "manufacturer": "Loop Standard Co.",
                "factory_location": "Da Nang, Vietnam",
                "country_of_origin": "Vietnam",
                "material_composition_json": json_dumps(
                    [
                        {"material": "Regenerative Cotton", "percentage": 96},
                        {"material": "Recycled Metal Trim", "percentage": 4},
                    ]
                ),
                "carbon_kg": 11.4,
                "water_liters": 620.0,
                "sustainability_certifications_json": json_dumps(["GRS", "Climate Neutral"]),
                "repair_instructions": "Patch knee abrasion from the inside and chain-stitch hems when shortening.",
                "recycling_instructions": "Remove metal shank and rivets before cotton recycling.",
                "durability_rating": 90,
                "circularity_score": 89,
                "resale_estimate": 124.0,
                "qr_code": "QR-LS-DNM-077",
                "barcode": "880100010077",
                "nfc_tag": "NFC-LS-DNM-077",
                "journey": [
                    ("Raw Material Source", "Vidarbha Regenerative Cotton Collective", "Regenerative cotton tracked to cooperative level."),
                    ("Factory", "Da Nang Circular Factory", "Assembly with replaceable metal hardware."),
                    ("Repair Hub", "Los Angeles Renewal Studio", "Resale conditioning and repairs documented post-purchase."),
                ],
            },
        },
        {
            "product_code": "CF-EL-DRS-108",
            "brand_name": "Eterna Loom",
            "name": "Terra Slip Dress",
            "garment_type": "Slip Dress",
            "category": "dress",
            "target_demographic": "Women",
            "base_color": "clay",
            "materials_summary": "TENCEL satin with adjustable straps",
            "msrp": 295.0,
            "image_url": "/static/images/dress.svg",
            "product_story": "A low-waste occasion piece engineered for rewear with multiple styling paths.",
            "style_tags_json": json_dumps(["occasion", "layering", "minimal"]),
            "ai_fingerprint": "clay dress slip satin tencel eterna loom occasion",
            "passport": {
                "passport_id": "DPP-EL-DRS-108",
                "manufacturer": "Eterna Loom Manufacturing",
                "factory_location": "Da Nang, Vietnam",
                "country_of_origin": "Vietnam",
                "material_composition_json": json_dumps([{"material": "TENCEL Lyocell", "percentage": 100}]),
                "carbon_kg": 9.3,
                "water_liters": 410.0,
                "sustainability_certifications_json": json_dumps(["FSC", "Fair Trade"]),
                "repair_instructions": "Use low-heat steaming and reinforce strap sliders if movement increases.",
                "recycling_instructions": "Mono-material recycling approved after hardware removal.",
                "durability_rating": 84,
                "circularity_score": 87,
                "resale_estimate": 176.0,
                "qr_code": "QR-EL-DRS-108",
                "barcode": "880100010108",
                "nfc_tag": "NFC-EL-DRS-108",
                "journey": [
                    ("Textile Mill", "Porto Trace Textile Mill", "Lyocell satin finishing with closed-loop solvent recovery."),
                    ("Dye Facility", "Hue Waterless Dye Lab", "Low-water clay tone bath matched to batch chemistry data."),
                    ("Factory", "Da Nang Circular Factory", "Strap adjusters and hem seams tuned for alterations."),
                ],
            },
        },
        {
            "product_code": "CF-AU-BAG-302",
            "brand_name": "Aureline",
            "name": "Passport Tote",
            "garment_type": "Tote Bag",
            "category": "accessories",
            "target_demographic": "Unisex",
            "base_color": "stone",
            "materials_summary": "Recycled canvas and cork trims",
            "msrp": 145.0,
            "image_url": "/static/images/tote.svg",
            "product_story": "An everyday carrier that uses the digital passport itself as a functional care and repair anchor.",
            "style_tags_json": json_dumps(["accessory", "utility", "commuter"]),
            "ai_fingerprint": "stone tote bag recycled canvas cork aureline commuter",
            "passport": {
                "passport_id": "DPP-AU-BAG-302",
                "manufacturer": "Aureline Atelier",
                "factory_location": "Da Nang, Vietnam",
                "country_of_origin": "Vietnam",
                "material_composition_json": json_dumps(
                    [
                        {"material": "Recycled Cotton Canvas", "percentage": 88},
                        {"material": "Cork", "percentage": 12},
                    ]
                ),
                "carbon_kg": 5.1,
                "water_liters": 190.0,
                "sustainability_certifications_json": json_dumps(["GRS", "B Corp"]),
                "repair_instructions": "Spot clean and reinforce handle bar-tacks at the first sign of fray.",
                "recycling_instructions": "Separate cork tabs prior to textile recycling.",
                "durability_rating": 93,
                "circularity_score": 92,
                "resale_estimate": 94.0,
                "qr_code": "QR-AU-BAG-302",
                "barcode": "880100010302",
                "nfc_tag": "NFC-AU-BAG-302",
                "journey": [
                    ("Textile Mill", "Porto Trace Textile Mill", "Recycled canvas weaving and finishing."),
                    ("Factory", "Da Nang Circular Factory", "Handles, lining, and repair tabs installed."),
                    ("Brand", "Copenhagen Brand House", "Passport lifecycle and QR distribution."),
                ],
            },
        },
    ]

    products: dict[str, Product] = {}
    passports: dict[str, DigitalPassport] = {}
    for item in products_data:
        product = Product(
            brand_id=brands_by_name[item["brand_name"]].id,
            product_code=item["product_code"],
            name=item["name"],
            garment_type=item["garment_type"],
            category=item["category"],
            target_demographic=item["target_demographic"],
            base_color=item["base_color"],
            materials_summary=item["materials_summary"],
            msrp=item["msrp"],
            image_url=item["image_url"],
            product_story=item["product_story"],
            style_tags_json=item["style_tags_json"],
            ai_fingerprint=item["ai_fingerprint"],
        )
        db.add(product)
        db.flush()

        passport_payload = dict(item["passport"])
        journey_steps = passport_payload.pop("journey", [])
        passport = DigitalPassport(product_id=product.id, passport_status="verified", **passport_payload)
        db.add(passport)
        db.flush()

        for order, (step_type, supplier_name, details) in enumerate(journey_steps, start=1):
            supplier = supplier_by_name[supplier_name]
            db.add(
                ProductJourneyStep(
                    passport_id=passport.id,
                    supplier_id=supplier.id,
                    step_order=order,
                    step_type=step_type,
                    name=supplier.name,
                    country=supplier.country,
                    latitude=supplier.latitude,
                    longitude=supplier.longitude,
                    details=details,
                )
            )

        products[product.product_code] = product
        passports[passport.passport_id] = passport

    db.flush()

    trench_item = WardrobeItem(
        user_id=mia.id,
        product_id=products["CF-EL-TRN-001"].id,
        passport_id=passports["DPP-EL-TRN-001"].id,
        nickname="Workday hero trench",
        condition="excellent",
        status="active",
        wear_count=14,
        repair_count=1,
        acquired_on=date(2025, 9, 15),
        last_worn_at=datetime(2026, 3, 29, 18, 30),
        purchase_price=420.0,
        notes="Fits over tailoring and knits. Button replaced once through repair hub.",
    )
    denim_item = WardrobeItem(
        user_id=mia.id,
        product_id=products["CF-LS-DNM-077"].id,
        passport_id=passports["DPP-LS-DNM-077"].id,
        nickname="Resale-ready denim",
        condition="good",
        status="active",
        wear_count=4,
        repair_count=0,
        acquired_on=date(2025, 11, 20),
        last_worn_at=datetime(2026, 3, 12, 13, 10),
        purchase_price=198.0,
        notes="Low wear for the season, strong resale candidate.",
    )
    knit_item = WardrobeItem(
        user_id=mia.id,
        product_id=products["CF-RA-KNT-042"].id,
        passport_id=passports["DPP-RA-KNT-042"].id,
        nickname="Repair-first knit",
        condition="repairable",
        status="active",
        wear_count=2,
        repair_count=0,
        acquired_on=date(2025, 12, 10),
        last_worn_at=datetime(2026, 2, 20, 10, 5),
        purchase_price=265.0,
        notes="Needs elbow darning soon.",
    )
    db.add_all([trench_item, denim_item, knit_item])
    db.flush()

    wardrobe_events = [
        WardrobeEvent(wardrobe_item_id=trench_item.id, event_type="worn", note="Client presentation and dinner."),
        WardrobeEvent(wardrobe_item_id=trench_item.id, event_type="repaired", note="Cuff button replaced through repair hub."),
        WardrobeEvent(wardrobe_item_id=denim_item.id, event_type="worn", note="Weekend styling session."),
        WardrobeEvent(wardrobe_item_id=knit_item.id, event_type="worn", note="Cold-weather layering."),
    ]
    db.add_all(wardrobe_events)

    active_listing_product = products["CF-EL-DRS-108"]
    active_listing_passport = passports["DPP-EL-DRS-108"]
    predicted_price, expected_days = predict_resale(active_listing_product, active_listing_passport, active_listing_product.brand, "excellent")
    db.add(
        MarketplaceListing(
            seller_id=admin.id,
            product_id=active_listing_product.id,
            passport_id=active_listing_passport.id,
            wardrobe_item_id=None,
            title="Terra Slip Dress, verified passport included",
            description="Conditioned for immediate resale with full transparency data and care history.",
            size_label="M",
            condition="excellent",
            price=182.0,
            predicted_price=predicted_price,
            expected_days_to_sell=expected_days,
            status="active",
            image_url=active_listing_product.image_url,
        )
    )

    tote_product = products["CF-AU-BAG-302"]
    tote_passport = passports["DPP-AU-BAG-302"]
    predicted_tote, tote_days = predict_resale(tote_product, tote_passport, tote_product.brand, "good")
    db.add(
        MarketplaceListing(
            seller_id=admin.id,
            product_id=tote_product.id,
            passport_id=tote_passport.id,
            wardrobe_item_id=None,
            title="Passport Tote with transparent materials profile",
            description="Verified accessory listing with repair guidance and materials breakdown.",
            size_label="One Size",
            condition="good",
            price=88.0,
            predicted_price=predicted_tote,
            expected_days_to_sell=tote_days,
            status="active",
            image_url=tote_product.image_url,
        )
    )

    db.add(
        VerificationRequest(
            request_type="new_brand",
            submitter_id=mia.id,
            product_name="Not yet available",
            brand_name="Juniper Trace",
            status="pending",
            payload_json=json_dumps(
                {
                    "brand": {
                        "name": "Juniper Trace",
                        "website": "https://junipertrace.example",
                        "demographics": ["Women", "Outdoor"],
                    },
                    "notes": "Learned via garment scan, pending authenticity check and supplier evidence.",
                }
            ),
        )
    )

    db.commit()

from datetime import date, datetime
from typing import Optional

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="user", nullable=False)

    wardrobe_items = relationship("WardrobeItem", back_populates="user", cascade="all, delete-orphan")
    listings = relationship("MarketplaceListing", back_populates="seller")
    orders = relationship("MarketplaceOrder", back_populates="buyer")
    verification_requests = relationship("VerificationRequest", back_populates="submitter", foreign_keys="VerificationRequest.submitter_id")


class Brand(Base, TimestampMixin):
    __tablename__ = "brands"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(140), unique=True, nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    headquarters_region: Mapped[str] = mapped_column(String(120), nullable=False)
    transparency_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    sustainability_rating: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    demographics_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    certifications_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    website: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    api_key: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    products = relationship("Product", back_populates="brand", cascade="all, delete-orphan")
    supplier_links = relationship("SupplierBrandLink", back_populates="brand", cascade="all, delete-orphan")


class Supplier(Base, TimestampMixin):
    __tablename__ = "suppliers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    supplier_type: Mapped[str] = mapped_column(String(80), nullable=False)
    region: Mapped[str] = mapped_column(String(120), nullable=False)
    country: Mapped[str] = mapped_column(String(120), nullable=False)
    city: Mapped[str] = mapped_column(String(120), default="", nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    certifications_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    materials_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    labor_standard: Mapped[str] = mapped_column(String(120), default="Verified", nullable=False)
    transparency_notes: Mapped[str] = mapped_column(Text, default="", nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    brand_links = relationship("SupplierBrandLink", back_populates="supplier", cascade="all, delete-orphan")
    journey_steps = relationship("ProductJourneyStep", back_populates="supplier")


class SupplierBrandLink(Base):
    __tablename__ = "supplier_brand_links"
    __table_args__ = (UniqueConstraint("supplier_id", "brand_id", "relationship_type", name="uq_supplier_brand_relationship"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"), nullable=False)
    brand_id: Mapped[int] = mapped_column(ForeignKey("brands.id"), nullable=False)
    relationship_type: Mapped[str] = mapped_column(String(80), nullable=False)

    supplier = relationship("Supplier", back_populates="brand_links")
    brand = relationship("Brand", back_populates="supplier_links")


class Product(Base, TimestampMixin):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_code: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)
    brand_id: Mapped[int] = mapped_column(ForeignKey("brands.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    garment_type: Mapped[str] = mapped_column(String(80), nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    target_demographic: Mapped[str] = mapped_column(String(80), nullable=False)
    base_color: Mapped[str] = mapped_column(String(80), nullable=False)
    materials_summary: Mapped[str] = mapped_column(String(255), nullable=False)
    msrp: Mapped[float] = mapped_column(Float, nullable=False)
    product_story: Mapped[str] = mapped_column(Text, default="", nullable=False)
    image_url: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    style_tags_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    ai_fingerprint: Mapped[str] = mapped_column(Text, default="", nullable=False)

    brand = relationship("Brand", back_populates="products")
    passport = relationship("DigitalPassport", back_populates="product", uselist=False, cascade="all, delete-orphan")
    wardrobe_items = relationship("WardrobeItem", back_populates="product")
    listings = relationship("MarketplaceListing", back_populates="product")


class DigitalPassport(Base, TimestampMixin):
    __tablename__ = "digital_passports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), unique=True, nullable=False)
    passport_id: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    manufacturer: Mapped[str] = mapped_column(String(160), nullable=False)
    factory_location: Mapped[str] = mapped_column(String(160), nullable=False)
    country_of_origin: Mapped[str] = mapped_column(String(120), nullable=False)
    material_composition_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    carbon_kg: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    water_liters: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    sustainability_certifications_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    repair_instructions: Mapped[str] = mapped_column(Text, default="", nullable=False)
    recycling_instructions: Mapped[str] = mapped_column(Text, default="", nullable=False)
    durability_rating: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    circularity_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    resale_estimate: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    passport_status: Mapped[str] = mapped_column(String(40), default="verified", nullable=False)
    qr_code: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    barcode: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    nfc_tag: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    verified_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    product = relationship("Product", back_populates="passport")
    journey_steps = relationship("ProductJourneyStep", back_populates="passport", cascade="all, delete-orphan")
    wardrobe_items = relationship("WardrobeItem", back_populates="passport")
    listings = relationship("MarketplaceListing", back_populates="passport")
    scans = relationship("ScanHistory", back_populates="passport")


class ProductJourneyStep(Base):
    __tablename__ = "product_journey_steps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    passport_id: Mapped[int] = mapped_column(ForeignKey("digital_passports.id"), nullable=False)
    supplier_id: Mapped[Optional[int]] = mapped_column(ForeignKey("suppliers.id"), nullable=True)
    step_order: Mapped[int] = mapped_column(Integer, nullable=False)
    step_type: Mapped[str] = mapped_column(String(80), nullable=False)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    country: Mapped[str] = mapped_column(String(120), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    details: Mapped[str] = mapped_column(Text, default="", nullable=False)

    passport = relationship("DigitalPassport", back_populates="journey_steps")
    supplier = relationship("Supplier", back_populates="journey_steps")


class WardrobeItem(Base, TimestampMixin):
    __tablename__ = "wardrobe_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    passport_id: Mapped[int] = mapped_column(ForeignKey("digital_passports.id"), nullable=False)
    nickname: Mapped[str] = mapped_column(String(120), default="", nullable=False)
    condition: Mapped[str] = mapped_column(String(80), default="excellent", nullable=False)
    status: Mapped[str] = mapped_column(String(80), default="active", nullable=False)
    wear_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    repair_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    acquired_on: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    last_worn_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    purchase_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="", nullable=False)

    user = relationship("User", back_populates="wardrobe_items")
    product = relationship("Product", back_populates="wardrobe_items")
    passport = relationship("DigitalPassport", back_populates="wardrobe_items")
    events = relationship("WardrobeEvent", back_populates="wardrobe_item", cascade="all, delete-orphan")
    listing = relationship("MarketplaceListing", back_populates="wardrobe_item", uselist=False)


class WardrobeEvent(Base, TimestampMixin):
    __tablename__ = "wardrobe_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    wardrobe_item_id: Mapped[int] = mapped_column(ForeignKey("wardrobe_items.id"), nullable=False)
    event_type: Mapped[str] = mapped_column(String(40), nullable=False)
    note: Mapped[str] = mapped_column(Text, default="", nullable=False)

    wardrobe_item = relationship("WardrobeItem", back_populates="events")


class MarketplaceListing(Base, TimestampMixin):
    __tablename__ = "marketplace_listings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    seller_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    passport_id: Mapped[int] = mapped_column(ForeignKey("digital_passports.id"), nullable=False)
    wardrobe_item_id: Mapped[Optional[int]] = mapped_column(ForeignKey("wardrobe_items.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    size_label: Mapped[str] = mapped_column(String(30), nullable=False)
    condition: Mapped[str] = mapped_column(String(60), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    predicted_price: Mapped[float] = mapped_column(Float, nullable=False)
    expected_days_to_sell: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(40), default="active", nullable=False)
    image_url: Mapped[str] = mapped_column(String(255), default="", nullable=False)

    seller = relationship("User", back_populates="listings")
    product = relationship("Product", back_populates="listings")
    passport = relationship("DigitalPassport", back_populates="listings")
    wardrobe_item = relationship("WardrobeItem", back_populates="listing")
    orders = relationship("MarketplaceOrder", back_populates="listing")


class MarketplaceOrder(Base, TimestampMixin):
    __tablename__ = "marketplace_orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("marketplace_listings.id"), nullable=False)
    buyer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    total_price: Mapped[float] = mapped_column(Float, nullable=False)
    shipping_address: Mapped[str] = mapped_column(Text, default="", nullable=False)
    order_status: Mapped[str] = mapped_column(String(60), default="paid", nullable=False)
    tracking_reference: Mapped[str] = mapped_column(String(120), default="", nullable=False)

    listing = relationship("MarketplaceListing", back_populates="orders")
    buyer = relationship("User", back_populates="orders")


class VerificationRequest(Base):
    __tablename__ = "verification_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    request_type: Mapped[str] = mapped_column(String(80), nullable=False)
    submitter_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    reviewer_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    brand_id: Mapped[Optional[int]] = mapped_column(ForeignKey("brands.id"), nullable=True)
    supplier_id: Mapped[Optional[int]] = mapped_column(ForeignKey("suppliers.id"), nullable=True)
    product_name: Mapped[str] = mapped_column(String(160), default="", nullable=False)
    brand_name: Mapped[str] = mapped_column(String(160), default="", nullable=False)
    status: Mapped[str] = mapped_column(String(40), default="pending", nullable=False)
    payload_json: Mapped[str] = mapped_column(Text, default="{}", nullable=False)
    review_notes: Mapped[str] = mapped_column(Text, default="", nullable=False)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    submitter = relationship("User", back_populates="verification_requests", foreign_keys=[submitter_id])


class ScanHistory(Base, TimestampMixin):
    __tablename__ = "scan_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    scan_type: Mapped[str] = mapped_column(String(40), nullable=False)
    scan_value: Mapped[str] = mapped_column(Text, default="", nullable=False)
    matched_passport_id: Mapped[Optional[int]] = mapped_column(ForeignKey("digital_passports.id"), nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    passport = relationship("DigitalPassport", back_populates="scans")

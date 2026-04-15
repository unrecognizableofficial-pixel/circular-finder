create extension if not exists pgcrypto;
create extension if not exists citext;

create type manufacturer_generation as enum ('new', 'legacy');
create type manufacturer_status as enum ('active', 'watchlist', 'inactive');
create type garment_status as enum ('draft', 'active', 'archived');

create or replace function set_row_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists manufacturers (
  id uuid primary key default gen_random_uuid(),
  name citext not null unique,
  slug text not null unique,
  generation manufacturer_generation not null default 'new',
  status manufacturer_status not null default 'active',
  website text,
  headquarters_country text not null,
  headquarters_region text not null,
  headquarters_city text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  live_sustainability_rating numeric(4, 2) not null default 0,
  transparency_score integer not null default 0,
  labor_score integer not null default 0,
  carbon_disclosure_score integer not null default 0,
  ethical_summary text not null default '',
  verified_certifications text[] not null default '{}',
  fabrics_produced text[] not null default '{}',
  source_url text,
  source_confidence numeric(5, 2) not null default 0,
  certifications_last_checked_at timestamptz,
  last_supplier_change_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists fabrics (
  id uuid primary key default gen_random_uuid(),
  name citext not null unique,
  slug text not null unique,
  category text not null,
  origin_country text,
  traceability_score integer not null default 0,
  recycled_content_pct numeric(5, 2) not null default 0,
  organic_content_pct numeric(5, 2) not null default 0,
  biodegradability_score integer not null default 0,
  carbon_intensity_kg_per_kg numeric(8, 2),
  water_intensity_l_per_kg numeric(10, 2),
  verified_certifications text[] not null default '{}',
  supplier_notes text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists garments (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  dpp_id text not null unique,
  brand_name text not null,
  name text not null,
  category text not null,
  garment_type text not null,
  size_system text,
  manufacturer_id uuid not null references manufacturers(id) on delete restrict,
  primary_fabric_id uuid references fabrics(id) on delete set null,
  status garment_status not null default 'active',
  qr_code text unique,
  barcode text unique,
  nfc_tag text unique,
  lifecycle_journey jsonb not null default '[]'::jsonb,
  fabric_blend jsonb not null default '[]'::jsonb,
  raw_materials jsonb not null default '[]'::jsonb,
  fit_profile_tags text[] not null default '{}',
  style_preferences text[] not null default '{}',
  circularity_score integer not null default 0,
  carbon_footprint_kg numeric(8, 2) not null default 0,
  water_footprint_liters numeric(10, 2) not null default 0,
  resale_impact_score numeric(6, 2) not null default 0,
  complete_journey_summary text not null default '',
  hero_image_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_manufacturers_generation on manufacturers(generation);
create index if not exists idx_manufacturers_status on manufacturers(status);
create index if not exists idx_manufacturers_headquarters on manufacturers(headquarters_country, headquarters_region);
create index if not exists idx_manufacturers_live_rating on manufacturers(live_sustainability_rating desc);
create index if not exists idx_fabrics_category on fabrics(category);
create index if not exists idx_fabrics_traceability on fabrics(traceability_score desc);
create index if not exists idx_garments_manufacturer_id on garments(manufacturer_id);
create index if not exists idx_garments_primary_fabric_id on garments(primary_fabric_id);
create index if not exists idx_garments_status on garments(status);
create index if not exists idx_garments_category on garments(category, garment_type);

drop trigger if exists trg_manufacturers_updated_at on manufacturers;
create trigger trg_manufacturers_updated_at
before update on manufacturers
for each row
execute function set_row_updated_at();

drop trigger if exists trg_fabrics_updated_at on fabrics;
create trigger trg_fabrics_updated_at
before update on fabrics
for each row
execute function set_row_updated_at();

drop trigger if exists trg_garments_updated_at on garments;
create trigger trg_garments_updated_at
before update on garments
for each row
execute function set_row_updated_at();

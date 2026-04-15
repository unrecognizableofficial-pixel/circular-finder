# Sustainable Fashion Platform Front-End Architecture

This document defines a production-ready front-end architecture for evolving the current FastAPI-backed Circular Finder experience into a dedicated React + Tailwind interface for a live sustainable fashion platform.

## Recommended Stack

- React 18 + TypeScript for component-level modularity and predictable state.
- Tailwind CSS for the design system, responsive utilities, and consistent spacing.
- TanStack Query for server state tied to the existing FastAPI APIs.
- React Hook Form + Zod for form-heavy flows like verification, profiles, and resale listing.
- Recharts or Visx for wardrobe analytics.
- MapLibre GL via `react-map-gl/maplibre` for the supplier transparency map.

## App Shell

The shell should be mobile-first and organized around a single production navigation model:

- Mobile: bottom tab bar with a compact sticky top header.
- Tablet/Desktop: left sidebar navigation with a slim top utility bar for search, alerts, and account state.
- No demo tabs or training routes in the primary navigation.

Recommended top-level routes:

- `/scanner`
- `/styling`
- `/suppliers`
- `/dashboard`
- `/marketplace`
- `/profile`

## Feature Architecture

### 1. Digital Product Passport Scanner

Primary UI blocks:

- Camera / QR entry card with upload fallback.
- Passport result panel with lifecycle timeline.
- Lifecycle visualization using a horizontal stepper on desktop and stacked cards on mobile.
- Sustainability summary chips for materials, factory, logistics, repair, and resale readiness.

Data sources from the current backend:

- `POST /api/scan/lookup`
- `POST /api/scan/upload`
- `GET /api/passports/{passport_id}`

### 2. AI Virtual Styling Tool

Primary UI blocks:

- Saved body profile selector.
- Fit preview panel with "Fit Match" percentages.
- Product details + material + stretch notes.
- AI suggestion rail for alternatives when the score is low.

State model:

- Server state for garments, body profiles, and styling suggestions via TanStack Query.
- Local state for currently selected profile, size, style goals, and confidence threshold.

### 3. Supplier Transparency Map

Primary UI blocks:

- High-fidelity map surface with vector/satellite toggle.
- Custom supplier pins at exact coordinates.
- Hover card for quick glance.
- Persistent detail card on click with certifications, summary, materials, and associated brands.

Data source from the current backend:

- `GET /api/suppliers/map`

### 4. Sustainable Dashboard

Primary UI blocks:

- KPI rail for inventory count, resale value, and carbon savings.
- Donut charts for circular vs. fast-fashion share.
- Bar charts for carbon footprint savings over time.
- Wardrobe health cards for repairs, wears, and resale potential.

Data sources from the current backend:

- `GET /api/wardrobe`
- `GET /api/styling/outfits`
- `GET /api/bootstrap`

### 5. Circular Marketplace

Primary UI blocks:

- Peer-to-peer listing grid with large imagery.
- "Condition" and "Impact" tags on every card.
- Saved filters for brand, size, price band, and material.
- Listing drawer for verified passport context before purchase.

Data sources from the current backend:

- `GET /api/marketplace/listings`
- `POST /api/marketplace/listings`
- `POST /api/marketplace/orders`

## State Boundaries

Use a clear split between server and client state:

- Server state: products, suppliers, marketplace listings, wardrobe bundles, user session.
- Client state: active tab, filter drawers, selected supplier pin, chart range, compare mode, map style.
- Persisted client preferences: body profile choice, dashboard date range, saved marketplace filters.

## Design System Direction

The UI should feel modern, minimal, and eco-conscious:

- Palette: warm off-white backgrounds, desaturated greens, charcoal ink, restrained accent gold for verified states.
- Surfaces: soft radius, subtle shadows, card-first layouts, generous whitespace.
- Typography: editorial but clean, with strong section headers and calm supporting copy.
- Imagery: high-quality garment photography, tightly cropped product cards, realistic map baselayer.

Suggested Tailwind tokens:

- Background: `stone-50`, `zinc-950/5`, `emerald-950`
- Brand green scale: `emerald-50`, `emerald-100`, `emerald-600`, `emerald-900`
- Neutrals: `stone-100`, `stone-300`, `stone-600`, `stone-900`

## Responsive Dashboard Breakpoints

The dashboard should be designed from the base mobile layout upward.

| Breakpoint | Tailwind Width | Dashboard Layout |
| --- | --- | --- |
| Base | `< 640px` | Single-column stack. KPI cards in `grid-cols-2`. Donuts stacked above the emissions bar chart. Filters collapse into a drawer. |
| `sm` | `>= 640px` | Maintain single-column flow, but allow KPI cards to breathe with larger chart heights. Secondary insight cards can become `sm:grid-cols-2`. |
| `md` | `>= 768px` | Switch to a two-zone layout: charts in the primary column, summary cards in the secondary column. Donuts become side-by-side with `md:grid-cols-2`. |
| `lg` | `>= 1024px` | Desktop analytics shell. Use a 12-column grid: KPI rail `lg:col-span-3`, donuts `lg:col-span-4`, emissions bar `lg:col-span-5`, detailed wardrobe table full width below. |
| `xl` | `>= 1280px` | Expand chart density. Add benchmark or trend comparison panels without modal overflow. Marketplace and dashboard can coexist in split workspaces. |
| `2xl` | `>= 1536px` | Cap content width around `1440px`. Increase chart legibility and preserve whitespace instead of endlessly stretching cards. |

Recommended dashboard card behavior:

- KPI cards: `grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-1`
- Donut charts: `grid gap-4 md:grid-cols-2`
- Emissions chart: full-width on mobile, `lg:col-span-5`
- Item mix / wardrobe table: always full-width below primary charts

## Accessibility Notes

- All nav items need visible focus states and `aria-current="page"` on active routes.
- Map pins must be keyboard reachable and expose supplier details via `aria-describedby`.
- Fit Match percentages must never rely on color alone; pair them with labels like `Strong Fit`, `Moderate Fit`, or `Low Confidence`.
- Charts need summary text below or alongside the visual.

## Reference Components

React/Tailwind reference implementations live here:

- [ProductionNavigation.tsx](/Users/pk/Documents/New%20project/frontend-reference/components/ProductionNavigation.tsx:1)
- [SupplierTransparencyMap.tsx](/Users/pk/Documents/New%20project/frontend-reference/components/SupplierTransparencyMap.tsx:1)

These are intentionally isolated from the current FastAPI template so the existing app keeps running while the React front end is designed in parallel.

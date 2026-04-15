# Live Sustainable Fashion Platform

This repository currently runs a FastAPI + Jinja application. For a production-grade live-data platform, the recommended target architecture is:

- Next.js App Router frontend in `frontend/`
- Supabase/PostgreSQL for transactional and realtime data
- FastAPI retained for scanning, ingestion, and AI-style orchestration
- Scheduled background sync jobs for supplier and certification refreshes

## Live Data Flow

1. Users interact with the Next.js app for scanning, supplier discovery, styling, dashboard analytics, and marketplace actions.
2. The frontend reads live supplier pins, garment records, and user impact data from Supabase via row-level secured queries and realtime subscriptions.
3. FastAPI handles heavier workflows:
   - Digital Product Passport resolution
   - image upload and classifier orchestration
   - external certification ingestion
   - supplier change detection
4. Background jobs refresh manufacturers, fabrics, and garment provenance on a schedule.

## Automated Data Sourcing Flow

Recommended production sync pipeline:

1. Maintain a curated source registry for:
   - official certification registries
   - brand transparency feeds
   - trade APIs
   - supplier directories
2. Run a scheduled job every 6 to 24 hours:
   - fetch latest supplier pages and registry endpoints
   - normalize names, domains, countries, and certifications
   - compare against existing manufacturer and fabric records
   - mark changed records for review when confidence is below threshold
3. Persist:
   - latest certification status
   - source URL
   - confidence score
   - timestamp of last verification
4. Push updates into realtime channels so the map and dashboard refresh without redeploying.

## Production Notes

- Keep public product intelligence readable, but require auth for personal wardrobes, styling profiles, orders, and listing management.
- Store supplier coordinates and certification status centrally in PostgreSQL so map pins stay live.
- Run ingestion with retryable job queues instead of blocking request threads.
- Add audit logging for all certification changes and garment provenance edits.

## Deliverable Files

- Next.js main layout: [frontend/app/layout.tsx](/Users/pk/Documents/New%20project/frontend/app/layout.tsx:1)
- Platform shell layout: [frontend/app/(platform)/layout.tsx](</Users/pk/Documents/New project/frontend/app/(platform)/layout.tsx:1>)
- Tailwind config: [frontend/tailwind.config.ts](/Users/pk/Documents/New%20project/frontend/tailwind.config.ts:1)
- SQL schema: [db/production_schema.sql](/Users/pk/Documents/New%20project/db/production_schema.sql:1)

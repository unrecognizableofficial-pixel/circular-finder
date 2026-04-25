# Circular Finder

Circular Finder is a full-stack circular fashion platform that combines digital product passports, wardrobe intelligence, verified resale, repair guidance, and supply chain transparency in one application.

## What is included

- FastAPI backend with authentication, protected APIs, admin moderation, and brand passport integrations
- Postgres-ready relational schema with SQLite development fallback
- Digital passport scanning through code lookup, image upload, and camera-ready frontend flows
- AI-style garment recognition heuristics, resale price prediction, and outfit generation
- Verified resale marketplace gated by passport verification
- Supplier transparency map with brand, region, certification, material, labor, and demographic filters
- Brand transparency database and verification pipeline for new products, brands, and suppliers
- Admin dashboard for verification request review
- Seeded development data and smoke tests for the main end-to-end flows

## Stack

- Frontend: responsive web client with modular JavaScript, premium eco-luxury styling, and live camera support
- Backend: FastAPI
- Database: SQLite for local development, PostgreSQL via `DATABASE_URL` in production
- Storage: local uploads folder for development, designed to swap to cloud object storage

## Enterprise backend

The repo now also includes a parallel enterprise backend scaffold in [backend](./backend) built with NestJS + Prisma + PostgreSQL + Redis for the investor/demo platform layer.

- Framework: NestJS + TypeScript
- ORM: Prisma
- Database: PostgreSQL
- Cache / queues: Redis + BullMQ
- Realtime: Socket.IO gateways for notifications and Impact Points™
- Auth: JWT with refresh sessions and RBAC permissions
- Storage: S3-compatible signed uploads
- Docs: Swagger/OpenAPI at `/api/docs`

### Backend modules

- `auth`, `users`, `roles`, `permissions`, `profiles`
- `social`, `marketplace`, `orders`
- `brands`, `compliance`, `governance`
- `impact`, `scanner`, `circular-id`
- `notifications`, `analytics`, `files`, `settings`

### Backend local setup

1. `cd backend`
2. `cp .env.example .env`
3. `npm install`
4. `docker compose up -d postgres redis minio`
5. `npx prisma generate`
6. `npx prisma db push`
7. `npm run prisma:seed`
8. `npm run start:dev`

Health check: `http://127.0.0.1:4000/api/health`

This backend is intentionally parallel to the original FastAPI app so the existing product can keep running while the NestJS service grows into the long-term enterprise API.

## Local setup

1. Create a virtual environment: `python3 -m venv .venv`
2. Install dependencies: `.venv/bin/pip install -r requirements.txt`
3. Run the app: `PYTHONPYCACHEPREFIX=/tmp/pycache .venv/bin/uvicorn app.main:app --reload`
4. Open `http://127.0.0.1:8000`

If you want PostgreSQL instead of SQLite, set `DATABASE_URL` before starting the app.

## Seeded development accounts

- User: `mia@circularfinder.com` / `Circular123!`
- Admin: `admin@circularfinder.com` / `Circular123!`

## Seeded brand API keys

- `brand_eternaloom_dev_key`
- `brand_aureline_dev_key`
- `brand_loopstandard_dev_key`
- `brand_renewalatelier_dev_key`

Use them with `POST /api/brands/api/passports` through `X-Brand-Key`.

## Smoke test

Run:

```bash
PYTHONPYCACHEPREFIX=/tmp/pycache .venv/bin/python tests/smoke_test.py
```

This verifies bootstrap, login, scan lookup, image upload recognition, wardrobe creation, resale listing, verification submission, and admin review.

## GitHub Pages

The Next.js frontend is configured for static export through GitHub Actions and can be published on GitHub Pages as a self-contained demo.

- Workflow: `.github/workflows/deploy-pages.yml`
- Build mode: static export from `frontend/`
- Public URL pattern: `https://unrecognizableofficial-pixel.github.io/circular-finder/`

The Pages build uses `NEXT_PUBLIC_STATIC_DEMO=true`, so the public site falls back to local demo data instead of requiring the FastAPI backend.

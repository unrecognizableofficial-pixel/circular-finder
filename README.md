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

## Deploy

This repository includes a `render.yaml` blueprint for deploying the full stack on Render:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/unrecognizableofficial-pixel/circular-finder)

- `circular-finder-api`: FastAPI backend
- `circular-finder-web`: Next.js frontend
- `circular-finder-db`: PostgreSQL database

The frontend proxies `/api/*` and `/static/*` to the backend service, so the deployed app can run behind a single public site URL instead of exposing separate frontend and backend URLs to end users.

To deploy from GitHub:

1. Sign in to Render.
2. Create a new Blueprint and point it at this repository.
3. Render will provision the database and both web services from `render.yaml`.

For local frontend development through the same-origin proxy model, the frontend expects `BACKEND_ORIGIN=127.0.0.1:8000` as shown in `frontend/.env.example`.

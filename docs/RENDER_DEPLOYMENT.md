# Render Deployment Guide

This project is ready to deploy on Render as a Node web service.

## Prerequisites

- PostgreSQL database (Render PostgreSQL or external like Neon). Ensure SSL is enabled.
- JWT secret and database credentials.

## 1) One-click setup with render.yaml

Render can auto-detect `render.yaml` in the repo.

- On Render, create a new Web Service from your GitHub repo.
- Render will read `render.yaml` and configure the service.

Key settings in `render.yaml`:

- buildCommand: `npm ci && npm run build`
- startCommand: `node dist/server.js`
- Env vars include `DB_*`, `PGSSLMODE=require`, `DB_SSL=true`, and `RUN_MIGRATIONS=true` (optional auto migrations).

## 2) Required environment variables

Set in Render Dashboard or via `render.yaml` sync:

- DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME
- DB_SSL=true, PGSSLMODE=require
- JWT_SECRET=(generate)
- CORS_ORIGIN=(your frontend origin, e.g., <https://app.example.com>)
- PORT=3000 (Render injects PORT; our server respects it)
- RUN_MIGRATIONS=true (optional; run TypeORM migrations at boot)

## 3) Database migrations

- Migrations are TypeORM-based under `src/migrations`.
- When `RUN_MIGRATIONS=true`, the app will run migrations on startup.

## 4) Health & docs

- Health check: `GET /api/health`
- Swagger: `/api-docs`

## 5) Troubleshooting

- SSL errors: verify `DB_SSL=true` and `PGSSLMODE=require`.
- 503 at boot: check logs for migration errors. Either disable `RUN_MIGRATIONS` or fix DB perms.
- CORS blocked: set `CORS_ORIGIN` to your frontend URL.

## 6) CI smoke test (optional)

Use the included Postman smoke suite locally before deploying:

```powershell
npm run test:smoke
```

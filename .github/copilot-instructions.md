# Eqabo Copilot Instructions

## Quick orientation
- API-first hotel booking backend built with Express 5 + TypeScript, authenticated by JWT and persisted via PostgreSQL/TypeORM (`src/app.ts`, `src/server.ts`).
- Layered flow: routes create controllers, controllers delegate to services or repositories, and entities live in `src/models` where enums codify status/roles.
- Swagger/OpenAPI docs are embedded directly in the route files (see `src/routes/authRoutes.ts`); keep annotations in sync when adding endpoints.

## Local dev workflow
- Install deps with `npm install`, copy `.env.example` to `.env.dev`, then start the API with `npm run dev` (ts-node) or build with `npm run build` + `npm start` from `dist/`.
- Database setup uses TypeORM; run `npm run migration:run` before seeding. Two seed paths exist: the JS shortcut `npm run seed` (raw SQL) and the TypeScript orchestrator `ts-node src/seeds/seed.ts [all|users|hotels|summary]` which clears tables via `session_replication_role`.
- Jest is wired via `npm test` but the suite is currently empty; for regression coverage prefer Supertest-based API specs in `__tests__` aligned with the Postman flows in `postman/`.

## Persistence patterns
- `createApp` receives a live `DataSource` and passes it into routers so each controller can resolve repositories from the same connection; when writing new handlers, grab repositories off `dataSource.getRepository(Model)`.
- Entities aggregate through `src/models/index.ts`; add new tables there so both the runtime DataSource and CLI migrations pick them up.
- Env vars are read under two naming schemes: `DB_USER/DB_PASS` in `src/config/database.ts` and `DB_USERNAME/DB_PASSWORD` in `src/server.ts`. Set both pairs (or update config) to avoid mismatches when switching between ts-node dev and built binaries.

## Domain rules to respect
- Phone numbers must be validated/normalized with `validateEthiopianPhone` before persisting or authenticating (`src/utils/phoneValidation.ts`); AuthService relies on the normalized `+251` format to de-duplicate records.
- User roles are restricted to `admin`, `hotel_owner`, and `customer`; the MVP registration flow only allows admin/hotel owners, while guest bookings auto-provision `customer` users with stubbed passwords.
- Booking creation (`BookingController.createBooking`) uses a manual `QueryRunner` transaction to lock rooms and guard against double bookings; keep related updates inside the same transaction if you expand the workflow.
- Payment initiation and callbacks (`PaymentController`) log every state change in `payment_logs`; follow that pattern when adding providers to preserve the audit trail.

## API surface
- Main router in `src/routes/index.ts` mounts `/auth`, `/hotels`, `/bookings`, and `/payments`; expose new domains by creating a route factory and registering it there.
- For public docs, `/api/docs` serves Swagger UI via `src/config/swagger.ts`. Update the swagger spec when adding enums/response shapes so the explorer stays accurate.
- Health checks live at `/api/health`; keep responses lightweight because deployment pipelines and Postman smoke tests pin to that contract.

## Helpful references
- `DATABASE_SETUP.md` and `docs/DEVELOPER_GUIDE.md` document full onboarding, seeding strategies, and npm script matrix.
- `SEEDING_GUIDE.md` explains fixture expectations and idempotency tricks; align new seed data with those helpers before running automated smoke tests.
- For workflow examples, check `postman/WORKFLOW-GUIDE.md` and the collection JSONs—they mirror the booking/payment happy path the business team verifies.

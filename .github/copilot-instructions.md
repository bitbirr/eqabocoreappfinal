# Eqabo Copilot Instructions

Quick orientation (what matters to code fast here)
- Express 5 + TypeScript API with JWT auth; PostgreSQL via TypeORM. App bootstrap in `src/app.ts`, server/lifecycle in `src/server.ts`.
- DI everywhere: route factories receive a TypeORM `DataSource` and/or a `Repository<User>`. Controllers resolve repos from the passed `dataSource` (see `BookingController`, `PaymentController`). Don’t import a global DataSource.
- Routes are composed in `src/routes/index.ts` with base `/api` and v1 CRUD under `/api/v1`. Auth routes get a `userRepository`; most others get `dataSource`.
- Swagger JSDoc lives beside routes (e.g., `src/routes/authRoutes.ts`, `cityRoutes.ts`, `roomRoutes.ts`); Swagger UI served at `/api-docs` (config in `src/config/swagger.ts`).

Local dev workflow
- Install deps, copy `.env.example` → `.env.dev`, then: dev `npm run dev`; prod `npm run build && npm start`.
- Migrations: `npm run migration:run` (uses `ormconfig.ts`). Entities must be exported from `src/models/index.ts`; migrations live in `src/migrations/`.
- Seed: `npm run seed` (JS) or `ts-node src/seeds/seed.ts [all|users|hotels|cities|summary]`.
- Tests: Jest + Supertest in `__tests__/` require a real DB; ensure migrations ran. Smoke tests via `npm run test:smoke` (runs `scripts/run-newman.ps1`).

Persistence and env gotchas
- Active ORM is TypeORM. A Drizzle schema exists (`src/db/**`, `drizzle.config.ts`, `drizzle/`) but is not wired into request handling—don’t mix unless you add adapters.
- Env name normalization: server accepts `DB_USER/DB_PASS` or `DB_USERNAME/DB_PASSWORD`; SSL via `DB_SSL`/`PGSSLMODE` truthy → `ssl: { rejectUnauthorized: false }`.
- Defaults differ: `server.ts` DB=`eqabo_hotel_booking`; `config/database.ts` DB=`eqabobackend`. Always set `DB_NAME` to avoid surprises.

Domain conventions you must follow
- Ethiopian phone normalization: use `validateEthiopianPhone` (`src/utils/phoneValidation.ts`) and store as `+251XXXXXXXXX`. Auth and dedup depend on this.
- Roles: `admin`, `hotel_owner`, `customer`. Registration allows admin/hotel_owner; guest bookings auto-provision `customer` with stub password.
- Transactions and audit: use manual `QueryRunner` for bookings/payments. Lock room → `OCCUPIED` on booking; on payment success set booking `CONFIRMED`; on failure set booking `CANCELLED` and room `AVAILABLE`. Log every step in `PaymentLog` (`PAYMENT_INITIATED|SUCCESS|FAILED|BOOKING_CREATED|PAYMENT_MISMATCH`).
- Firebase is optional and guarded (`FirebaseService`); endpoints: `/api/auth/firebase`, `/api/users/fcm-token`. Tests tolerate missing config.

API surface (where things are)
- Legacy workflow under `/api`: `/auth`, `/users`, `/hotels`, `/bookings`, `/payments`. v1 CRUD under `/api/v1`: `/cities`, `/cities/:cityId/hotels`, `/hotels/:hotelId/rooms`, `/rooms/:roomId`.
- Health: `GET /api/health`. Docs: `/api-docs`. JSON overview: `GET /api/docs`.

How to add a feature (copy this pattern)
- Add `createXRoutes(dataSource)` in `src/routes/` with Swagger JSDoc; register it in `src/routes/index.ts` under `/api` or `/api/v1`.
- Implement a controller that gets repos via `dataSource.getRepository(Entity)`. If touching bookings/payments, emit `PaymentLog` and respect room/booking status rules above.
- Update or add entities/enums in `src/models/**`, export via `src/models/index.ts`, then generate/run a migration.

Concrete examples in repo
- See `BookingController.createBooking` for QueryRunner usage, conflict checks, room locking, and Firestore/FCM side-effects.
- See `PaymentController.handlePaymentCallback` for success/failure flows, status updates, and audit logging.
- See `authMiddleware.ts` for JWT middleware, role guards, rate limiting; `authRoutes.ts` for Swagger patterns and DI.

References
- Onboarding/DB: `DATABASE_SETUP.md`, `docs/DEVELOPER_GUIDE.md`.
- Seeding: `SEEDING_GUIDE.md`, `src/seeds/**`, `scripts/seed.js`.
- API walkthroughs: `postman/**`, `postman/WORKFLOW-GUIDE.md`.

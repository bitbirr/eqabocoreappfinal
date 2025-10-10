# Eqabo Copilot Instructions

## Quick orientation
- Express 5 + TypeScript API authenticated by JWT; runtime persistence is PostgreSQL via TypeORM (`src/app.ts`, `src/server.ts`, `src/models/**`).
- Route factories create controllers and receive a shared TypeORM `DataSource`/repositories (see `src/routes/index.ts`, `src/controllers/**`). Keep DI: resolve repos from the passed `dataSource`, not from a global.
- Swagger JSDoc lives in route files (e.g., `src/routes/authRoutes.ts`); Swagger UI is served at `/api-docs` (config in `src/config/swagger.ts`).

## Local dev workflow
- Setup: `npm install`, copy `.env.example` to `.env.dev`. Run dev with `npm run dev` (ts-node) or build+start with `npm run build` then `npm start`.
- Migrations (TypeORM CLI): `npm run migration:run` (uses `ormconfig.ts`). Run before tests/seed.
- Seeding options: `npm run seed` (JS raw SQL) or `ts-node src/seeds/seed.ts [all|users|hotels|cities|summary]` (uses `session_replication_role` and summarises counts). Both load `.env.dev`.
- Tests: Jest + Supertest under `__tests__/`. They boot a real `AppDataSource`; ensure DB is up and migrations applied. Useful scripts: `npm test`, `npm test:watch`, smoke tests via Postman `npm run test:smoke` (runs `scripts/run-newman.ps1`).

## Persistence and config
- Active ORM: TypeORM. Entities are exported from `src/models/index.ts`; add new entities there so the runtime and CLI pick them up. Migrations live in `src/migrations/`.
- Drizzle schema exists (`src/db/**`, `drizzle.config.ts`, `drizzle/`) for future/ops use but is not wired into request handling. Don’t mix unless you explicitly add adapters.
- Env variable nuances: server normalizes both naming schemes. Set both to be safe:
	- `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASS` (used by `src/config/database.ts` and seeders)
	- Or `DB_USERNAME/DB_PASSWORD` (also accepted by `src/server.ts`)
	- SSL: `DB_SSL`/`PGSSLMODE` truthy enables `ssl: { rejectUnauthorized: false }`.
- Note defaults differ: `server.ts` default DB=`eqabo_hotel_booking`, `config/database.ts` default DB=`eqabobackend`. Provide `DB_NAME` to avoid surprises.

## Domain rules and patterns
- Phone numbers must be normalized to `+251XXXXXXXXX` using `validateEthiopianPhone` (`src/utils/phoneValidation.ts`). Example: `const {normalizedPhone} = validateEthiopianPhone(input).` Auth and dedup rely on this.
- Roles: `admin`, `hotel_owner`, `customer`. Registration allows admin/hotel_owner; guest bookings auto-provision `customer` with stubbed password.
- Transactions: booking creation and payments use manual `QueryRunner` transactions (see `BookingController.createBooking`, `PaymentController`). Lock room to OCCUPIED on booking; CONFIRMED on payment success; release to AVAILABLE on failure.
- Audit trail: write a `PaymentLog` row for every significant action (`payment_logs`), e.g., `PAYMENT_INITIATED`, `PAYMENT_SUCCESS`, `PAYMENT_FAILED`, `BOOKING_CREATED`.
- Firebase (optional): `FirebaseService` supports custom tokens and FCM; guarded when envs missing. Endpoints: `/api/auth/firebase`, `/api/users/fcm-token`.

## API surface
- Base router mounted at `/api` (`src/routes/index.ts`). Legacy workflow: `/auth`, `/users`, `/hotels`, `/bookings`, `/payments`.
- New CRUD v1 surface under `/api/v1`: `/cities`, `/cities/:cityId/hotels`, `/hotels/:hotelId/rooms`, as well as `/hotels/:hotelId` and `/rooms/:roomId` resources.
- Health: `GET /api/health` (keep lightweight). Docs: `/api-docs` for Swagger UI; `GET /api/docs` returns an overview JSON.

## How to add features (concrete pattern)
- Create a route factory `createXRoutes(dataSource)` in `src/routes/` with Swagger JSDoc. Register it in `src/routes/index.ts` under `/api` or `/api/v1`.
- In controllers, obtain repos via `dataSource.getRepository(Entity)` from the DI’d instance. Log state changes to `payment_logs` when touching payments/booking status.
- Update enums or entities in `src/models/**` and export via `src/models/index.ts`; generate a migration (`npm run migration:generate`). Keep JSDoc schemas in sync.

## References
- Onboarding and DB: `DATABASE_SETUP.md`, `docs/DEVELOPER_GUIDE.md`.
- Seeding details and volumes: `SEEDING_GUIDE.md`, seeders in `src/seeds/**` and `scripts/seed.js`.
- API walkthroughs: `postman/**` and `postman/WORKFLOW-GUIDE.md`.

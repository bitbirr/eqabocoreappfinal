import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
  name = 'InitialMigration1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Extensions
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    // Create ENUM types
    await queryRunner.query(`CREATE TYPE "user_role_enum" AS ENUM('customer', 'hotel_owner', 'admin')`);
    await queryRunner.query(`CREATE TYPE "hotel_status_enum" AS ENUM('active', 'inactive', 'suspended')`);
    await queryRunner.query(`CREATE TYPE "room_status_enum" AS ENUM('available', 'occupied', 'maintenance', 'out_of_order')`);
    await queryRunner.query(`CREATE TYPE "booking_status_enum" AS ENUM('pending', 'confirmed', 'cancelled', 'expired', 'refunded')`);
    await queryRunner.query(`CREATE TYPE "payment_provider_enum" AS ENUM('chappa', 'telebirr', 'ebirr', 'kaafi')`);
    await queryRunner.query(`CREATE TYPE "payment_status_enum" AS ENUM('pending', 'success', 'failed')`);

    // Users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "first_name" character varying(100) NOT NULL,
        "last_name" character varying(100) NOT NULL,
        "email" character varying(255) NOT NULL,
        "phone" character varying(20) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "role" "user_role_enum" NOT NULL DEFAULT 'customer',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_phone" UNIQUE ("phone")
      )
    `);

    // Hotels table
    await queryRunner.query(`
      CREATE TABLE "hotels" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "owner_id" uuid,
        "name" text NOT NULL,
        "location" text NOT NULL,
        "description" text,
        "status" "hotel_status_enum" NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_hotels_id" PRIMARY KEY ("id")
      )
    `);

    // Rooms table
    await queryRunner.query(`
      CREATE TABLE "rooms" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "hotel_id" uuid NOT NULL,
        "room_number" text NOT NULL,
        "room_type" text NOT NULL,
        "price_per_night" numeric(10,2) NOT NULL,
        "description" text,
        "status" "room_status_enum" NOT NULL DEFAULT 'available',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_rooms_id" PRIMARY KEY ("id")
      )
    `);

    // Bookings table
    await queryRunner.query(`
      CREATE TABLE "bookings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "hotel_id" uuid NOT NULL,
        "room_id" uuid NOT NULL,
        "checkin_date" date NOT NULL,
        "checkout_date" date NOT NULL,
        "nights" integer NOT NULL,
        "total_amount" numeric(12,2) NOT NULL,
        "status" "booking_status_enum" NOT NULL DEFAULT 'pending',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bookings_id" PRIMARY KEY ("id")
      )
    `);

    // Payments table
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "booking_id" uuid NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "provider" "payment_provider_enum" NOT NULL,
        "provider_reference" text,
        "status" "payment_status_enum" NOT NULL DEFAULT 'pending',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payments_id" PRIMARY KEY ("id")
      )
    `);

    // Payment logs table
    await queryRunner.query(`
      CREATE TABLE "payment_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "payment_id" uuid NOT NULL,
        "booking_id" uuid NOT NULL,
        "action" text NOT NULL,
        "details" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment_logs_id" PRIMARY KEY ("id")
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "idx_rooms_hotel" ON "rooms" ("hotel_id")`);
    await queryRunner.query(`CREATE INDEX "idx_bookings_user" ON "bookings" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_bookings_hotel" ON "bookings" ("hotel_id")`);
    await queryRunner.query(`CREATE INDEX "idx_bookings_room" ON "bookings" ("room_id")`);
    await queryRunner.query(`CREATE INDEX "idx_payments_booking" ON "payments" ("booking_id")`);
    await queryRunner.query(`CREATE INDEX "idx_payment_logs_payment" ON "payment_logs" ("payment_id")`);
    await queryRunner.query(`CREATE INDEX "idx_payment_logs_booking" ON "payment_logs" ("booking_id")`);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "hotels"
      ADD CONSTRAINT "FK_hotels_owner_id"
      FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "rooms"
      ADD CONSTRAINT "FK_rooms_hotel_id"
      FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "bookings"
      ADD CONSTRAINT "FK_bookings_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "bookings"
      ADD CONSTRAINT "FK_bookings_hotel_id"
      FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "bookings"
      ADD CONSTRAINT "FK_bookings_room_id"
      FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "payments"
      ADD CONSTRAINT "FK_payments_booking_id"
      FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "payment_logs"
      ADD CONSTRAINT "FK_payment_logs_payment_id"
      FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "payment_logs"
      ADD CONSTRAINT "FK_payment_logs_booking_id"
      FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "payment_logs" DROP CONSTRAINT IF EXISTS "FK_payment_logs_booking_id"`);
    await queryRunner.query(`ALTER TABLE "payment_logs" DROP CONSTRAINT IF EXISTS "FK_payment_logs_payment_id"`);
    await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "FK_payments_booking_id"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "FK_bookings_room_id"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "FK_bookings_hotel_id"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "FK_bookings_user_id"`);
    await queryRunner.query(`ALTER TABLE "rooms" DROP CONSTRAINT IF EXISTS "FK_rooms_hotel_id"`);
    await queryRunner.query(`ALTER TABLE "hotels" DROP CONSTRAINT IF EXISTS "FK_hotels_owner_id"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_payment_logs_booking"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_payment_logs_payment"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_payments_booking"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_bookings_room"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_bookings_hotel"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_bookings_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_bookings_room_dates"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_rooms_hotel"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "payment_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bookings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rooms"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "hotels"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

    // Drop ENUM types
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_provider_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "booking_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "room_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "hotel_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
  }
}
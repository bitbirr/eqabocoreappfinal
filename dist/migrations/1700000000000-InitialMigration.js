"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialMigration1700000000000 = void 0;
class InitialMigration1700000000000 {
    constructor() {
        this.name = 'InitialMigration1700000000000';
    }
    async up(queryRunner) {
        // Extensions
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
        // Create ENUM types
        await queryRunner.query(`CREATE TYPE "user_role_enum" AS ENUM('customer', 'hotel_owner', 'admin')`);
        await queryRunner.query(`CREATE TYPE "hotel_status_enum" AS ENUM('active', 'inactive', 'suspended')`);
        await queryRunner.query(`CREATE TYPE "room_status_enum" AS ENUM('available', 'occupied', 'maintenance', 'out_of_order')`);
        await queryRunner.query(`CREATE TYPE "booking_status_enum" AS ENUM('pending_payment', 'confirmed', 'cancelled', 'expired', 'refunded')`);
        await queryRunner.query(`CREATE TYPE "payment_provider_enum" AS ENUM('chappa', 'telebirr', 'ebirr', 'kaafi')`);
        await queryRunner.query(`CREATE TYPE "payment_status_enum" AS ENUM('pending', 'success', 'failed')`);
        // Users table
        await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "email" text,
        "phone" text,
        "password_hash" text,
        "role" "user_role_enum" NOT NULL DEFAULT 'customer',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
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
        CONSTRAINT "PK_2bb06797684115a1ba7c705fc7b" PRIMARY KEY ("id")
      )
    `);
        // Rooms table
        await queryRunner.query(`
      CREATE TABLE "rooms" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "hotel_id" uuid NOT NULL,
        "room_type" text NOT NULL,
        "price_per_night" numeric(12,2) NOT NULL,
        "capacity" integer NOT NULL,
        "status" "room_status_enum" NOT NULL DEFAULT 'available',
        CONSTRAINT "PK_0368a2d7c215f2d0458a54933f2" PRIMARY KEY ("id")
      )
    `);
        // Bookings table
        await queryRunner.query(`
      CREATE TABLE "bookings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid,
        "hotel_id" uuid NOT NULL,
        "room_id" uuid NOT NULL,
        "checkin_date" date NOT NULL,
        "checkout_date" date NOT NULL,
        "nights" integer NOT NULL GENERATED ALWAYS AS (GREATEST(1, (checkout_date - checkin_date))) STORED,
        "total_amount" numeric(12,2) NOT NULL,
        "status" "booking_status_enum" NOT NULL DEFAULT 'pending_payment',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id")
      )
    `);
        // Payments table
        await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "booking_id" uuid NOT NULL,
        "provider" "payment_provider_enum" NOT NULL,
        "provider_ref" text,
        "amount" numeric(12,2) NOT NULL,
        "status" "payment_status_enum" NOT NULL DEFAULT 'pending',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id")
      )
    `);
        // Payment logs table
        await queryRunner.query(`
      CREATE TABLE "payment_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "booking_id" uuid,
        "provider" text,
        "payload" jsonb,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_7b7411e9b1b8b8b8b8b8b8b8b8b" PRIMARY KEY ("id")
      )
    `);
        // Create indexes
        await queryRunner.query(`CREATE INDEX "idx_rooms_hotel" ON "rooms" ("hotel_id")`);
        await queryRunner.query(`CREATE INDEX "idx_bookings_room_dates" ON "bookings" ("room_id", "checkin_date", "checkout_date", "status")`);
        await queryRunner.query(`CREATE INDEX "idx_payments_booking" ON "payments" ("booking_id")`);
        // Add foreign key constraints
        await queryRunner.query(`
      ALTER TABLE "hotels" 
      ADD CONSTRAINT "FK_hotels_owner_id" 
      FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "rooms" 
      ADD CONSTRAINT "FK_rooms_hotel_id" 
      FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "bookings" 
      ADD CONSTRAINT "FK_bookings_user_id" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "bookings" 
      ADD CONSTRAINT "FK_bookings_hotel_id" 
      FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "bookings" 
      ADD CONSTRAINT "FK_bookings_room_id" 
      FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "payments" 
      ADD CONSTRAINT "FK_payments_booking_id" 
      FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "payment_logs" 
      ADD CONSTRAINT "FK_payment_logs_booking_id" 
      FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    }
    async down(queryRunner) {
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "payment_logs" DROP CONSTRAINT "FK_payment_logs_booking_id"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_booking_id"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_room_id"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_hotel_id"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_user_id"`);
        await queryRunner.query(`ALTER TABLE "rooms" DROP CONSTRAINT "FK_rooms_hotel_id"`);
        await queryRunner.query(`ALTER TABLE "hotels" DROP CONSTRAINT "FK_hotels_owner_id"`);
        // Drop indexes
        await queryRunner.query(`DROP INDEX "idx_payments_booking"`);
        await queryRunner.query(`DROP INDEX "idx_bookings_room_dates"`);
        await queryRunner.query(`DROP INDEX "idx_rooms_hotel"`);
        // Drop tables
        await queryRunner.query(`DROP TABLE "payment_logs"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`DROP TABLE "rooms"`);
        await queryRunner.query(`DROP TABLE "hotels"`);
        await queryRunner.query(`DROP TABLE "users"`);
        // Drop ENUM types
        await queryRunner.query(`DROP TYPE "payment_status_enum"`);
        await queryRunner.query(`DROP TYPE "payment_provider_enum"`);
        await queryRunner.query(`DROP TYPE "booking_status_enum"`);
        await queryRunner.query(`DROP TYPE "room_status_enum"`);
        await queryRunner.query(`DROP TYPE "hotel_status_enum"`);
        await queryRunner.query(`DROP TYPE "user_role_enum"`);
    }
}
exports.InitialMigration1700000000000 = InitialMigration1700000000000;

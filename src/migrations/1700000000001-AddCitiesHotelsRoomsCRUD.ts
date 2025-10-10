export class AddCitiesHotelsRoomsCRUD1700000000001 {
  name = 'AddCitiesHotelsRoomsCRUD1700000000001';

  public async up(queryRunner: any): Promise<void> {
    // Create city_status_enum
    await queryRunner.query(`CREATE TYPE "city_status_enum" AS ENUM('active', 'disabled')`);
    
    // Update hotel_status_enum to include 'disabled'
    await queryRunner.query(`ALTER TYPE "hotel_status_enum" ADD VALUE IF NOT EXISTS 'disabled'`);
    
    // Update room_status_enum to include new statuses
    await queryRunner.query(`CREATE TYPE "room_status_new_enum" AS ENUM('Available', 'Reserved', 'occupied', 'maintenance', 'out_of_order')`);
    
    // Create room_type_enum
    await queryRunner.query(`CREATE TYPE "room_type_enum" AS ENUM('single', 'double', 'suite')`);

    // Create cities table
    await queryRunner.query(`
      CREATE TABLE "cities" (
        "cityId" SERIAL NOT NULL,
        "cityName" character varying(100) NOT NULL,
        "gps" character varying(50) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "status" "city_status_enum" NOT NULL DEFAULT 'active',
        CONSTRAINT "PK_cities_cityId" PRIMARY KEY ("cityId"),
        CONSTRAINT "UQ_cities_cityName" UNIQUE ("cityName")
      )
    `);

    // Add new columns to hotels table
    await queryRunner.query(`ALTER TABLE "hotels" ADD "hotelId" SERIAL`);
    await queryRunner.query(`ALTER TABLE "hotels" ADD "cityId" integer NOT NULL DEFAULT 1`);
    await queryRunner.query(`ALTER TABLE "hotels" ADD "hotelName" character varying(100)`);
    await queryRunner.query(`ALTER TABLE "hotels" ADD "address" character varying(255)`);
    await queryRunner.query(`ALTER TABLE "hotels" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    
    // Update existing hotel data to use new columns
    await queryRunner.query(`UPDATE "hotels" SET "hotelName" = "name", "address" = "location" WHERE "hotelName" IS NULL`);
    
    // Make hotelName NOT NULL after populating
    await queryRunner.query(`ALTER TABLE "hotels" ALTER COLUMN "hotelName" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "hotels" ALTER COLUMN "address" SET NOT NULL`);

    // Create index for hotels.cityId
    await queryRunner.query(`CREATE INDEX "idx_hotels_city" ON "hotels"("cityId")`);

    // Add new columns to rooms table
    await queryRunner.query(`ALTER TABLE "rooms" ADD "roomId" SERIAL`);
    await queryRunner.query(`ALTER TABLE "rooms" ADD "hotelId" integer`);
    await queryRunner.query(`ALTER TABLE "rooms" ADD "roomNumber" character varying(10)`);
    await queryRunner.query(`ALTER TABLE "rooms" ADD "roomType" "room_type_enum"`);
    await queryRunner.query(`ALTER TABLE "rooms" ADD "price" numeric(10,2)`);
    await queryRunner.query(`ALTER TABLE "rooms" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    
    // Update existing room data to use new columns
    await queryRunner.query(`UPDATE "rooms" SET "roomNumber" = "room_number", "price" = "price_per_night" WHERE "roomNumber" IS NULL`);
    await queryRunner.query(`UPDATE "rooms" SET "roomType" = 'single' WHERE "roomType" IS NULL AND "room_type" ILIKE '%single%'`);
    await queryRunner.query(`UPDATE "rooms" SET "roomType" = 'double' WHERE "roomType" IS NULL AND "room_type" ILIKE '%double%'`);
    await queryRunner.query(`UPDATE "rooms" SET "roomType" = 'suite' WHERE "roomType" IS NULL AND "room_type" ILIKE '%suite%'`);
    await queryRunner.query(`UPDATE "rooms" SET "roomType" = 'single' WHERE "roomType" IS NULL`);
    
    // Drop default to avoid cast error during type change
    await queryRunner.query(`ALTER TABLE "rooms" ALTER COLUMN "status" DROP DEFAULT`);

    // Migrate room status to new enum values
    await queryRunner.query(`ALTER TABLE "rooms" ALTER COLUMN "status" TYPE "room_status_new_enum" USING (
      CASE 
        WHEN "status"::text = 'available' THEN 'Available'::room_status_new_enum
        WHEN "status"::text = 'occupied' THEN 'Reserved'::room_status_new_enum
        ELSE "status"::text::room_status_new_enum
      END
    )`);
    
    // Make new columns NOT NULL after populating
    await queryRunner.query(`ALTER TABLE "rooms" ALTER COLUMN "roomNumber" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "rooms" ALTER COLUMN "roomType" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "rooms" ALTER COLUMN "price" SET NOT NULL`);

    // Update index for rooms to use hotelId
    await queryRunner.query(`CREATE INDEX "idx_rooms_hotel_new" ON "rooms"("hotelId")`);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "hotels"
      ADD CONSTRAINT "FK_hotels_cityId"
      FOREIGN KEY ("cityId") REFERENCES "cities"("cityId") ON DELETE CASCADE ON UPDATE CASCADE
    `);

    // Drop old room_status_enum and rename new one
    await queryRunner.query(`DROP TYPE "room_status_enum"`);
    await queryRunner.query(`ALTER TYPE "room_status_new_enum" RENAME TO "room_status_enum"`);

    // Restore default on status to the new enum
    await queryRunner.query(`ALTER TABLE "rooms" ALTER COLUMN "status" SET DEFAULT 'Available'::room_status_enum`);
  }

  public async down(queryRunner: any): Promise<void> {
    // Remove foreign key constraints
    await queryRunner.query(`ALTER TABLE "hotels" DROP CONSTRAINT IF EXISTS "FK_hotels_cityId"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_rooms_hotel_new"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_hotels_city"`);

    // Remove new columns from rooms table
    await queryRunner.query(`ALTER TABLE "rooms" DROP COLUMN IF EXISTS "updated_at"`);
    await queryRunner.query(`ALTER TABLE "rooms" DROP COLUMN IF EXISTS "price"`);
    await queryRunner.query(`ALTER TABLE "rooms" DROP COLUMN IF EXISTS "roomType"`);
    await queryRunner.query(`ALTER TABLE "rooms" DROP COLUMN IF EXISTS "roomNumber"`);
    await queryRunner.query(`ALTER TABLE "rooms" DROP COLUMN IF EXISTS "hotelId"`);
    await queryRunner.query(`ALTER TABLE "rooms" DROP COLUMN IF EXISTS "roomId"`);

    // Remove new columns from hotels table
    await queryRunner.query(`ALTER TABLE "hotels" DROP COLUMN IF EXISTS "updated_at"`);
    await queryRunner.query(`ALTER TABLE "hotels" DROP COLUMN IF EXISTS "address"`);
    await queryRunner.query(`ALTER TABLE "hotels" DROP COLUMN IF EXISTS "hotelName"`);
    await queryRunner.query(`ALTER TABLE "hotels" DROP COLUMN IF EXISTS "cityId"`);
    await queryRunner.query(`ALTER TABLE "hotels" DROP COLUMN IF EXISTS "hotelId"`);

    // Drop cities table
    await queryRunner.query(`DROP TABLE IF EXISTS "cities"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS "room_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "city_status_enum"`);
  }
}

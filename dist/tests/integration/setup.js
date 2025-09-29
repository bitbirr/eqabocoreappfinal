"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testRoom = exports.testHotel = exports.testUser = exports.dataSource = exports.app = void 0;
require("reflect-metadata");
// Set test environment and database config for Neon
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'ep-plain-dew-aduqg6c2-pooler.c-2.us-east-1.aws.neon.tech';
process.env.DB_USER = 'neondb_owner';
process.env.DB_PASS = 'npg_Nsmf62QTtDzb';
process.env.DB_NAME = 'eqabo_hotel_booking_test';
const database_1 = require("../../config/database");
const app_1 = require("../../app");
const models_1 = require("../../models");
const models_2 = require("../../models");
// Initialize test app
let app;
let dataSource;
let testUser;
let testHotel;
let testRoom;
beforeAll(async () => {
    // Initialize database
    exports.dataSource = dataSource = database_1.AppDataSource;
    await dataSource.initialize();
    await dataSource.synchronize(); // Ensure tables are created for tests
    // Create app
    exports.app = app = (0, app_1.createApp)(dataSource);
    // Seed minimal test data
    await seedTestData(dataSource);
}, 60000);
afterAll(async () => {
    // Close database connection
    if (dataSource && dataSource.isInitialized) {
        await dataSource.destroy();
    }
});
async function seedTestData(dataSource) {
    // Clear existing data
    await dataSource.query('TRUNCATE TABLE payment_logs, payments, bookings, rooms, hotels, users CASCADE;');
    // Create test user
    const userRepo = dataSource.getRepository(models_1.User);
    exports.testUser = testUser = userRepo.create({
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        phone: '+251911111111',
        role: models_2.UserRole.CUSTOMER,
        password_hash: 'hashed_password'
    });
    await userRepo.save(testUser);
    // Create test hotel
    const hotelRepo = dataSource.getRepository(models_1.Hotel);
    exports.testHotel = testHotel = hotelRepo.create({
        name: 'Test Hotel',
        location: 'Addis Ababa',
        description: 'A test hotel',
        status: models_2.HotelStatus.ACTIVE,
        owner_id: testUser.id
    });
    await hotelRepo.save(testHotel);
    // Create test room
    const roomRepo = dataSource.getRepository(models_1.Room);
    exports.testRoom = testRoom = roomRepo.create({
        hotel_id: testHotel.id,
        room_number: '101',
        room_type: 'Standard',
        price_per_night: 100,
        status: models_2.RoomStatus.AVAILABLE
    });
    await roomRepo.save(testRoom);
}

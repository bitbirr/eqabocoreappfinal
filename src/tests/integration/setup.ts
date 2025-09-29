import 'reflect-metadata';

// Set test environment and database config for Neon
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'ep-plain-dew-aduqg6c2-pooler.c-2.us-east-1.aws.neon.tech';
process.env.DB_USER = 'neondb_owner';
process.env.DB_PASS = 'npg_Nsmf62QTtDzb';
process.env.DB_NAME = 'eqabo_hotel_booking_test';

import { AppDataSource } from '../../config/database';
import { createApp } from '../../app';
import { User, Hotel, Room } from '../../models';
import { UserRole, HotelStatus, RoomStatus } from '../../models';

// Initialize test app
let app: any;
let dataSource: any;
let testUser: any;
let testHotel: any;
let testRoom: any;

beforeAll(async () => {
  // Initialize database
  dataSource = AppDataSource;
  await dataSource.initialize();
  await dataSource.synchronize(); // Ensure tables are created for tests

  // Create app
  app = createApp(dataSource);

  // Seed minimal test data
  await seedTestData(dataSource);
}, 60000);

afterAll(async () => {
  // Close database connection
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
  }
});

async function seedTestData(dataSource: any) {
  // Clear existing data
  await dataSource.query('TRUNCATE TABLE payment_logs, payments, bookings, rooms, hotels, users CASCADE;');

  // Create test user
  const userRepo = dataSource.getRepository(User);
  testUser = userRepo.create({
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    phone: '+251911111111',
    role: UserRole.CUSTOMER,
    password_hash: 'hashed_password'
  });
  await userRepo.save(testUser);

  // Create test hotel
  const hotelRepo = dataSource.getRepository(Hotel);
  testHotel = hotelRepo.create({
    name: 'Test Hotel',
    location: 'Addis Ababa',
    description: 'A test hotel',
    status: HotelStatus.ACTIVE,
    owner_id: testUser.id
  });
  await hotelRepo.save(testHotel);

  // Create test room
  const roomRepo = dataSource.getRepository(Room);
  testRoom = roomRepo.create({
    hotel_id: testHotel.id,
    room_number: '101',
    room_type: 'Standard',
    price_per_night: 100,
    status: RoomStatus.AVAILABLE
  });
  await roomRepo.save(testRoom);
}

export { app, dataSource, testUser, testHotel, testRoom };
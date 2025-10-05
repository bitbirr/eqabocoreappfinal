"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseSeeder = void 0;
const database_1 = require("../config/database");
const models_1 = require("../models");
const seedData_1 = require("./data/seedData");
class DatabaseSeeder {
    constructor() { }
    static getInstance() {
        if (!DatabaseSeeder.instance) {
            DatabaseSeeder.instance = new DatabaseSeeder();
        }
        return DatabaseSeeder.instance;
    }
    async seedAll() {
        console.log('🌱 Starting database seeding...');
        try {
            // Clear existing data (in reverse order of dependencies)
            await this.clearData();
            // Seed data in order of dependencies
            const users = await this.seedUsers();
            const hotels = await this.seedHotels(users);
            const rooms = await this.seedRooms(hotels);
            const bookings = await this.seedBookings(users, hotels, rooms);
            const payments = await this.seedPayments(bookings);
            await this.seedPaymentLogs(bookings);
            console.log('✅ Database seeding completed successfully!');
            console.log(`📊 Seeded: ${users.length} users, ${hotels.length} hotels, ${rooms.length} rooms, ${bookings.length} bookings, ${payments.length} payments`);
        }
        catch (error) {
            console.error('❌ Error during database seeding:', error);
            throw error;
        }
    }
    async clearData() {
        console.log('🧹 Clearing existing data...');
        const queryRunner = database_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            // Disable foreign key checks temporarily
            await queryRunner.query('SET session_replication_role = replica;');
            // Clear tables in reverse order of dependencies
            await queryRunner.query('DELETE FROM payment_logs');
            await queryRunner.query('DELETE FROM payments');
            await queryRunner.query('DELETE FROM bookings');
            await queryRunner.query('DELETE FROM rooms');
            await queryRunner.query('DELETE FROM hotels');
            await queryRunner.query('DELETE FROM users');
            // Re-enable foreign key checks
            await queryRunner.query('SET session_replication_role = DEFAULT;');
            console.log('✅ Existing data cleared');
        }
        finally {
            await queryRunner.release();
        }
    }
    async seedUsers() {
        console.log('👥 Seeding users...');
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        const users = [];
        for (const userData of seedData_1.seedUsers) {
            const user = userRepository.create(userData);
            const savedUser = await userRepository.save(user);
            users.push(savedUser);
        }
        console.log(`✅ Seeded ${users.length} users`);
        return users;
    }
    async seedHotels(users) {
        console.log('🏨 Seeding hotels...');
        const hotelRepository = database_1.AppDataSource.getRepository(models_1.Hotel);
        const hotels = [];
        // Get hotel owners (users with HOTEL_OWNER role)
        const hotelOwners = users.filter(user => user.role === 'hotel_owner');
        for (let i = 0; i < seedData_1.seedHotels.length; i++) {
            const hotelData = seedData_1.seedHotels[i];
            const owner = hotelOwners[i % hotelOwners.length]; // Cycle through owners
            const hotel = hotelRepository.create({
                ...hotelData,
                owner_id: owner.id
            });
            const savedHotel = await hotelRepository.save(hotel);
            hotels.push(savedHotel);
        }
        console.log(`✅ Seeded ${hotels.length} hotels`);
        return hotels;
    }
    async seedRooms(hotels) {
        console.log('🛏️ Seeding rooms...');
        const roomRepository = database_1.AppDataSource.getRepository(models_1.Room);
        const rooms = [];
        let roomIndex = 0;
        for (const hotel of hotels) {
            // Each hotel gets 3-4 rooms
            const roomsPerHotel = Math.floor(seedData_1.seedRooms.length / hotels.length);
            const startIndex = roomIndex;
            const endIndex = Math.min(roomIndex + roomsPerHotel, seedData_1.seedRooms.length);
            for (let i = startIndex; i < endIndex; i++) {
                const roomData = seedData_1.seedRooms[i];
                const room = roomRepository.create({
                    ...roomData,
                    hotel_id: hotel.id
                });
                const savedRoom = await roomRepository.save(room);
                rooms.push(savedRoom);
            }
            roomIndex = endIndex;
        }
        console.log(`✅ Seeded ${rooms.length} rooms`);
        return rooms;
    }
    async seedBookings(users, hotels, rooms) {
        console.log('📅 Seeding bookings...');
        const bookingRepository = database_1.AppDataSource.getRepository(models_1.Booking);
        const bookings = [];
        // Get customers only
        const customers = users.filter(user => user.role === 'customer');
        for (let i = 0; i < seedData_1.seedBookings.length; i++) {
            const bookingData = seedData_1.seedBookings[i];
            const customer = customers[i % customers.length];
            const room = rooms[i % rooms.length];
            const hotel = hotels.find(h => h.id === room.hotel_id);
            if (!hotel)
                continue;
            const booking = bookingRepository.create({
                ...bookingData,
                user_id: customer.id,
                hotel_id: hotel.id,
                room_id: room.id
            });
            const savedBooking = await bookingRepository.save(booking);
            bookings.push(savedBooking);
        }
        console.log(`✅ Seeded ${bookings.length} bookings`);
        return bookings;
    }
    async seedPayments(bookings) {
        console.log('💳 Seeding payments...');
        const paymentRepository = database_1.AppDataSource.getRepository(models_1.Payment);
        const payments = [];
        for (let i = 0; i < seedData_1.seedPayments.length && i < bookings.length; i++) {
            const paymentData = seedData_1.seedPayments[i];
            const booking = bookings[i];
            const payment = paymentRepository.create({
                ...paymentData,
                booking_id: booking.id
            });
            const savedPayment = await paymentRepository.save(payment);
            payments.push(savedPayment);
        }
        console.log(`✅ Seeded ${payments.length} payments`);
        return payments;
    }
    async seedPaymentLogs(bookings) {
        console.log('📋 Seeding payment logs...');
        const paymentLogRepository = database_1.AppDataSource.getRepository(models_1.PaymentLog);
        const paymentLogs = [];
        for (let i = 0; i < seedData_1.seedPaymentLogs.length && i < bookings.length; i++) {
            const logData = seedData_1.seedPaymentLogs[i];
            const booking = bookings[i];
            const paymentLog = paymentLogRepository.create({
                ...logData,
                booking_id: booking.id
            });
            const savedLog = await paymentLogRepository.save(paymentLog);
            paymentLogs.push(savedLog);
        }
        console.log(`✅ Seeded ${paymentLogs.length} payment logs`);
        return paymentLogs;
    }
    async seedUsersOnly() {
        console.log('👥 Seeding users only...');
        await database_1.AppDataSource.getRepository(models_1.User).delete({});
        return await this.seedUsers();
    }
    async seedHotelsOnly() {
        console.log('🏨 Seeding hotels only...');
        const users = await database_1.AppDataSource.getRepository(models_1.User).find();
        await database_1.AppDataSource.getRepository(models_1.Hotel).delete({});
        return await this.seedHotels(users);
    }
    async getSeededDataSummary() {
        const userCount = await database_1.AppDataSource.getRepository(models_1.User).count();
        const hotelCount = await database_1.AppDataSource.getRepository(models_1.Hotel).count();
        const roomCount = await database_1.AppDataSource.getRepository(models_1.Room).count();
        const bookingCount = await database_1.AppDataSource.getRepository(models_1.Booking).count();
        const paymentCount = await database_1.AppDataSource.getRepository(models_1.Payment).count();
        const paymentLogCount = await database_1.AppDataSource.getRepository(models_1.PaymentLog).count();
        return {
            users: userCount,
            hotels: hotelCount,
            rooms: roomCount,
            bookings: bookingCount,
            payments: paymentCount,
            paymentLogs: paymentLogCount,
            total: userCount + hotelCount + roomCount + bookingCount + paymentCount + paymentLogCount
        };
    }
}
exports.DatabaseSeeder = DatabaseSeeder;

import { AppDataSource } from '../config/database';
import { User, Hotel, Room, Booking, Payment, PaymentLog } from '../models';
import { seedUsers, seedHotels, seedRooms, seedBookings, seedPayments, seedPaymentLogs } from './data/seedData';

export class DatabaseSeeder {
  private static instance: DatabaseSeeder;

  private constructor() {}

  public static getInstance(): DatabaseSeeder {
    if (!DatabaseSeeder.instance) {
      DatabaseSeeder.instance = new DatabaseSeeder();
    }
    return DatabaseSeeder.instance;
  }

  public async seedAll(): Promise<void> {
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
    } catch (error) {
      console.error('❌ Error during database seeding:', error);
      throw error;
    }
  }

  private async clearData(): Promise<void> {
    console.log('🧹 Clearing existing data...');
    
    const queryRunner = AppDataSource.createQueryRunner();
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
    } finally {
      await queryRunner.release();
    }
  }

  private async seedUsers(): Promise<User[]> {
    console.log('👥 Seeding users...');
    
    const userRepository = AppDataSource.getRepository(User);
    const users: User[] = [];

    for (const userData of seedUsers) {
      const user = userRepository.create(userData);
      const savedUser = await userRepository.save(user);
      users.push(savedUser);
    }

    console.log(`✅ Seeded ${users.length} users`);
    return users;
  }

  private async seedHotels(users: User[]): Promise<Hotel[]> {
    console.log('🏨 Seeding hotels...');
    
    const hotelRepository = AppDataSource.getRepository(Hotel);
    const hotels: Hotel[] = [];

    // Get hotel owners (users with HOTEL_OWNER role)
    const hotelOwners = users.filter(user => user.role === 'hotel_owner');

    for (let i = 0; i < seedHotels.length; i++) {
      const hotelData = seedHotels[i];
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

  private async seedRooms(hotels: Hotel[]): Promise<Room[]> {
    console.log('🛏️ Seeding rooms...');
    
    const roomRepository = AppDataSource.getRepository(Room);
    const rooms: Room[] = [];

    let roomIndex = 0;
    for (const hotel of hotels) {
      // Each hotel gets 3-4 rooms
      const roomsPerHotel = Math.floor(seedRooms.length / hotels.length);
      const startIndex = roomIndex;
      const endIndex = Math.min(roomIndex + roomsPerHotel, seedRooms.length);

      for (let i = startIndex; i < endIndex; i++) {
        const roomData = seedRooms[i];
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

  private async seedBookings(users: User[], hotels: Hotel[], rooms: Room[]): Promise<Booking[]> {
    console.log('📅 Seeding bookings...');
    
    const bookingRepository = AppDataSource.getRepository(Booking);
    const bookings: Booking[] = [];

    // Get customers only
    const customers = users.filter(user => user.role === 'customer');

    for (let i = 0; i < seedBookings.length; i++) {
      const bookingData = seedBookings[i];
      const customer = customers[i % customers.length];
      const room = rooms[i % rooms.length];
      const hotel = hotels.find(h => h.id === room.hotel_id);

      if (!hotel) continue;

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

  private async seedPayments(bookings: Booking[]): Promise<Payment[]> {
    console.log('💳 Seeding payments...');
    
    const paymentRepository = AppDataSource.getRepository(Payment);
    const payments: Payment[] = [];

    for (let i = 0; i < seedPayments.length && i < bookings.length; i++) {
      const paymentData = seedPayments[i];
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

  private async seedPaymentLogs(bookings: Booking[]): Promise<PaymentLog[]> {
    console.log('📋 Seeding payment logs...');
    
    const paymentLogRepository = AppDataSource.getRepository(PaymentLog);
    const paymentLogs: PaymentLog[] = [];

    for (let i = 0; i < seedPaymentLogs.length && i < bookings.length; i++) {
      const logData = seedPaymentLogs[i];
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

  public async seedUsersOnly(): Promise<User[]> {
    console.log('👥 Seeding users only...');
    await AppDataSource.getRepository(User).delete({});
    return await this.seedUsers();
  }

  public async seedHotelsOnly(): Promise<Hotel[]> {
    console.log('🏨 Seeding hotels only...');
    const users = await AppDataSource.getRepository(User).find();
    await AppDataSource.getRepository(Hotel).delete({});
    return await this.seedHotels(users);
  }

  public async getSeededDataSummary(): Promise<any> {
    const userCount = await AppDataSource.getRepository(User).count();
    const hotelCount = await AppDataSource.getRepository(Hotel).count();
    const roomCount = await AppDataSource.getRepository(Room).count();
    const bookingCount = await AppDataSource.getRepository(Booking).count();
    const paymentCount = await AppDataSource.getRepository(Payment).count();
    const paymentLogCount = await AppDataSource.getRepository(PaymentLog).count();

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
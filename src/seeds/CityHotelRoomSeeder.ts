import { AppDataSource } from '../config/database';
import { City, Hotel, Room, User } from '../models';
import { seedCities, seedCitiesHotels, seedCitiesRooms } from './data/ethiopianCitiesData';
import { Not, IsNull } from 'typeorm';

export class CityHotelRoomSeeder {
  private static instance: CityHotelRoomSeeder;

  private constructor() {}

  public static getInstance(): CityHotelRoomSeeder {
    if (!CityHotelRoomSeeder.instance) {
      CityHotelRoomSeeder.instance = new CityHotelRoomSeeder();
    }
    return CityHotelRoomSeeder.instance;
  }

  public async seedAll(): Promise<void> {
    console.log('🌱 Starting City-Hotel-Room seeding...');

    try {
      // Clear existing data (in reverse order of dependencies)
      await this.clearData();

      // Seed data in order of dependencies
      const cities = await this.seedCities();
      const hotels = await this.seedHotels(cities);
      const rooms = await this.seedRooms(hotels);

      console.log('✅ City-Hotel-Room seeding completed successfully!');
      console.log(`📊 Seeded: ${cities.length} cities, ${hotels.length} hotels, ${rooms.length} rooms`);
    } catch (error) {
      console.error('❌ Error during seeding:', error);
      throw error;
    }
  }

  private async clearData(): Promise<void> {
    console.log('🧹 Clearing existing city-hotel-room data...');
    
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    let constraintsRelaxed = false;

    try {
      // Disable foreign key checks temporarily
      try {
        await queryRunner.query('SET session_replication_role = replica;');
        constraintsRelaxed = true;
      } catch (error: any) {
        if (error?.code === '42501') {
          console.warn('⚠️  Insufficient privileges to relax constraints; proceeding with standard deletes.');
        } else {
          throw error;
        }
      }

      // Clear tables in reverse order of dependencies
      // Note: This only clears the new tables, not the legacy data
      await queryRunner.query('DELETE FROM rooms WHERE "hotelId" IS NOT NULL');
      await queryRunner.query('DELETE FROM hotels WHERE "cityId" IS NOT NULL');
      await queryRunner.query('DELETE FROM cities');

      if (constraintsRelaxed) {
        await queryRunner.query('SET session_replication_role = DEFAULT;');
      }

      console.log('✅ Existing city-hotel-room data cleared');
    } finally {
      await queryRunner.release();
    }
  }

  private async seedCities(): Promise<City[]> {
    console.log('🏙️  Seeding cities...');
    
    const cityRepository = AppDataSource.getRepository(City);
    const cities: City[] = [];

    for (const cityData of seedCities) {
      const city = cityRepository.create(cityData);
      const savedCity = await cityRepository.save(city);
      cities.push(savedCity);
    }

    console.log(`✅ Seeded ${cities.length} cities`);
    return cities;
  }

  private async seedHotels(cities: City[]): Promise<Hotel[]> {
    console.log('🏨 Seeding hotels...');
    
    const hotelRepository = AppDataSource.getRepository(Hotel);
    const userRepository = AppDataSource.getRepository(User);
    const hotels: Hotel[] = [];

    // Get hotel owners (users with HOTEL_OWNER role)
    const hotelOwners = await userRepository.find({
      where: { role: 'hotel_owner' as any }
    });

    // Create a map of city names to city objects
    const citiesByName = new Map(cities.map(city => [city.cityName, city]));

    for (let i = 0; i < seedCitiesHotels.length; i++) {
      const hotelData = seedCitiesHotels[i];
      const city = citiesByName.get(hotelData.cityName);

      if (!city) {
        console.warn(`⚠️  City not found: ${hotelData.cityName}, skipping hotel ${hotelData.hotelName}`);
        continue;
      }

      // Assign owner if available (cycle through owners)
      const owner = hotelOwners.length > 0 ? hotelOwners[i % hotelOwners.length] : undefined;

      const hotel = hotelRepository.create({
        cityId: city.cityId,
        hotelName: hotelData.hotelName,
        address: hotelData.address,
        name: hotelData.hotelName, // For backward compatibility
        location: hotelData.address, // For backward compatibility
        description: hotelData.description,
        status: hotelData.status,
        owner_id: owner?.id
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

    // Create a map of hotel names to hotel objects
    const hotelsByName = new Map(hotels.map(hotel => [hotel.hotelName, hotel]));

    for (const roomData of seedCitiesRooms) {
      const hotel = hotelsByName.get(roomData.hotelName);

      if (!hotel) {
        console.warn(`⚠️  Hotel not found: ${roomData.hotelName}, skipping room ${roomData.roomNumber}`);
        continue;
      }

      const room = roomRepository.create({
        hotelId: hotel.hotelId,
        hotel_id: hotel.id, // UUID for backward compatibility
        roomNumber: roomData.roomNumber,
        roomType: roomData.roomType,
        price: roomData.price,
        room_number: roomData.roomNumber, // For backward compatibility
        room_type: roomData.roomType, // For backward compatibility
        price_per_night: roomData.price, // For backward compatibility
        description: roomData.description,
        status: roomData.status
      });

      const savedRoom = await roomRepository.save(room);
      rooms.push(savedRoom);
    }

    console.log(`✅ Seeded ${rooms.length} rooms`);
    return rooms;
  }

  public async seedCitiesOnly(): Promise<City[]> {
    console.log('🏙️  Seeding cities only...');
    const cityRepository = AppDataSource.getRepository(City);
    await cityRepository.delete({});
    return await this.seedCities();
  }

  public async seedHotelsOnly(): Promise<Hotel[]> {
    console.log('🏨 Seeding hotels only...');
    const cities = await AppDataSource.getRepository(City).find();
    const hotelRepository = AppDataSource.getRepository(Hotel);
    await hotelRepository.createQueryBuilder()
      .delete()
      .where('"cityId" IS NOT NULL')
      .execute();
    return await this.seedHotels(cities);
  }

  public async getSeededDataSummary(): Promise<any> {
    const cityCount = await AppDataSource.getRepository(City).count();
    const hotelCount = await AppDataSource.getRepository(Hotel).count();
    const roomCount = await AppDataSource.getRepository(Room).count();

    return {
      cities: cityCount,
      hotels: hotelCount,
      rooms: roomCount,
      total: cityCount + hotelCount + roomCount
    };
  }
}

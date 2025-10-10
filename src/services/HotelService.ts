import { Repository, DataSource } from 'typeorm';
import { Hotel, HotelStatus } from '../models/Hotel';
import { City, CityStatus } from '../models/City';
import { Room, RoomStatus } from '../models/Room';

export class HotelService {
  private hotelRepository: Repository<Hotel>;
  private cityRepository: Repository<City>;
  private roomRepository: Repository<Room>;

  constructor(dataSource: DataSource) {
    this.hotelRepository = dataSource.getRepository(Hotel);
    this.cityRepository = dataSource.getRepository(City);
    this.roomRepository = dataSource.getRepository(Room);
  }

  /**
   * Create a new hotel
   */
  async createHotel(cityId: number, hotelName: string, address: string): Promise<Hotel> {
    // Validate inputs
    if (!hotelName || hotelName.trim().length === 0) {
      throw new Error('Hotel name is required');
    }

    if (hotelName.length > 100) {
      throw new Error('Hotel name must not exceed 100 characters');
    }

    if (!address || address.trim().length === 0) {
      throw new Error('Address is required');
    }

    if (address.length > 255) {
      throw new Error('Address must not exceed 255 characters');
    }

    // Verify city exists and is active
    const city = await this.cityRepository.findOne({
      where: { cityId }
    });

    if (!city) {
      throw new Error('City not found');
    }

    if (city.status !== CityStatus.ACTIVE) {
      throw new Error('City is not active');
    }

    // Create hotel
    const hotel = this.hotelRepository.create({
      cityId,
      hotelName,
      address,
      name: hotelName, // For backward compatibility
      location: address, // For backward compatibility
      status: HotelStatus.ACTIVE
    });

    return await this.hotelRepository.save(hotel);
  }

  /**
   * Get all hotels for a city with pagination
   */
  async getHotelsByCity(cityId: number, page: number = 1, limit: number = 20): Promise<{ hotels: Hotel[]; total: number; page: number; limit: number }> {
    // Verify city exists
    const city = await this.cityRepository.findOne({
      where: { cityId }
    });

    if (!city) {
      throw new Error('City not found');
    }

    const skip = (page - 1) * limit;

    const [hotels, total] = await this.hotelRepository.findAndCount({
      where: { cityId },
      order: {
        created_at: 'DESC'
      },
      take: limit,
      skip
    });

    return { hotels, total, page, limit };
  }

  /**
   * Get hotel by ID
   */
  async getHotelById(hotelId: number): Promise<Hotel | null> {
    const hotel = await this.hotelRepository.findOne({
      where: { hotelId },
      relations: ['city', 'rooms']
    });

    return hotel;
  }

  /**
   * Update hotel
   */
  async updateHotel(hotelId: number, updates: Partial<Hotel>): Promise<Hotel> {
    const hotel = await this.hotelRepository.findOne({
      where: { hotelId }
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    // Validate hotel name if being updated
    if (updates.hotelName) {
      if (updates.hotelName.length > 100) {
        throw new Error('Hotel name must not exceed 100 characters');
      }
    }

    // Validate address if being updated
    if (updates.address) {
      if (updates.address.length > 255) {
        throw new Error('Address must not exceed 255 characters');
      }
    }

    // If status is changing, validate it won't affect reserved rooms
    if (updates.status && updates.status !== hotel.status) {
      // You can add additional validation here if needed
    }

    // Apply updates
    Object.assign(hotel, updates);
    
    // Update backward compatibility fields
    if (updates.hotelName) hotel.name = updates.hotelName;
    if (updates.address) hotel.location = updates.address;
    
    hotel.updated_at = new Date();

    return await this.hotelRepository.save(hotel);
  }

  /**
   * Soft delete hotel (set status to disabled)
   */
  async deleteHotel(hotelId: number): Promise<void> {
    const hotel = await this.hotelRepository.findOne({
      where: { hotelId }
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    // Check if hotel has reserved rooms
    const reservedRoomsCount = await this.roomRepository.count({
      where: {
        hotelId,
        status: RoomStatus.RESERVED
      }
    });

    if (reservedRoomsCount > 0) {
      throw new Error(`Cannot delete hotel with ${reservedRoomsCount} reserved room(s). Please wait for reservations to complete.`);
    }

    // Soft delete by setting status to disabled
    hotel.status = HotelStatus.DISABLED;
    hotel.updated_at = new Date();
    await this.hotelRepository.save(hotel);
  }
}

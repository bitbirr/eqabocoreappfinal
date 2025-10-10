import { Repository, DataSource } from 'typeorm';
import { Room, RoomStatus, RoomType } from '../models/Room';
import { Hotel, HotelStatus } from '../models/Hotel';

export class RoomService {
  private roomRepository: Repository<Room>;
  private hotelRepository: Repository<Hotel>;

  constructor(dataSource: DataSource) {
    this.roomRepository = dataSource.getRepository(Room);
    this.hotelRepository = dataSource.getRepository(Hotel);
  }

  /**
   * Create a new room
   */
  async createRoom(hotelId: number, roomNumber: string, roomType: RoomType, price: number): Promise<Room> {
    // Validate inputs
    if (!roomNumber || roomNumber.trim().length === 0) {
      throw new Error('Room number is required');
    }

    if (roomNumber.length > 10) {
      throw new Error('Room number must not exceed 10 characters');
    }

    if (!roomType || !Object.values(RoomType).includes(roomType)) {
      throw new Error('Invalid room type. Must be one of: single, double, suite');
    }

    if (!price || price <= 0) {
      throw new Error('Price must be a positive number');
    }

    // Verify hotel exists and is active
    const hotel = await this.hotelRepository.findOne({
      where: { hotelId }
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    if (hotel.status !== HotelStatus.ACTIVE) {
      throw new Error('Hotel is not active');
    }

    // Check for duplicate room number in the same hotel
    const existingRoom = await this.roomRepository.findOne({
      where: {
        hotelId,
        roomNumber
      }
    });

    if (existingRoom) {
      throw new Error(`Room number "${roomNumber}" already exists in this hotel`);
    }

    // Create room (populate both v1 and legacy fields)
    const room = this.roomRepository.create({
      hotelId,
      // legacy join uses hotel.uuid id; set it to keep NOT NULL satisfied
      hotel_id: hotel.id,
      roomNumber,
      roomType,
      price,
      room_number: roomNumber, // For backward compatibility
      room_type: roomType, // For backward compatibility
      price_per_night: price, // For backward compatibility
      status: RoomStatus.AVAILABLE
    });

    return await this.roomRepository.save(room);
  }

  /**
   * Get all rooms for a hotel with pagination and optional status filter
   */
  async getRoomsByHotel(
    hotelId: number,
    page: number = 1,
    limit: number = 20,
    status?: RoomStatus
  ): Promise<{ rooms: Room[]; total: number; page: number; limit: number }> {
    // Verify hotel exists
    const hotel = await this.hotelRepository.findOne({
      where: { hotelId }
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    const skip = (page - 1) * limit;

    const where: any = { hotelId };
    if (status) {
      where.status = status;
    }

    const [rooms, total] = await this.roomRepository.findAndCount({
      where,
      order: {
        created_at: 'DESC'
      },
      take: limit,
      skip
    });

    return { rooms, total, page, limit };
  }

  /**
   * Get room by ID
   */
  async getRoomById(roomId: number): Promise<Room | null> {
    const room = await this.roomRepository.findOne({
      where: { roomId },
      relations: ['hotel']
    });

    return room;
  }

  /**
   * Update room
   */
  async updateRoom(roomId: number, updates: Partial<Room>): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: { roomId }
    });

    if (!room) {
      throw new Error('Room not found');
    }

    // Validate room number if being updated
    if (updates.roomNumber) {
      if (updates.roomNumber.length > 10) {
        throw new Error('Room number must not exceed 10 characters');
      }

      // Check for duplicate room number in the same hotel
      const existingRoom = await this.roomRepository.findOne({
        where: {
          hotelId: room.hotelId,
          roomNumber: updates.roomNumber
        }
      });

      if (existingRoom && existingRoom.roomId !== roomId) {
        throw new Error(`Room number "${updates.roomNumber}" already exists in this hotel`);
      }
    }

    // Validate room type if being updated
    if (updates.roomType && !Object.values(RoomType).includes(updates.roomType)) {
      throw new Error('Invalid room type. Must be one of: single, double, suite');
    }

    // Validate price if being updated
    if (updates.price !== undefined && updates.price <= 0) {
      throw new Error('Price must be a positive number');
    }

    // Apply updates
    Object.assign(room, updates);
    
    // Update backward compatibility fields
    if (updates.roomNumber) room.room_number = updates.roomNumber;
    if (updates.roomType) room.room_type = updates.roomType;
    if (updates.price !== undefined) room.price_per_night = updates.price;
    
    room.updated_at = new Date();

    return await this.roomRepository.save(room);
  }

  /**
   * Delete room - Hard delete if Available, prevent if Reserved
   */
  async deleteRoom(roomId: number): Promise<void> {
    const room = await this.roomRepository.findOne({
      where: { roomId }
    });

    if (!room) {
      throw new Error('Room not found');
    }

    // If room is reserved, prevent deletion
    if (room.status === RoomStatus.RESERVED) {
      throw new Error('Cannot delete a reserved room. Please wait for the reservation to complete.');
    }

    // Hard delete if available
    await this.roomRepository.remove(room);
  }

  /**
   * Get room status summary for a hotel
   */
  async getHotelRoomStatus(
    hotelId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    totalRooms: number;
    available: number;
    reserved: number;
    rooms: Array<{ roomId: number; roomNumber: string; status: RoomStatus }>;
  }> {
    // Verify hotel exists
    const hotel = await this.hotelRepository.findOne({
      where: { hotelId }
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    // Get total count and status counts
    const totalRooms = await this.roomRepository.count({
      where: { hotelId }
    });

    const available = await this.roomRepository.count({
      where: { hotelId, status: RoomStatus.AVAILABLE }
    });

    const reserved = await this.roomRepository.count({
      where: { hotelId, status: RoomStatus.RESERVED }
    });

    // Get paginated room list
    const skip = (page - 1) * limit;
    const roomList = await this.roomRepository.find({
      where: { hotelId },
      order: { roomNumber: 'ASC' },
      take: limit,
      skip
    });

    const rooms = roomList.map(room => ({
      roomId: room.roomId,
      roomNumber: room.roomNumber,
      status: room.status
    }));

    return {
      totalRooms,
      available,
      reserved,
      rooms
    };
  }
}

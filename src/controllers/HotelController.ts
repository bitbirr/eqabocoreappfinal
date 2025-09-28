import { Request, Response } from 'express';
import { DataSource, Repository, Between, Not, In } from 'typeorm';
import { Hotel, HotelStatus } from '../models/Hotel';
import { Room, RoomStatus } from '../models/Room';
import { Booking, BookingStatus } from '../models/Booking';

export class HotelController {
  private hotelRepository: Repository<Hotel>;
  private roomRepository: Repository<Room>;
  private bookingRepository: Repository<Booking>;

  constructor(dataSource: DataSource) {
    this.hotelRepository = dataSource.getRepository(Hotel);
    this.roomRepository = dataSource.getRepository(Room);
    this.bookingRepository = dataSource.getRepository(Booking);
  }

  /**
   * Search hotels by city/location
   * GET /api/hotels?city=Addis
   */
  async searchHotels(req: Request, res: Response): Promise<void> {
    try {
      const { city, limit = 20, offset = 0 } = req.query;

      if (!city) {
        res.status(400).json({
          success: false,
          message: 'City parameter is required',
          error: 'BAD_REQUEST'
        });
        return;
      }

      const hotels = await this.hotelRepository.find({
        where: {
          location: city as string,
          status: HotelStatus.ACTIVE
        },
        relations: ['rooms'],
        take: Number(limit),
        skip: Number(offset),
        order: {
          created_at: 'DESC'
        }
      });

      // Add room count and price range for each hotel
      const hotelsWithDetails = hotels.map(hotel => ({
        id: hotel.id,
        name: hotel.name,
        location: hotel.location,
        description: hotel.description,
        status: hotel.status,
        created_at: hotel.created_at,
        room_count: hotel.rooms?.length || 0,
        price_range: hotel.rooms?.length > 0 ? {
          min: Math.min(...hotel.rooms.map(room => Number(room.price_per_night))),
          max: Math.max(...hotel.rooms.map(room => Number(room.price_per_night)))
        } : null
      }));

      res.status(200).json({
        success: true,
        data: hotelsWithDetails,
        pagination: {
          limit: Number(limit),
          offset: Number(offset),
          total: hotelsWithDetails.length
        }
      });
    } catch (error) {
      console.error('Error searching hotels:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while searching hotels',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Get available rooms for a hotel with date filtering
   * GET /api/hotels/:id/rooms?checkin=2025-10-01&checkout=2025-10-03
   */
  async getHotelRooms(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { checkin, checkout } = req.query;

      if (!checkin || !checkout) {
        res.status(400).json({
          success: false,
          message: 'Check-in and check-out dates are required',
          error: 'BAD_REQUEST'
        });
        return;
      }

      const checkinDate = new Date(checkin as string);
      const checkoutDate = new Date(checkout as string);

      // Validate dates
      if (isNaN(checkinDate.getTime()) || isNaN(checkoutDate.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD',
          error: 'BAD_REQUEST'
        });
        return;
      }

      if (checkinDate >= checkoutDate) {
        res.status(400).json({
          success: false,
          message: 'Check-out date must be after check-in date',
          error: 'BAD_REQUEST'
        });
        return;
      }

      if (checkinDate < new Date()) {
        res.status(400).json({
          success: false,
          message: 'Check-in date cannot be in the past',
          error: 'BAD_REQUEST'
        });
        return;
      }

      // Check if hotel exists and is active
      const hotel = await this.hotelRepository.findOne({
        where: { id, status: HotelStatus.ACTIVE }
      });

      if (!hotel) {
        res.status(404).json({
          success: false,
          message: 'Hotel not found or inactive',
          error: 'NOT_FOUND'
        });
        return;
      }

      // Get all rooms for the hotel
      const allRooms = await this.roomRepository.find({
        where: {
          hotel_id: id,
          status: In([RoomStatus.AVAILABLE, RoomStatus.OCCUPIED])
        },
        order: {
          room_number: 'ASC'
        }
      });

      // Find rooms that are booked during the requested period
      const conflictingBookings = await this.bookingRepository.find({
        where: {
          hotel_id: id,
          status: In([BookingStatus.CONFIRMED, BookingStatus.PENDING]),
          checkin_date: Between(checkinDate, checkoutDate)
        },
        select: ['room_id']
      });

      const bookedRoomIds = conflictingBookings.map(booking => booking.room_id);

      // Filter available rooms
      const availableRooms = allRooms.filter(room => 
        !bookedRoomIds.includes(room.id) && room.status === RoomStatus.AVAILABLE
      );

      // Calculate nights and total for each room
      const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const roomsWithPricing = availableRooms.map(room => ({
        id: room.id,
        room_number: room.room_number,
        room_type: room.room_type,
        price_per_night: Number(room.price_per_night),
        description: room.description,
        status: room.status,
        nights,
        total_amount: Number(room.price_per_night) * nights
      }));

      res.status(200).json({
        success: true,
        data: {
          hotel: {
            id: hotel.id,
            name: hotel.name,
            location: hotel.location
          },
          booking_period: {
            checkin: checkin,
            checkout: checkout,
            nights
          },
          available_rooms: roomsWithPricing,
          total_available: roomsWithPricing.length
        }
      });
    } catch (error) {
      console.error('Error getting hotel rooms:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching rooms',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }
}
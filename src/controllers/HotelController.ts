import { Request, Response } from 'express';
import { DataSource, Repository, Between, Not, In } from 'typeorm';
import { Hotel, HotelStatus } from '../models/Hotel';
import { Room, RoomStatus } from '../models/Room';
import { Booking, BookingStatus } from '../models/Booking';
import { HotelService } from '../services/HotelService';
import { RoomService } from '../services/RoomService';

export class HotelController {
  private hotelRepository: Repository<Hotel>;
  private roomRepository: Repository<Room>;
  private bookingRepository: Repository<Booking>;
  private hotelService: HotelService;
  private roomService: RoomService;

  constructor(dataSource: DataSource) {
    this.hotelRepository = dataSource.getRepository(Hotel);
    this.roomRepository = dataSource.getRepository(Room);
    this.bookingRepository = dataSource.getRepository(Booking);
    this.hotelService = new HotelService(dataSource);
    this.roomService = new RoomService(dataSource);
  }

  /**
   * Create a new hotel
   * POST /api/v1/cities/:cityId/hotels
   */
  async createHotel(req: Request, res: Response): Promise<void> {
    try {
      const cityId = parseInt(req.params.cityId);
      const { hotelName, address } = req.body;

      if (isNaN(cityId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid city ID',
          error: 'BAD_REQUEST'
        });
        return;
      }

      console.log(`[${new Date().toISOString()}] Creating hotel in city ${cityId}: ${hotelName}`);

      const hotel = await this.hotelService.createHotel(cityId, hotelName, address);

      console.log(`[${new Date().toISOString()}] Hotel created successfully: ID ${hotel.hotelId}`);

      res.status(201).json({
        success: true,
        data: hotel,
        message: 'Hotel created successfully'
      });
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Error creating hotel:`, error);

      if (error.message === 'City not found' || error.message === 'City is not active') {
        res.status(404).json({
          success: false,
          message: error.message,
          error: 'NOT_FOUND'
        });
        return;
      }

      if (error.message.includes('required') || error.message.includes('must not exceed')) {
        res.status(400).json({
          success: false,
          message: error.message,
          error: 'BAD_REQUEST'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create hotel',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Get all hotels for a city
   * GET /api/v1/cities/:cityId/hotels
   */
  async getHotelsByCity(req: Request, res: Response): Promise<void> {
    try {
      const cityId = parseInt(req.params.cityId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (isNaN(cityId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid city ID',
          error: 'BAD_REQUEST'
        });
        return;
      }

      console.log(`[${new Date().toISOString()}] Fetching hotels for city ${cityId}: page=${page}, limit=${limit}`);

      const result = await this.hotelService.getHotelsByCity(cityId, page, limit);

      res.status(200).json({
        success: true,
        data: result.hotels,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Error fetching hotels:`, error);

      if (error.message === 'City not found') {
        res.status(404).json({
          success: false,
          message: error.message,
          error: 'NOT_FOUND'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to fetch hotels',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Get hotel by ID
   * GET /api/v1/hotels/:hotelId
   */
  async getHotelById(req: Request, res: Response): Promise<void> {
    try {
      const hotelId = parseInt(req.params.hotelId);

      if (isNaN(hotelId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid hotel ID',
          error: 'BAD_REQUEST'
        });
        return;
      }

      console.log(`[${new Date().toISOString()}] Fetching hotel: ID ${hotelId}`);

      const hotel = await this.hotelService.getHotelById(hotelId);

      if (!hotel) {
        res.status(404).json({
          success: false,
          message: 'Hotel not found',
          error: 'NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: hotel
      });
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Error fetching hotel:`, error);

      res.status(500).json({
        success: false,
        message: 'Failed to fetch hotel',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Update hotel
   * PUT /api/v1/hotels/:hotelId
   */
  async updateHotel(req: Request, res: Response): Promise<void> {
    try {
      const hotelId = parseInt(req.params.hotelId);
      const updates = req.body;

      if (isNaN(hotelId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid hotel ID',
          error: 'BAD_REQUEST'
        });
        return;
      }

      console.log(`[${new Date().toISOString()}] Updating hotel: ID ${hotelId}`, updates);

      const hotel = await this.hotelService.updateHotel(hotelId, updates);

      console.log(`[${new Date().toISOString()}] Hotel updated successfully: ID ${hotelId}`);

      res.status(200).json({
        success: true,
        data: hotel,
        message: 'Hotel updated successfully'
      });
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Error updating hotel:`, error);

      if (error.message === 'Hotel not found') {
        res.status(404).json({
          success: false,
          message: error.message,
          error: 'NOT_FOUND'
        });
        return;
      }

      if (error.message.includes('must not exceed')) {
        res.status(400).json({
          success: false,
          message: error.message,
          error: 'BAD_REQUEST'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update hotel',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Delete hotel (soft delete)
   * DELETE /api/v1/hotels/:hotelId
   */
  async deleteHotel(req: Request, res: Response): Promise<void> {
    try {
      const hotelId = parseInt(req.params.hotelId);

      if (isNaN(hotelId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid hotel ID',
          error: 'BAD_REQUEST'
        });
        return;
      }

      console.log(`[${new Date().toISOString()}] Deleting hotel: ID ${hotelId}`);

      await this.hotelService.deleteHotel(hotelId);

      console.log(`[${new Date().toISOString()}] Hotel deleted successfully: ID ${hotelId}`);

      res.status(204).send();
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Error deleting hotel:`, error);

      if (error.message === 'Hotel not found') {
        res.status(404).json({
          success: false,
          message: error.message,
          error: 'NOT_FOUND'
        });
        return;
      }

      if (error.message.includes('Cannot delete hotel')) {
        res.status(409).json({
          success: false,
          message: error.message,
          error: 'CONFLICT'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete hotel',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Get hotel room status summary
   * GET /api/v1/hotels/:hotelId/room-status
   */
  async getHotelRoomStatus(req: Request, res: Response): Promise<void> {
    try {
      const hotelId = parseInt(req.params.hotelId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (isNaN(hotelId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid hotel ID',
          error: 'BAD_REQUEST'
        });
        return;
      }

      console.log(`[${new Date().toISOString()}] Fetching room status for hotel ${hotelId}`);

      const result = await this.roomService.getHotelRoomStatus(hotelId, page, limit);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Error fetching room status:`, error);

      if (error.message === 'Hotel not found') {
        res.status(404).json({
          success: false,
          message: error.message,
          error: 'NOT_FOUND'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to fetch room status',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Get featured hotels
   * GET /api/hotels/featured
   */
  async getFeaturedHotels(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query;

      // Get active hotels ordered by creation date (most recent first)
      // In a real implementation, you might have a 'featured' or 'is_featured' column
      const hotels = await this.hotelRepository.find({
        where: {
          status: HotelStatus.ACTIVE
        },
        relations: ['rooms'],
        take: Number(limit),
        order: {
          created_at: 'DESC'
        }
      });

      // Add room count and price range for each hotel
      const featuredHotels = hotels.map(hotel => ({
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
        data: {
          hotels: featuredHotels,
          total: featuredHotels.length
        }
      });
    } catch (error) {
      console.error('Error fetching featured hotels:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch featured hotels',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
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
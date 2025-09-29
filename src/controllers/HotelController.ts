import { Request, Response } from 'express';
import { DataSource, Repository, Between, Not, In } from 'typeorm';
import { Hotel, HotelStatus } from '../models/Hotel';
import { Room, RoomStatus } from '../models/Room';
import { Booking, BookingStatus } from '../models/Booking';
import { User, UserRole } from '../models/User';

interface CreateHotelRequest {
  name: string;
  location: string;
  description?: string;
  owner_id?: string;
}

interface UpdateHotelRequest {
  name?: string;
  location?: string;
  description?: string;
  status?: HotelStatus;
}

interface CreateRoomRequest {
  room_number: string;
  room_type: string;
  price_per_night: number;
  description?: string;
}

interface UpdateRoomRequest {
  room_number?: string;
  room_type?: string;
  price_per_night?: number;
  description?: string;
  status?: RoomStatus;
}

export class HotelController {
   private hotelRepository: Repository<Hotel>;
   private roomRepository: Repository<Room>;
   private bookingRepository: Repository<Booking>;
   private userRepository: Repository<User>;

   constructor(dataSource: DataSource) {
     this.hotelRepository = dataSource.getRepository(Hotel);
     this.roomRepository = dataSource.getRepository(Room);
     this.bookingRepository = dataSource.getRepository(Booking);
     this.userRepository = dataSource.getRepository(User);
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
          status: In([BookingStatus.CONFIRMED, BookingStatus.PENDING_PAYMENT]),
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

   /**
    * Create a new hotel
    * POST /api/hotels
    */
   async createHotel(req: Request, res: Response): Promise<void> {
     try {
       const { name, location, description, owner_id }: CreateHotelRequest = req.body;

       // Validate required fields
       if (!name || !location) {
         res.status(400).json({
           success: false,
           message: 'Name and location are required',
           error: 'BAD_REQUEST'
         });
         return;
       }

       // Trim inputs
       const trimmedName = name.trim();
       const trimmedLocation = location.trim();
       const trimmedDescription = description?.trim();

       if (!trimmedName || !trimmedLocation) {
         res.status(400).json({
           success: false,
           message: 'Name and location cannot be empty after trimming',
           error: 'BAD_REQUEST'
         });
         return;
       }

       // Check if owner exists if provided
       if (owner_id) {
         const owner = await this.userRepository.findOne({
           where: { id: owner_id, role: UserRole.HOTEL_OWNER }
         });
         if (!owner) {
           res.status(400).json({
             success: false,
             message: 'Invalid owner ID or user is not a hotel owner',
             error: 'BAD_REQUEST'
           });
           return;
         }
       }

       // Check for duplicate hotel name in same location
       const existingHotel = await this.hotelRepository.findOne({
         where: { name: trimmedName, location: trimmedLocation }
       });

       if (existingHotel) {
         res.status(409).json({
           success: false,
           message: 'Hotel with this name already exists in the specified location',
           error: 'DUPLICATE_HOTEL'
         });
         return;
       }

       // Create hotel
       const hotel = this.hotelRepository.create({
         name: trimmedName,
         location: trimmedLocation,
         description: trimmedDescription,
         owner_id,
         status: HotelStatus.ACTIVE
       });

       const savedHotel = await this.hotelRepository.save(hotel);

       res.status(201).json({
         success: true,
         message: 'Hotel created successfully',
         data: {
           id: savedHotel.id,
           name: savedHotel.name,
           location: savedHotel.location,
           description: savedHotel.description,
           status: savedHotel.status,
           owner_id: savedHotel.owner_id,
           created_at: savedHotel.created_at
         }
       });

     } catch (error) {
       console.error('Error creating hotel:', error);
       res.status(500).json({
         success: false,
         message: 'Internal server error while creating hotel',
         error: 'INTERNAL_SERVER_ERROR'
       });
     }
   }

   /**
    * Update hotel details
    * PUT /api/hotels/:id
    */
   async updateHotel(req: Request, res: Response): Promise<void> {
     try {
       const { id } = req.params;
       const updates: UpdateHotelRequest = req.body;

       // Find hotel
       const hotel = await this.hotelRepository.findOne({
         where: { id }
       });

       if (!hotel) {
         res.status(404).json({
           success: false,
           message: 'Hotel not found',
           error: 'NOT_FOUND'
         });
         return;
       }

       // Validate and trim updates
       if (updates.name !== undefined) {
         const trimmedName = updates.name.trim();
         if (!trimmedName) {
           res.status(400).json({
             success: false,
             message: 'Hotel name cannot be empty',
             error: 'BAD_REQUEST'
           });
           return;
         }
         updates.name = trimmedName;
       }

       if (updates.location !== undefined) {
         const trimmedLocation = updates.location.trim();
         if (!trimmedLocation) {
           res.status(400).json({
             success: false,
             message: 'Hotel location cannot be empty',
             error: 'BAD_REQUEST'
           });
           return;
         }
         updates.location = trimmedLocation;
       }

       if (updates.description !== undefined) {
         updates.description = updates.description?.trim();
       }

       // Check for duplicate if name or location is being updated
       if (updates.name || updates.location) {
         const checkName = updates.name || hotel.name;
         const checkLocation = updates.location || hotel.location;

         const existingHotel = await this.hotelRepository.findOne({
           where: { name: checkName, location: checkLocation }
         });

         if (existingHotel && existingHotel.id !== id) {
           res.status(409).json({
             success: false,
             message: 'Hotel with this name already exists in the specified location',
             error: 'DUPLICATE_HOTEL'
           });
           return;
         }
       }

       // Update hotel
       await this.hotelRepository.update(id, updates);

       // Fetch updated hotel
       const updatedHotel = await this.hotelRepository.findOne({
         where: { id }
       });

       res.status(200).json({
         success: true,
         message: 'Hotel updated successfully',
         data: {
           id: updatedHotel!.id,
           name: updatedHotel!.name,
           location: updatedHotel!.location,
           description: updatedHotel!.description,
           status: updatedHotel!.status,
           owner_id: updatedHotel!.owner_id,
           created_at: updatedHotel!.created_at
         }
       });

     } catch (error) {
       console.error('Error updating hotel:', error);
       res.status(500).json({
         success: false,
         message: 'Internal server error while updating hotel',
         error: 'INTERNAL_SERVER_ERROR'
       });
     }
   }

   /**
    * Delete hotel (soft delete by setting status to inactive)
    * DELETE /api/hotels/:id
    */
   async deleteHotel(req: Request, res: Response): Promise<void> {
     try {
       const { id } = req.params;

       // Find hotel
       const hotel = await this.hotelRepository.findOne({
         where: { id },
         relations: ['rooms', 'bookings']
       });

       if (!hotel) {
         res.status(404).json({
           success: false,
           message: 'Hotel not found',
           error: 'NOT_FOUND'
         });
         return;
       }

       // Check if hotel has active bookings
       const activeBookings = hotel.bookings?.filter(booking =>
         [BookingStatus.CONFIRMED, BookingStatus.PENDING_PAYMENT].includes(booking.status)
       ) || [];

       if (activeBookings.length > 0) {
         res.status(422).json({
           success: false,
           message: 'Cannot delete hotel with active bookings. Cancel all bookings first.',
           error: 'HOTEL_HAS_ACTIVE_BOOKINGS'
         });
         return;
       }

       // Soft delete by setting status to inactive
       await this.hotelRepository.update(id, { status: HotelStatus.INACTIVE });

       res.status(200).json({
         success: true,
         message: 'Hotel deleted successfully',
         data: {
           id: hotel.id,
           name: hotel.name,
           status: HotelStatus.INACTIVE
         }
       });

     } catch (error) {
       console.error('Error deleting hotel:', error);
       res.status(500).json({
         success: false,
         message: 'Internal server error while deleting hotel',
         error: 'INTERNAL_SERVER_ERROR'
       });
     }
   }

   /**
    * Create a new room for a hotel
    * POST /api/hotels/:hotelId/rooms
    */
   async createRoom(req: Request, res: Response): Promise<void> {
     try {
       const { hotelId } = req.params;
       const { room_number, room_type, price_per_night, description }: CreateRoomRequest = req.body;

       // Validate required fields
       if (!room_number || !room_type || price_per_night === undefined) {
         res.status(400).json({
           success: false,
           message: 'Room number, room type, and price per night are required',
           error: 'BAD_REQUEST'
         });
         return;
       }

       // Validate price
       if (price_per_night <= 0) {
         res.status(400).json({
           success: false,
           message: 'Price per night must be greater than 0',
           error: 'BAD_REQUEST'
         });
         return;
       }

       // Check if hotel exists and is active
       const hotel = await this.hotelRepository.findOne({
         where: { id: hotelId, status: HotelStatus.ACTIVE }
       });

       if (!hotel) {
         res.status(404).json({
           success: false,
           message: 'Hotel not found or inactive',
           error: 'NOT_FOUND'
         });
         return;
       }

       // Trim inputs
       const trimmedRoomNumber = room_number.trim();
       const trimmedRoomType = room_type.trim();
       const trimmedDescription = description?.trim();

       if (!trimmedRoomNumber || !trimmedRoomType) {
         res.status(400).json({
           success: false,
           message: 'Room number and room type cannot be empty after trimming',
           error: 'BAD_REQUEST'
         });
         return;
       }

       // Check for duplicate room number in this hotel
       const existingRoom = await this.roomRepository.findOne({
         where: { hotel_id: hotelId, room_number: trimmedRoomNumber }
       });

       if (existingRoom) {
         res.status(409).json({
           success: false,
           message: 'Room number already exists in this hotel',
           error: 'DUPLICATE_ROOM'
         });
         return;
       }

       // Create room
       const room = this.roomRepository.create({
         hotel_id: hotelId,
         room_number: trimmedRoomNumber,
         room_type: trimmedRoomType,
         price_per_night,
         description: trimmedDescription,
         status: RoomStatus.AVAILABLE
       });

       const savedRoom = await this.roomRepository.save(room);

       res.status(201).json({
         success: true,
         message: 'Room created successfully',
         data: {
           id: savedRoom.id,
           hotel_id: savedRoom.hotel_id,
           room_number: savedRoom.room_number,
           room_type: savedRoom.room_type,
           price_per_night: Number(savedRoom.price_per_night),
           description: savedRoom.description,
           status: savedRoom.status,
           created_at: savedRoom.created_at
         }
       });

     } catch (error) {
       console.error('Error creating room:', error);
       res.status(500).json({
         success: false,
         message: 'Internal server error while creating room',
         error: 'INTERNAL_SERVER_ERROR'
       });
     }
   }

   /**
    * Update room details
    * PUT /api/rooms/:id
    */
   async updateRoom(req: Request, res: Response): Promise<void> {
     try {
       const { id } = req.params;
       const updates: UpdateRoomRequest = req.body;

       // Find room
       const room = await this.roomRepository.findOne({
         where: { id },
         relations: ['hotel']
       });

       if (!room) {
         res.status(404).json({
           success: false,
           message: 'Room not found',
           error: 'NOT_FOUND'
         });
         return;
       }

       // Validate and trim updates
       if (updates.room_number !== undefined) {
         const trimmedRoomNumber = updates.room_number.trim();
         if (!trimmedRoomNumber) {
           res.status(400).json({
             success: false,
             message: 'Room number cannot be empty',
             error: 'BAD_REQUEST'
           });
           return;
         }
         updates.room_number = trimmedRoomNumber;
       }

       if (updates.room_type !== undefined) {
         const trimmedRoomType = updates.room_type.trim();
         if (!trimmedRoomType) {
           res.status(400).json({
             success: false,
             message: 'Room type cannot be empty',
             error: 'BAD_REQUEST'
           });
           return;
         }
         updates.room_type = trimmedRoomType;
       }

       if (updates.price_per_night !== undefined && updates.price_per_night <= 0) {
         res.status(400).json({
           success: false,
           message: 'Price per night must be greater than 0',
           error: 'BAD_REQUEST'
         });
         return;
       }

       if (updates.description !== undefined) {
         updates.description = updates.description?.trim();
       }

       // Check for duplicate room number if being updated
       if (updates.room_number) {
         const existingRoom = await this.roomRepository.findOne({
           where: { hotel_id: room.hotel_id, room_number: updates.room_number }
         });

         if (existingRoom && existingRoom.id !== id) {
           res.status(409).json({
             success: false,
             message: 'Room number already exists in this hotel',
             error: 'DUPLICATE_ROOM'
           });
           return;
         }
       }

       // Update room
       await this.roomRepository.update(id, updates);

       // Fetch updated room
       const updatedRoom = await this.roomRepository.findOne({
         where: { id }
       });

       res.status(200).json({
         success: true,
         message: 'Room updated successfully',
         data: {
           id: updatedRoom!.id,
           hotel_id: updatedRoom!.hotel_id,
           room_number: updatedRoom!.room_number,
           room_type: updatedRoom!.room_type,
           price_per_night: Number(updatedRoom!.price_per_night),
           description: updatedRoom!.description,
           status: updatedRoom!.status,
           created_at: updatedRoom!.created_at
         }
       });

     } catch (error) {
       console.error('Error updating room:', error);
       res.status(500).json({
         success: false,
         message: 'Internal server error while updating room',
         error: 'INTERNAL_SERVER_ERROR'
       });
     }
   }

   /**
    * Delete room
    * DELETE /api/rooms/:id
    */
   async deleteRoom(req: Request, res: Response): Promise<void> {
     try {
       const { id } = req.params;

       // Find room with bookings
       const room = await this.roomRepository.findOne({
         where: { id },
         relations: ['bookings']
       });

       if (!room) {
         res.status(404).json({
           success: false,
           message: 'Room not found',
           error: 'NOT_FOUND'
         });
         return;
       }

       // Check if room has active bookings
       const activeBookings = room.bookings?.filter(booking =>
         [BookingStatus.CONFIRMED, BookingStatus.PENDING_PAYMENT].includes(booking.status)
       ) || [];

       if (activeBookings.length > 0) {
         res.status(422).json({
           success: false,
           message: 'Cannot delete room with active bookings. Cancel all bookings first.',
           error: 'ROOM_HAS_ACTIVE_BOOKINGS'
         });
         return;
       }

       // Delete room
       await this.roomRepository.delete(id);

       res.status(200).json({
         success: true,
         message: 'Room deleted successfully',
         data: {
           id: room.id,
           room_number: room.room_number
         }
       });

     } catch (error) {
       console.error('Error deleting room:', error);
       res.status(500).json({
         success: false,
         message: 'Internal server error while deleting room',
         error: 'INTERNAL_SERVER_ERROR'
       });
     }
   }
}
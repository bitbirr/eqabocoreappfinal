import { Request, Response } from 'express';
import { DataSource, Repository, Between, In } from 'typeorm';
import { Hotel, HotelStatus } from '../models/Hotel';
import { Room, RoomStatus } from '../models/Room';
import { Booking, BookingStatus } from '../models/Booking';
import { User, UserRole } from '../models/User';
import { Payment, PaymentStatus, PaymentProvider } from '../models/Payment';
import { PaymentLog } from '../models/PaymentLog';
import { FirebaseService } from '../services/FirebaseService';

interface CreateBookingRequest {
  userName: string;
  phone: string;
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
}

export class BookingController {
  private hotelRepository: Repository<Hotel>;
  private roomRepository: Repository<Room>;
  private bookingRepository: Repository<Booking>;
  private userRepository: Repository<User>;
  private paymentRepository: Repository<Payment>;
  private paymentLogRepository: Repository<PaymentLog>;
  private firebaseService: FirebaseService;

  constructor(dataSource: DataSource) {
    this.hotelRepository = dataSource.getRepository(Hotel);
    this.roomRepository = dataSource.getRepository(Room);
    this.bookingRepository = dataSource.getRepository(Booking);
    this.userRepository = dataSource.getRepository(User);
    this.paymentRepository = dataSource.getRepository(Payment);
    this.paymentLogRepository = dataSource.getRepository(PaymentLog);
    this.firebaseService = new FirebaseService();
  }

  /**
   * Create a new booking with room locking
   * POST /api/bookings
   */
  async createBooking(req: Request, res: Response): Promise<void> {
    const queryRunner = this.bookingRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { userName, phone, hotelId, roomId, checkIn, checkOut }: CreateBookingRequest = req.body;

      // Validate required fields
      if (!userName || !phone || !hotelId || !roomId || !checkIn || !checkOut) {
        res.status(400).json({
          success: false,
          message: 'All fields are required: userName, phone, hotelId, roomId, checkIn, checkOut',
          error: 'BAD_REQUEST'
        });
        return;
      }

      const checkinDate = new Date(checkIn);
      const checkoutDate = new Date(checkOut);

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
      const hotel = await queryRunner.manager.findOne(Hotel, {
        where: { id: hotelId, status: HotelStatus.ACTIVE }
      });

      if (!hotel) {
        await queryRunner.rollbackTransaction();
        res.status(404).json({
          success: false,
          message: 'Hotel not found or inactive',
          error: 'NOT_FOUND'
        });
        return;
      }

      // Check if room exists and belongs to the hotel
      const room = await queryRunner.manager.findOne(Room, {
        where: { 
          id: roomId, 
          hotel_id: hotelId,
          status: RoomStatus.AVAILABLE
        }
      });

      if (!room) {
        await queryRunner.rollbackTransaction();
        res.status(404).json({
          success: false,
          message: 'Room not found, not available, or does not belong to this hotel',
          error: 'NOT_FOUND'
        });
        return;
      }

      // Check for conflicting bookings (room already reserved for these dates)
      const conflictingBooking = await queryRunner.manager.findOne(Booking, {
        where: {
          room_id: roomId,
          status: In([BookingStatus.CONFIRMED, BookingStatus.PENDING]),
          checkin_date: Between(checkinDate, checkoutDate)
        }
      });

      if (conflictingBooking) {
        await queryRunner.rollbackTransaction();
        res.status(422).json({
          success: false,
          message: 'Room is already reserved for the selected dates',
          error: 'ROOM_ALREADY_RESERVED'
        });
        return;
      }

      // Find or create user
      let user = await queryRunner.manager.findOne(User, {
        where: { phone }
      });

      if (!user) {
        // Create a customer user
        const [firstName, ...lastNameParts] = userName.split(' ');
        const lastName = lastNameParts.join(' ') || firstName;
        
        user = queryRunner.manager.create(User, {
          first_name: firstName,
          last_name: lastName,
          email: `${phone}@guest.eqabo.com`, // Generate a temporary email
          phone,
          role: UserRole.CUSTOMER,
          password_hash: 'guest_user_no_password' // Guest users don't need real passwords
        });
        user = await queryRunner.manager.save(User, user);
      }

      // Calculate booking details
      const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalAmount = Number(room.price_per_night) * nights;

      // Check for duplicate booking (same user, hotel, room, dates)
      const duplicateBooking = await queryRunner.manager.findOne(Booking, {
        where: {
          user_id: user.id,
          hotel_id: hotelId,
          room_id: roomId,
          checkin_date: checkinDate,
          checkout_date: checkoutDate,
          status: In([BookingStatus.PENDING, BookingStatus.CONFIRMED])
        }
      });

      if (duplicateBooking) {
        await queryRunner.rollbackTransaction();
        res.status(409).json({
          success: false,
          message: 'Duplicate booking detected',
          error: 'DUPLICATE_BOOKING'
        });
        return;
      }

      // Create booking with PENDING status
      const booking = queryRunner.manager.create(Booking, {
        user_id: user.id,
        hotel_id: hotelId,
        room_id: roomId,
        checkin_date: checkinDate,
        checkout_date: checkoutDate,
        nights,
        total_amount: totalAmount,
        status: BookingStatus.PENDING
      });

      const savedBooking = await queryRunner.manager.save(Booking, booking);

      // Create pending payment record
      const payment = queryRunner.manager.create(Payment, {
        booking_id: savedBooking.id,
        amount: totalAmount,
        provider: PaymentProvider.TELEBIRR, // Default provider, will be updated when payment is initiated
        status: PaymentStatus.PENDING
      });

      const savedPayment = await queryRunner.manager.save(Payment, payment);

      // Log the booking creation
      const paymentLog = queryRunner.manager.create(PaymentLog, {
        payment_id: savedPayment.id,
        booking_id: savedBooking.id,
        action: 'BOOKING_CREATED',
        details: `Booking created for ${userName} (${phone})`
      });

      await queryRunner.manager.save(PaymentLog, paymentLog);

      // Lock the room by updating its status to OCCUPIED temporarily
      await queryRunner.manager.update(Room, roomId, {
        status: RoomStatus.OCCUPIED
      });

      await queryRunner.commitTransaction();

      // Sync booking to Firestore (non-blocking)
      this.syncBookingToFirestore(savedBooking, user, hotel, room).catch(err => {
        console.error('Error syncing booking to Firestore:', err);
      });

      // Send FCM notification to user (non-blocking)
      if (user.fcm_token) {
        this.sendBookingNotification(
          user.fcm_token,
          savedBooking.id,
          'pending',
          `Booking created for ${hotel.name}`,
          `Your booking for ${nights} night(s) has been created. Total: ${totalAmount} ETB`
        ).catch(err => {
          console.error('Error sending FCM notification:', err);
        });
      }

      res.status(201).json({
        success: true,
        message: 'Booking created successfully. Room is temporarily locked pending payment.',
        data: {
          booking: {
            id: savedBooking.id,
            user: {
              name: userName,
              phone
            },
            hotel: {
              id: hotel.id,
              name: hotel.name,
              location: hotel.location
            },
            room: {
              id: room.id,
              room_number: room.room_number,
              room_type: room.room_type,
              price_per_night: Number(room.price_per_night)
            },
            checkin_date: checkIn,
            checkout_date: checkOut,
            nights,
            total_amount: totalAmount,
            status: savedBooking.status,
            created_at: savedBooking.created_at
          },
          payment: {
            id: savedPayment.id,
            amount: totalAmount,
            status: savedPayment.status
          },
          next_step: {
            action: 'initiate_payment',
            endpoint: '/api/payments/initiate',
            required_data: {
              bookingId: savedBooking.id,
              provider: 'telebirr|chappa|ebirr|kaafi'
            }
          }
        }
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error creating booking:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating booking',
        error: 'INTERNAL_SERVER_ERROR'
      });
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get booking details
   * GET /api/bookings/:id
   */
  async getBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const booking = await this.bookingRepository.findOne({
        where: { id },
        relations: ['user', 'hotel', 'room', 'payments']
      });

      if (!booking) {
        res.status(404).json({
          success: false,
          message: 'Booking not found',
          error: 'NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: booking.id,
          user: {
            name: `${booking.user.first_name} ${booking.user.last_name}`,
            phone: booking.user.phone
          },
          hotel: {
            id: booking.hotel.id,
            name: booking.hotel.name,
            location: booking.hotel.location
          },
          room: {
            id: booking.room.id,
            room_number: booking.room.room_number,
            room_type: booking.room.room_type
          },
          checkin_date: booking.checkin_date,
          checkout_date: booking.checkout_date,
          nights: booking.nights,
          total_amount: Number(booking.total_amount),
          status: booking.status,
          created_at: booking.created_at,
          payments: booking.payments.map(payment => ({
            id: payment.id,
            amount: Number(payment.amount),
            provider: payment.provider,
            status: payment.status,
            created_at: payment.created_at
          }))
        }
      });

    } catch (error) {
      console.error('Error getting booking:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching booking',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Sync booking to Firestore
   */
  private async syncBookingToFirestore(
    booking: Booking,
    user: User,
    hotel: Hotel,
    room: Room
  ): Promise<void> {
    const bookingData = {
      id: booking.id,
      user_id: booking.user_id,
      hotel_id: booking.hotel_id,
      room_id: booking.room_id,
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        phone: user.phone
      },
      hotel: {
        id: hotel.id,
        name: hotel.name,
        location: hotel.location
      },
      room: {
        id: room.id,
        room_number: room.room_number,
        room_type: room.room_type,
        price_per_night: Number(room.price_per_night)
      },
      checkin_date: booking.checkin_date.toISOString(),
      checkout_date: booking.checkout_date.toISOString(),
      nights: booking.nights,
      total_amount: Number(booking.total_amount),
      status: booking.status,
      created_at: booking.created_at.toISOString()
    };

    await this.firebaseService.syncBookingToFirestore(booking.id, bookingData);
  }

  /**
   * Update booking status in Firestore
   */
  private async updateBookingStatusInFirestore(
    bookingId: string,
    status: BookingStatus
  ): Promise<void> {
    await this.firebaseService.updateBookingInFirestore(bookingId, { status });
  }

  /**
   * Send FCM notification for booking update
   */
  private async sendBookingNotification(
    fcmToken: string,
    bookingId: string,
    status: string,
    title: string,
    body: string
  ): Promise<void> {
    await this.firebaseService.sendNotification(
      fcmToken,
      {
        type: 'booking_update',
        booking_id: bookingId,
        status,
        priority: 'high'
      },
      title,
      body
    );
  }
}
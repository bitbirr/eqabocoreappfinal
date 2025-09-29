import { Request, Response } from 'express';
import { DataSource, Repository, Between, In } from 'typeorm';
import { Hotel, HotelStatus } from '../models/Hotel';
import { Room, RoomStatus } from '../models/Room';
import { Booking, BookingStatus } from '../models/Booking';
import { User, UserRole } from '../models/User';
import { Payment, PaymentStatus, PaymentProvider } from '../models/Payment';
import { PaymentLog } from '../models/PaymentLog';

interface CreateBookingRequest {
  userName: string;
  phone: string;
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
}

interface UpdateBookingRequest {
  checkIn?: string;
  checkOut?: string;
  status?: BookingStatus;
}

export class BookingController {
  private hotelRepository: Repository<Hotel>;
  private roomRepository: Repository<Room>;
  private bookingRepository: Repository<Booking>;
  private userRepository: Repository<User>;
  private paymentRepository: Repository<Payment>;
  private paymentLogRepository: Repository<PaymentLog>;

  constructor(dataSource: DataSource) {
    this.hotelRepository = dataSource.getRepository(Hotel);
    this.roomRepository = dataSource.getRepository(Room);
    this.bookingRepository = dataSource.getRepository(Booking);
    this.userRepository = dataSource.getRepository(User);
    this.paymentRepository = dataSource.getRepository(Payment);
    this.paymentLogRepository = dataSource.getRepository(PaymentLog);
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

      // Trim inputs to handle whitespace
      const trimmedUserName = userName?.trim();
      const trimmedPhone = phone?.trim();
      const trimmedHotelId = hotelId?.trim();
      const trimmedRoomId = roomId?.trim();
      const trimmedCheckIn = checkIn?.trim();
      const trimmedCheckOut = checkOut?.trim();

      // Validate required fields and check for empty strings after trimming
      if (!trimmedUserName || !trimmedPhone || !trimmedHotelId || !trimmedRoomId || !trimmedCheckIn || !trimmedCheckOut) {
        res.status(400).json({
          success: false,
          message: 'All fields are required and cannot be empty: userName, phone, hotelId, roomId, checkIn, checkOut',
          error: 'BAD_REQUEST'
        });
        return;
      }

      // Validate phone number format (basic regex for international phone numbers)
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(trimmedPhone)) {
        res.status(400).json({
          success: false,
          message: 'Invalid phone number format. Please provide a valid phone number.',
          error: 'BAD_REQUEST'
        });
        return;
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(trimmedCheckIn) || !dateRegex.test(trimmedCheckOut)) {
        res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD.',
          error: 'BAD_REQUEST'
        });
        return;
      }

      const checkinDate = new Date(trimmedCheckIn);
      const checkoutDate = new Date(trimmedCheckOut);

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

      // Ensure check-out is at least one day after check-in
      const oneDayAfterCheckin = new Date(checkinDate);
      oneDayAfterCheckin.setDate(checkinDate.getDate() + 1);
      if (checkoutDate < oneDayAfterCheckin) {
        res.status(400).json({
          success: false,
          message: 'Check-out date must be at least one day after check-in date',
          error: 'BAD_REQUEST'
        });
        return;
      }

      // Limit maximum booking duration to 30 days
      const maxBookingDays = 30;
      const bookingDuration = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
      if (bookingDuration > maxBookingDays) {
        res.status(400).json({
          success: false,
          message: `Booking duration cannot exceed ${maxBookingDays} days`,
          error: 'BAD_REQUEST'
        });
        return;
      }

      // Check if check-in date is in the past (allow same day if before noon, but for simplicity, no past dates)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (checkinDate < today) {
        res.status(400).json({
          success: false,
          message: 'Check-in date cannot be in the past',
          error: 'BAD_REQUEST'
        });
        return;
      }

      // Limit check-in to maximum 1 year in advance
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      if (checkinDate > oneYearFromNow) {
        res.status(400).json({
          success: false,
          message: 'Check-in date cannot be more than 1 year in advance',
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
      // Overlap condition: existing.checkin < new.checkout AND existing.checkout > new.checkin
      const conflictingBooking = await queryRunner.manager
        .createQueryBuilder(Booking, 'booking')
        .where('booking.room_id = :roomId', { roomId })
        .andWhere('booking.status IN (:...statuses)', { statuses: [BookingStatus.CONFIRMED, BookingStatus.PENDING_PAYMENT] })
        .andWhere('booking.checkin_date < :checkoutDate', { checkoutDate })
        .andWhere('booking.checkout_date > :checkinDate', { checkinDate })
        .getOne();

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
          status: In([BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED])
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
        status: BookingStatus.PENDING_PAYMENT
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
      const err = error as Error;
      console.error('Error creating booking:', {
        error: err.message,
        stack: err.stack,
        input: req.body
      });
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
   * Update booking details
   * PUT /api/bookings/:id
   */
  async updateBooking(req: Request, res: Response): Promise<void> {
    const queryRunner = this.bookingRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { id } = req.params;
      const updates: UpdateBookingRequest = req.body;

      // Find booking with relations
      const booking = await queryRunner.manager.findOne(Booking, {
        where: { id },
        relations: ['room', 'hotel']
      });

      if (!booking) {
        await queryRunner.rollbackTransaction();
        res.status(404).json({
          success: false,
          message: 'Booking not found',
          error: 'NOT_FOUND'
        });
        return;
      }

      // Validate status transitions
      if (updates.status) {
        const allowedStatuses = [BookingStatus.CANCELLED]; // Only allow cancellation for now
        if (!allowedStatuses.includes(updates.status)) {
          await queryRunner.rollbackTransaction();
          res.status(400).json({
            success: false,
            message: `Invalid status transition. Only cancellation is allowed.`,
            error: 'INVALID_STATUS_TRANSITION'
          });
          return;
        }

        // If cancelling, check if payment exists and is not completed
        if (updates.status === BookingStatus.CANCELLED) {
          const payment = await queryRunner.manager.findOne(Payment, {
            where: { booking_id: id }
          });

          if (payment && payment.status === PaymentStatus.SUCCESS) {
            await queryRunner.rollbackTransaction();
            res.status(422).json({
              success: false,
              message: 'Cannot cancel booking with successful payment. Contact support for refund.',
              error: 'CANNOT_CANCEL_PAID_BOOKING'
            });
            return;
          }
        }
      }

      // Validate date updates if provided
      if (updates.checkIn || updates.checkOut) {
        const newCheckIn = updates.checkIn ? new Date(updates.checkIn) : booking.checkin_date;
        const newCheckOut = updates.checkOut ? new Date(updates.checkOut) : booking.checkout_date;

        // Validate dates
        if (isNaN(newCheckIn.getTime()) || isNaN(newCheckOut.getTime())) {
          await queryRunner.rollbackTransaction();
          res.status(400).json({
            success: false,
            message: 'Invalid date format. Use YYYY-MM-DD',
            error: 'BAD_REQUEST'
          });
          return;
        }

        if (newCheckIn >= newCheckOut) {
          await queryRunner.rollbackTransaction();
          res.status(400).json({
            success: false,
            message: 'Check-out date must be after check-in date',
            error: 'BAD_REQUEST'
          });
          return;
        }

        // Check for conflicts if dates changed
        if (updates.checkIn || updates.checkOut) {
          const conflictingBooking = await queryRunner.manager
            .createQueryBuilder(Booking, 'booking')
            .where('booking.room_id = :roomId', { roomId: booking.room_id })
            .andWhere('booking.id != :bookingId', { bookingId: id })
            .andWhere('booking.status IN (:...statuses)', { statuses: [BookingStatus.CONFIRMED, BookingStatus.PENDING_PAYMENT] })
            .andWhere('booking.checkin_date < :checkoutDate', { checkoutDate: newCheckOut })
            .andWhere('booking.checkout_date > :checkinDate', { checkinDate: newCheckIn })
            .getOne();

          if (conflictingBooking) {
            await queryRunner.rollbackTransaction();
            res.status(422).json({
              success: false,
              message: 'Room is already reserved for the new dates',
              error: 'ROOM_ALREADY_RESERVED'
            });
            return;
          }
        }

        // Update dates
        if (updates.checkIn) booking.checkin_date = newCheckIn;
        if (updates.checkOut) booking.checkout_date = newCheckOut;

        // Recalculate nights and total
        const nights = Math.ceil((newCheckOut.getTime() - newCheckIn.getTime()) / (1000 * 60 * 60 * 24));
        booking.nights = nights;
        booking.total_amount = Number(booking.room.price_per_night) * nights;
      }

      // Update status if provided
      if (updates.status) {
        booking.status = updates.status;

        // If cancelling, release room and update payment
        if (updates.status === BookingStatus.CANCELLED) {
          await queryRunner.manager.update(Room, booking.room_id, {
            status: RoomStatus.AVAILABLE
          });

          const payment = await queryRunner.manager.findOne(Payment, {
            where: { booking_id: id }
          });

          if (payment && payment.status === PaymentStatus.PENDING) {
            payment.status = PaymentStatus.CANCELLED;
            await queryRunner.manager.save(Payment, payment);
          }
        }
      }

      // Save booking
      const updatedBooking = await queryRunner.manager.save(Booking, booking);

      await queryRunner.commitTransaction();

      res.status(200).json({
        success: true,
        message: 'Booking updated successfully',
        data: {
          id: updatedBooking.id,
          checkin_date: updatedBooking.checkin_date,
          checkout_date: updatedBooking.checkout_date,
          nights: updatedBooking.nights,
          total_amount: Number(updatedBooking.total_amount),
          status: updatedBooking.status
        }
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error updating booking:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating booking',
        error: 'INTERNAL_SERVER_ERROR'
      });
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Delete booking
   * DELETE /api/bookings/:id
   */
  async deleteBooking(req: Request, res: Response): Promise<void> {
    const queryRunner = this.bookingRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { id } = req.params;

      // Find booking with relations
      const booking = await queryRunner.manager.findOne(Booking, {
        where: { id },
        relations: ['payments']
      });

      if (!booking) {
        await queryRunner.rollbackTransaction();
        res.status(404).json({
          success: false,
          message: 'Booking not found',
          error: 'NOT_FOUND'
        });
        return;
      }

      // Check if booking can be deleted
      if (booking.status === BookingStatus.CONFIRMED) {
        const payment = booking.payments?.find(p => p.status === PaymentStatus.SUCCESS);
        if (payment) {
          await queryRunner.rollbackTransaction();
          res.status(422).json({
            success: false,
            message: 'Cannot delete confirmed booking with successful payment. Cancel booking instead.',
            error: 'CANNOT_DELETE_CONFIRMED_BOOKING'
          });
          return;
        }
      }

      // Release room if occupied
      if (booking.status === BookingStatus.PENDING_PAYMENT) {
        await queryRunner.manager.update(Room, booking.room_id, {
          status: RoomStatus.AVAILABLE
        });
      }

      // Delete associated payments first
      if (booking.payments && booking.payments.length > 0) {
        await queryRunner.manager.delete(Payment, { booking_id: id });
      }

      // Delete booking
      await queryRunner.manager.delete(Booking, id);

      await queryRunner.commitTransaction();

      res.status(200).json({
        success: true,
        message: 'Booking deleted successfully',
        data: {
          id: booking.id
        }
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error deleting booking:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting booking',
        error: 'INTERNAL_SERVER_ERROR'
      });
    } finally {
      await queryRunner.release();
    }
  }
}
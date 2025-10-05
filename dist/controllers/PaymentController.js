"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const Booking_1 = require("../models/Booking");
const Payment_1 = require("../models/Payment");
const PaymentLog_1 = require("../models/PaymentLog");
const Room_1 = require("../models/Room");
class PaymentController {
    constructor(dataSource) {
        this.bookingRepository = dataSource.getRepository(Booking_1.Booking);
        this.paymentRepository = dataSource.getRepository(Payment_1.Payment);
        this.paymentLogRepository = dataSource.getRepository(PaymentLog_1.PaymentLog);
        this.roomRepository = dataSource.getRepository(Room_1.Room);
    }
    /**
     * Initiate payment for a booking
     * POST /api/payments/initiate
     */
    async initiatePayment(req, res) {
        const queryRunner = this.paymentRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const { bookingId, provider } = req.body;
            // Validate required fields
            if (!bookingId || !provider) {
                res.status(400).json({
                    success: false,
                    message: 'bookingId and provider are required',
                    error: 'BAD_REQUEST'
                });
                return;
            }
            // Validate provider
            if (!Object.values(Payment_1.PaymentProvider).includes(provider)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid payment provider. Supported: telebirr, chappa, ebirr, kaafi',
                    error: 'BAD_REQUEST'
                });
                return;
            }
            // Find the booking
            const booking = await queryRunner.manager.findOne(Booking_1.Booking, {
                where: { id: bookingId },
                relations: ['user', 'hotel', 'room']
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
            // Check if booking is in pending status
            if (booking.status !== Booking_1.BookingStatus.PENDING) {
                await queryRunner.rollbackTransaction();
                res.status(422).json({
                    success: false,
                    message: `Cannot initiate payment for booking with status: ${booking.status}`,
                    error: 'INVALID_BOOKING_STATUS'
                });
                return;
            }
            // Find existing payment for this booking
            let payment = await queryRunner.manager.findOne(Payment_1.Payment, {
                where: { booking_id: bookingId }
            });
            if (!payment) {
                // Create new payment if none exists
                payment = queryRunner.manager.create(Payment_1.Payment, {
                    booking_id: bookingId,
                    amount: booking.total_amount,
                    provider,
                    status: Payment_1.PaymentStatus.PENDING
                });
            }
            else {
                // Update existing payment
                payment.provider = provider;
                payment.status = Payment_1.PaymentStatus.PENDING;
            }
            // Generate a mock provider reference (in real implementation, this would come from the payment provider)
            const providerReference = `${provider.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            payment.provider_reference = providerReference;
            const savedPayment = await queryRunner.manager.save(Payment_1.Payment, payment);
            // Log the payment initiation
            const paymentLog = queryRunner.manager.create(PaymentLog_1.PaymentLog, {
                payment_id: savedPayment.id,
                booking_id: bookingId,
                action: 'PAYMENT_INITIATED',
                details: `Payment initiated with ${provider} - Reference: ${providerReference}`
            });
            await queryRunner.manager.save(PaymentLog_1.PaymentLog, paymentLog);
            await queryRunner.commitTransaction();
            // In a real implementation, you would integrate with the actual payment provider here
            // For now, we'll return mock payment details
            res.status(200).json({
                success: true,
                message: 'Payment initiated successfully',
                data: {
                    payment: {
                        id: savedPayment.id,
                        booking_id: bookingId,
                        amount: Number(savedPayment.amount),
                        provider,
                        provider_reference: providerReference,
                        status: savedPayment.status,
                        created_at: savedPayment.created_at
                    },
                    booking: {
                        id: booking.id,
                        user: {
                            name: `${booking.user.first_name} ${booking.user.last_name}`,
                            phone: booking.user.phone
                        },
                        hotel: booking.hotel.name,
                        room: booking.room.room_number,
                        total_amount: Number(booking.total_amount)
                    },
                    payment_instructions: {
                        provider,
                        reference: providerReference,
                        amount: Number(savedPayment.amount),
                        callback_url: '/api/payments/callback',
                        // Mock payment URL (in real implementation, this would be the provider's payment URL)
                        payment_url: `https://mock-${provider}.com/pay?ref=${providerReference}&amount=${savedPayment.amount}`
                    }
                }
            });
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error initiating payment:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error while initiating payment',
                error: 'INTERNAL_SERVER_ERROR'
            });
        }
        finally {
            await queryRunner.release();
        }
    }
    /**
     * Handle payment callback from provider
     * POST /api/payments/callback
     */
    async handlePaymentCallback(req, res) {
        const queryRunner = this.paymentRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const callbackData = req.body;
            const { status, provider_reference, transaction_id, error_message } = callbackData;
            // Find payment by provider reference or booking ID
            let payment = null;
            if (provider_reference) {
                payment = await queryRunner.manager.findOne(Payment_1.Payment, {
                    where: { provider_reference },
                    relations: ['booking', 'booking.user', 'booking.hotel', 'booking.room']
                });
            }
            else if (callbackData.bookingId) {
                payment = await queryRunner.manager.findOne(Payment_1.Payment, {
                    where: { booking_id: callbackData.bookingId },
                    relations: ['booking', 'booking.user', 'booking.hotel', 'booking.room']
                });
            }
            if (!payment) {
                await queryRunner.rollbackTransaction();
                res.status(404).json({
                    success: false,
                    message: 'Payment not found',
                    error: 'PAYMENT_NOT_FOUND'
                });
                return;
            }
            const booking = payment.booking;
            // Validate payment amount if provided
            if (callbackData.amount && Number(callbackData.amount) !== Number(payment.amount)) {
                await queryRunner.rollbackTransaction();
                // Log payment mismatch
                const paymentLog = queryRunner.manager.create(PaymentLog_1.PaymentLog, {
                    payment_id: payment.id,
                    booking_id: booking.id,
                    action: 'PAYMENT_MISMATCH',
                    details: `Amount mismatch: expected ${payment.amount}, received ${callbackData.amount}`
                });
                await queryRunner.manager.save(PaymentLog_1.PaymentLog, paymentLog);
                res.status(422).json({
                    success: false,
                    message: 'Payment amount mismatch',
                    error: 'PAYMENT_MISMATCH'
                });
                return;
            }
            if (status === 'success') {
                // Update payment status to success
                payment.status = Payment_1.PaymentStatus.SUCCESS;
                if (transaction_id) {
                    payment.provider_reference = transaction_id;
                }
                await queryRunner.manager.save(Payment_1.Payment, payment);
                // Update booking status to confirmed
                booking.status = Booking_1.BookingStatus.CONFIRMED;
                await queryRunner.manager.save(Booking_1.Booking, booking);
                // Keep room as occupied (it was locked during booking creation)
                // In a real system, you might want to update room status differently
                // Log successful payment
                const paymentLog = queryRunner.manager.create(PaymentLog_1.PaymentLog, {
                    payment_id: payment.id,
                    booking_id: booking.id,
                    action: 'PAYMENT_SUCCESS',
                    details: `Payment successful - Transaction ID: ${transaction_id || provider_reference}`
                });
                await queryRunner.manager.save(PaymentLog_1.PaymentLog, paymentLog);
                await queryRunner.commitTransaction();
                // In a real implementation, you would send a receipt/confirmation email/SMS here
                res.status(200).json({
                    success: true,
                    message: 'Payment processed successfully. Booking confirmed.',
                    data: {
                        payment: {
                            id: payment.id,
                            status: payment.status,
                            amount: Number(payment.amount),
                            provider: payment.provider,
                            transaction_id: transaction_id || provider_reference
                        },
                        booking: {
                            id: booking.id,
                            status: booking.status,
                            confirmation_number: booking.id.substr(-8).toUpperCase()
                        },
                        receipt: {
                            guest_name: `${booking.user.first_name} ${booking.user.last_name}`,
                            guest_phone: booking.user.phone,
                            hotel: booking.hotel.name,
                            room: booking.room.room_number,
                            checkin: booking.checkin_date,
                            checkout: booking.checkout_date,
                            nights: booking.nights,
                            amount_paid: Number(payment.amount),
                            payment_method: payment.provider
                        }
                    }
                });
            }
            else {
                // Payment failed
                payment.status = Payment_1.PaymentStatus.FAILED;
                await queryRunner.manager.save(Payment_1.Payment, payment);
                // Cancel booking and release room
                booking.status = Booking_1.BookingStatus.CANCELLED;
                await queryRunner.manager.save(Booking_1.Booking, booking);
                // Release the room by setting it back to available
                await queryRunner.manager.update(Room_1.Room, booking.room_id, {
                    status: Room_1.RoomStatus.AVAILABLE
                });
                // Log failed payment
                const paymentLog = queryRunner.manager.create(PaymentLog_1.PaymentLog, {
                    payment_id: payment.id,
                    booking_id: booking.id,
                    action: 'PAYMENT_FAILED',
                    details: `Payment failed - Error: ${error_message || 'Unknown error'}`
                });
                await queryRunner.manager.save(PaymentLog_1.PaymentLog, paymentLog);
                await queryRunner.commitTransaction();
                res.status(200).json({
                    success: true,
                    message: 'Payment failed. Booking cancelled and room released.',
                    data: {
                        payment: {
                            id: payment.id,
                            status: payment.status,
                            error: error_message || 'Payment failed'
                        },
                        booking: {
                            id: booking.id,
                            status: booking.status
                        },
                        room_released: true
                    }
                });
            }
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error processing payment callback:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error while processing payment callback',
                error: 'INTERNAL_SERVER_ERROR'
            });
        }
        finally {
            await queryRunner.release();
        }
    }
    /**
     * Get payment status
     * GET /api/payments/:id
     */
    async getPaymentStatus(req, res) {
        try {
            const { id } = req.params;
            const payment = await this.paymentRepository.findOne({
                where: { id },
                relations: ['booking', 'booking.user', 'booking.hotel', 'booking.room', 'payment_logs']
            });
            if (!payment) {
                res.status(404).json({
                    success: false,
                    message: 'Payment not found',
                    error: 'NOT_FOUND'
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: {
                    payment: {
                        id: payment.id,
                        amount: Number(payment.amount),
                        provider: payment.provider,
                        provider_reference: payment.provider_reference,
                        status: payment.status,
                        created_at: payment.created_at
                    },
                    booking: {
                        id: payment.booking.id,
                        status: payment.booking.status,
                        user: `${payment.booking.user.first_name} ${payment.booking.user.last_name}`,
                        hotel: payment.booking.hotel.name,
                        room: payment.booking.room.room_number
                    },
                    logs: payment.payment_logs.map(log => ({
                        action: log.action,
                        details: log.details,
                        created_at: log.created_at
                    }))
                }
            });
        }
        catch (error) {
            console.error('Error getting payment status:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching payment status',
                error: 'INTERNAL_SERVER_ERROR'
            });
        }
    }
}
exports.PaymentController = PaymentController;

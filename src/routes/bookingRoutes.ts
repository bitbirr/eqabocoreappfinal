import { Router } from 'express';
import { DataSource } from 'typeorm';
import { BookingController } from '../controllers/BookingController';

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Hotel booking management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateBookingRequest:
 *       type: object
 *       required:
 *         - room_id
 *         - check_in_date
 *         - check_out_date
 *         - guest_count
 *         - guest_name
 *         - guest_email
 *         - guest_phone
 *       properties:
 *         room_id:
 *           type: integer
 *           example: 1
 *           description: ID of the room to book
 *         check_in_date:
 *           type: string
 *           format: date
 *           example: "2025-10-01"
 *           description: Check-in date (YYYY-MM-DD format)
 *         check_out_date:
 *           type: string
 *           format: date
 *           example: "2025-10-03"
 *           description: Check-out date (YYYY-MM-DD format)
 *         guest_count:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           example: 2
 *           description: Number of guests
 *         guest_name:
 *           type: string
 *           example: "John Doe"
 *           description: Primary guest name
 *         guest_email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *           description: Guest email address
 *         guest_phone:
 *           type: string
 *           example: "+1234567890"
 *           description: Guest phone number
 *         special_requests:
 *           type: string
 *           example: "Late check-in requested"
 *           description: Any special requests or notes
 *     BookingResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           allOf:
 *             - $ref: '#/components/schemas/Booking'
 *             - type: object
 *               properties:
 *                 room:
 *                   $ref: '#/components/schemas/Room'
 *                 hotel:
 *                   $ref: '#/components/schemas/Hotel'
 *                 payment:
 *                   $ref: '#/components/schemas/Payment'
 */

/**
 * Create booking routes
 */
export function createBookingRoutes(dataSource: DataSource): Router {
  const router = Router();
  const bookingController = new BookingController(dataSource);

  /**
   * @swagger
   * /api/bookings:
   *   post:
   *     summary: Create a new hotel booking
   *     description: Create a new booking for a hotel room with guest details and payment processing
   *     tags: [Bookings]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateBookingRequest'
   *     responses:
   *       201:
   *         description: Booking created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BookingResponse'
   *       400:
   *         description: Invalid request data (invalid dates, room unavailable, etc.)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Room not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       409:
   *         description: Room not available for selected dates
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/', (req, res) => bookingController.createBooking(req, res));

  /**
   * @swagger
   * /api/bookings/{id}:
   *   get:
   *     summary: Get booking details
   *     description: Retrieve detailed information about a specific booking including room, hotel, and payment details
   *     tags: [Bookings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *           example: 1
   *         description: Booking ID
   *     responses:
   *       200:
   *         description: Booking details retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BookingResponse'
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Access denied - can only view own bookings
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Booking not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/:id', (req, res) => bookingController.getBooking(req, res));

  /**
   * @swagger
   * /api/bookings/{id}:
   *   put:
   *     summary: Update booking details
   *     description: Update booking dates or cancel booking
   *     tags: [Bookings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *           example: 1
   *         description: Booking ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               checkIn:
   *                 type: string
   *                 format: date
   *                 example: "2025-10-02"
   *                 description: New check-in date (YYYY-MM-DD)
   *               checkOut:
   *                 type: string
   *                 format: date
   *                 example: "2025-10-04"
   *                 description: New check-out date (YYYY-MM-DD)
   *               status:
   *                 type: string
   *                 enum: [cancelled]
   *                 example: "cancelled"
   *                 description: Only cancellation is allowed
   *     responses:
   *       200:
   *         description: Booking updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BookingResponse'
   *       400:
   *         description: Invalid request data or status transition
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Access denied - can only update own bookings
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Booking not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       422:
   *         description: Cannot update booking (room conflict, paid booking, etc.)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.put('/:id', (req, res) => bookingController.updateBooking(req, res));

  /**
   * @swagger
   * /api/bookings/{id}:
   *   delete:
   *     summary: Delete booking
   *     description: Permanently delete a booking and associated data
   *     tags: [Bookings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *           example: 1
   *         description: Booking ID
   *     responses:
   *       200:
   *         description: Booking deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Booking deleted successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Access denied - can only delete own bookings
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Booking not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       422:
   *         description: Cannot delete confirmed booking with successful payment
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.delete('/:id', (req, res) => bookingController.deleteBooking(req, res));

  return router;
}
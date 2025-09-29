import { Router } from 'express';
import { DataSource } from 'typeorm';
import { HotelController } from '../controllers/HotelController';

/**
 * @swagger
 * tags:
 *   name: Hotels
 *   description: Hotel search and room availability endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     HotelSearchResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             hotels:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hotel'
 *             pagination:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 25
 *                 limit:
 *                   type: integer
 *                   example: 20
 *                 offset:
 *                   type: integer
 *                   example: 0
 *                 hasMore:
 *                   type: boolean
 *                   example: true
 *     RoomAvailabilityResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             hotel:
 *               $ref: '#/components/schemas/Hotel'
 *             rooms:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Room'
 *                   - type: object
 *                     properties:
 *                       available:
 *                         type: boolean
 *                         example: true
 *                       total_price:
 *                         type: number
 *                         format: decimal
 *                         example: 5000.00
 *                         description: Total price for the stay period
 *             search_criteria:
 *               type: object
 *               properties:
 *                 check_in:
 *                   type: string
 *                   format: date
 *                   example: "2025-10-01"
 *                 check_out:
 *                   type: string
 *                   format: date
 *                   example: "2025-10-03"
 *                 nights:
 *                   type: integer
 *                   example: 2
 */

/**
 * Create hotel routes
 */
export function createHotelRoutes(dataSource: DataSource): Router {
  const router = Router();
  const hotelController = new HotelController(dataSource);

  /**
   * @swagger
   * /api/hotels:
   *   get:
   *     summary: Search hotels by city
   *     description: Search for hotels in a specific city with pagination support
   *     tags: [Hotels]
   *     parameters:
   *       - in: query
   *         name: city
   *         required: true
   *         schema:
   *           type: string
   *           example: "Addis Ababa"
   *         description: City name to search hotels in
   *       - in: query
   *         name: limit
   *         required: false
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *           example: 20
   *         description: Maximum number of hotels to return
   *       - in: query
   *         name: offset
   *         required: false
   *         schema:
   *           type: integer
   *           minimum: 0
   *           default: 0
   *           example: 0
   *         description: Number of hotels to skip for pagination
   *     responses:
   *       200:
   *         description: Hotels found successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/HotelSearchResponse'
   *       400:
   *         description: Invalid request parameters
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
  router.get('/', (req, res) => hotelController.searchHotels(req, res));

  /**
   * @swagger
   * /api/hotels/search:
   *   get:
   *     summary: Search hotels by city (alternative endpoint)
   *     description: Search for hotels in a specific city with pagination support (same as /api/hotels)
   *     tags: [Hotels]
   *     parameters:
   *       - in: query
   *         name: city
   *         required: true
   *         schema:
   *           type: string
   *           example: "Addis Ababa"
   *         description: City name to search hotels in
   *       - in: query
   *         name: limit
   *         required: false
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *           example: 20
   *         description: Maximum number of hotels to return
   *       - in: query
   *         name: offset
   *         required: false
   *         schema:
   *           type: integer
   *           minimum: 0
   *           default: 0
   *           example: 0
   *         description: Number of hotels to skip for pagination
   *     responses:
   *       200:
   *         description: Hotels found successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/HotelSearchResponse'
   *       400:
   *         description: Invalid request parameters
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
  router.get('/search', (req, res) => hotelController.searchHotels(req, res));

  /**
   * @swagger
   * /api/hotels/{id}/rooms:
   *   get:
   *     summary: Get available rooms for a hotel
   *     description: Retrieve available rooms for a specific hotel with date filtering and pricing
   *     tags: [Hotels]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *           example: 1
   *         description: Hotel ID
   *       - in: query
   *         name: checkin
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *           example: "2025-10-01"
   *         description: Check-in date (YYYY-MM-DD format)
   *       - in: query
   *         name: checkout
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *           example: "2025-10-03"
   *         description: Check-out date (YYYY-MM-DD format)
   *     responses:
   *       200:
   *         description: Room availability retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/RoomAvailabilityResponse'
   *       400:
   *         description: Invalid request parameters (invalid dates, hotel ID, etc.)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Hotel not found
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
  router.get('/:id/rooms', (req, res) => hotelController.getHotelRooms(req, res));

  /**
   * @swagger
   * /api/hotels:
   *   post:
   *     summary: Create a new hotel
   *     description: Create a new hotel with the provided details
   *     tags: [Hotels]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - location
   *             properties:
   *               name:
   *                 type: string
   *                 example: "Sheraton Addis"
   *               location:
   *                 type: string
   *                 example: "Addis Ababa"
   *               description:
   *                 type: string
   *                 example: "Luxury hotel in the heart of Addis Ababa"
   *               owner_id:
   *                 type: string
   *                 example: "uuid-hotel-owner"
   *     responses:
   *       201:
   *         description: Hotel created successfully
   *       400:
   *         description: Invalid request data
   *       409:
   *         description: Hotel already exists
   *       500:
   *         description: Internal server error
   */
  router.post('/', (req, res) => hotelController.createHotel(req, res));

  /**
   * @swagger
   * /api/hotels/{id}:
   *   put:
   *     summary: Update hotel details
   *     description: Update an existing hotel's information
   *     tags: [Hotels]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Hotel ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 example: "Sheraton Addis Updated"
   *               location:
   *                 type: string
   *                 example: "Addis Ababa"
   *               description:
   *                 type: string
   *                 example: "Updated luxury hotel description"
   *               status:
   *                 type: string
   *                 enum: [active, inactive, suspended]
   *                 example: "active"
   *     responses:
   *       200:
   *         description: Hotel updated successfully
   *       400:
   *         description: Invalid request data
   *       404:
   *         description: Hotel not found
   *       409:
   *         description: Hotel name conflict
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', (req, res) => hotelController.updateHotel(req, res));

  /**
   * @swagger
   * /api/hotels/{id}:
   *   delete:
   *     summary: Delete hotel
   *     description: Soft delete a hotel by setting its status to inactive
   *     tags: [Hotels]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Hotel ID
   *     responses:
   *       200:
   *         description: Hotel deleted successfully
   *       404:
   *         description: Hotel not found
   *       422:
   *         description: Cannot delete hotel with active bookings
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', (req, res) => hotelController.deleteHotel(req, res));

  /**
   * @swagger
   * /api/hotels/{hotelId}/rooms:
   *   post:
   *     summary: Create a new room for a hotel
   *     description: Create a new room for the specified hotel
   *     tags: [Hotels]
   *     parameters:
   *       - in: path
   *         name: hotelId
   *         required: true
   *         schema:
   *           type: string
   *         description: Hotel ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - room_number
   *               - room_type
   *               - price_per_night
   *             properties:
   *               room_number:
   *                 type: string
   *                 example: "101"
   *               room_type:
   *                 type: string
   *                 example: "Deluxe"
   *               price_per_night:
   *                 type: number
   *                 format: decimal
   *                 example: 150.00
   *               description:
   *                 type: string
   *                 example: "Spacious room with city view"
   *     responses:
   *       201:
   *         description: Room created successfully
   *       400:
   *         description: Invalid request data
   *       404:
   *         description: Hotel not found
   *       409:
   *         description: Room number already exists
   *       500:
   *         description: Internal server error
   */
  router.post('/:hotelId/rooms', (req, res) => hotelController.createRoom(req, res));

  /**
   * @swagger
   * /api/rooms/{id}:
   *   put:
   *     summary: Update room details
   *     description: Update an existing room's information
   *     tags: [Hotels]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Room ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               room_number:
   *                 type: string
   *                 example: "102"
   *               room_type:
   *                 type: string
   *                 example: "Suite"
   *               price_per_night:
   *                 type: number
   *                 format: decimal
   *                 example: 200.00
   *               description:
   *                 type: string
   *                 example: "Updated room description"
   *               status:
   *                 type: string
   *                 enum: [available, occupied, maintenance, out_of_order]
   *                 example: "available"
   *     responses:
   *       200:
   *         description: Room updated successfully
   *       400:
   *         description: Invalid request data
   *       404:
   *         description: Room not found
   *       409:
   *         description: Room number conflict
   *       500:
   *         description: Internal server error
   */
  router.put('/rooms/:id', (req, res) => hotelController.updateRoom(req, res));

  /**
   * @swagger
   * /api/rooms/{id}:
   *   delete:
   *     summary: Delete room
   *     description: Permanently delete a room
   *     tags: [Hotels]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Room ID
   *     responses:
   *       200:
   *         description: Room deleted successfully
   *       404:
   *         description: Room not found
   *       422:
   *         description: Cannot delete room with active bookings
   *       500:
   *         description: Internal server error
   */
  router.delete('/rooms/:id', (req, res) => hotelController.deleteRoom(req, res));

  return router;
}
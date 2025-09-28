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

  return router;
}
import { Router } from 'express';
import { DataSource } from 'typeorm';
import { RoomController } from '../controllers/RoomController';

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: Room management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Room:
 *       type: object
 *       properties:
 *         roomId:
 *           type: integer
 *           example: 1
 *         hotelId:
 *           type: integer
 *           example: 1
 *         roomNumber:
 *           type: string
 *           maxLength: 10
 *           example: "101"
 *         roomType:
 *           type: string
 *           enum: [single, double, suite]
 *           example: "double"
 *         price:
 *           type: number
 *           format: decimal
 *           example: 1500.00
 *         status:
 *           type: string
 *           enum: [Available, Reserved]
 *           example: "Available"
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * Create room routes
 */
export function createRoomRoutes(dataSource: DataSource): Router {
  const router = Router();
  const roomController = new RoomController(dataSource);

  /**
   * @swagger
   * /api/v1/hotels/{hotelId}/rooms:
   *   post:
   *     summary: Create a new room
   *     tags: [Rooms]
   *     parameters:
   *       - in: path
   *         name: hotelId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Hotel ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - roomNumber
   *               - roomType
   *               - price
   *             properties:
   *               roomNumber:
   *                 type: string
   *                 maxLength: 10
   *                 example: "101"
   *               roomType:
   *                 type: string
   *                 enum: [single, double, suite]
   *                 example: "double"
   *               price:
   *                 type: number
   *                 minimum: 0.01
   *                 example: 1500.00
   *     responses:
   *       201:
   *         description: Room created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Room'
   *                 message:
   *                   type: string
   *                   example: "Room created successfully"
   *       400:
   *         description: Invalid input
   *       404:
   *         description: Hotel not found
   *       409:
   *         description: Room number already exists
   *       500:
   *         description: Internal server error
   */
  router.post('/hotels/:hotelId/rooms', (req, res) => roomController.createRoom(req, res));

  /**
   * @swagger
   * /api/v1/hotels/{hotelId}/rooms:
   *   get:
   *     summary: Get all rooms for a hotel
   *     tags: [Rooms]
   *     parameters:
   *       - in: path
   *         name: hotelId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Hotel ID
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *         description: Items per page
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [Available, Reserved]
   *         description: Filter by room status
   *     responses:
   *       200:
   *         description: Rooms retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Room'
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     page:
   *                       type: integer
   *                       example: 1
   *                     limit:
   *                       type: integer
   *                       example: 20
   *                     total:
   *                       type: integer
   *                       example: 50
   *                     totalPages:
   *                       type: integer
   *                       example: 3
   *       404:
   *         description: Hotel not found
   *       500:
   *         description: Internal server error
   */
  router.get('/hotels/:hotelId/rooms', (req, res) => roomController.getRoomsByHotel(req, res));

  /**
   * @swagger
   * /api/v1/rooms/{roomId}:
   *   get:
   *     summary: Get room by ID
   *     tags: [Rooms]
   *     parameters:
   *       - in: path
   *         name: roomId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Room ID
   *     responses:
   *       200:
   *         description: Room retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Room'
   *       404:
   *         description: Room not found
   *       500:
   *         description: Internal server error
   */
  router.get('/rooms/:roomId', (req, res) => roomController.getRoomById(req, res));

  /**
   * @swagger
   * /api/v1/rooms/{roomId}:
   *   put:
   *     summary: Update room
   *     tags: [Rooms]
   *     parameters:
   *       - in: path
   *         name: roomId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Room ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               roomNumber:
   *                 type: string
   *                 maxLength: 10
   *                 example: "101"
   *               roomType:
   *                 type: string
   *                 enum: [single, double, suite]
   *                 example: "double"
   *               price:
   *                 type: number
   *                 minimum: 0.01
   *                 example: 1500.00
   *               status:
   *                 type: string
   *                 enum: [Available, Reserved]
   *                 example: "Available"
   *     responses:
   *       200:
   *         description: Room updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Room'
   *                 message:
   *                   type: string
   *                   example: "Room updated successfully"
   *       400:
   *         description: Invalid input
   *       404:
   *         description: Room not found
   *       409:
   *         description: Room number already exists
   *       500:
   *         description: Internal server error
   */
  router.put('/rooms/:roomId', (req, res) => roomController.updateRoom(req, res));

  /**
   * @swagger
   * /api/v1/rooms/{roomId}:
   *   delete:
   *     summary: Delete room
   *     tags: [Rooms]
   *     parameters:
   *       - in: path
   *         name: roomId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Room ID
   *     responses:
   *       204:
   *         description: Room deleted successfully
   *       404:
   *         description: Room not found
   *       409:
   *         description: Cannot delete reserved room
   *       500:
   *         description: Internal server error
   */
  router.delete('/rooms/:roomId', (req, res) => roomController.deleteRoom(req, res));

  return router;
}

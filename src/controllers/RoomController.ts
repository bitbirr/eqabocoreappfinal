import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { RoomService } from '../services/RoomService';
import { RoomType, RoomStatus } from '../models/Room';

export class RoomController {
  private roomService: RoomService;

  constructor(dataSource: DataSource) {
    this.roomService = new RoomService(dataSource);
  }

  /**
   * Create a new room
   * POST /api/v1/hotels/:hotelId/rooms
   */
  async createRoom(req: Request, res: Response): Promise<void> {
    try {
      const hotelId = parseInt(req.params.hotelId);
      const { roomNumber, roomType, price } = req.body;

      if (isNaN(hotelId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid hotel ID',
          error: 'BAD_REQUEST'
        });
        return;
      }

      console.log(`[${new Date().toISOString()}] Creating room in hotel ${hotelId}: ${roomNumber}`);

      const room = await this.roomService.createRoom(hotelId, roomNumber, roomType, price);

      console.log(`[${new Date().toISOString()}] Room created successfully: ID ${room.roomId}`);

      res.status(201).json({
        success: true,
        data: room,
        message: 'Room created successfully'
      });
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Error creating room:`, error);

      if (error.message === 'Hotel not found' || error.message === 'Hotel is not active') {
        res.status(404).json({
          success: false,
          message: error.message,
          error: 'NOT_FOUND'
        });
        return;
      }

      if (error.message.includes('already exists')) {
        res.status(409).json({
          success: false,
          message: error.message,
          error: 'CONFLICT'
        });
        return;
      }

      if (
        error.message.includes('required') ||
        error.message.includes('Invalid') ||
        error.message.includes('must')
      ) {
        res.status(400).json({
          success: false,
          message: error.message,
          error: 'BAD_REQUEST'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create room',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Get all rooms for a hotel
   * GET /api/v1/hotels/:hotelId/rooms
   */
  async getRoomsByHotel(req: Request, res: Response): Promise<void> {
    try {
      const hotelId = parseInt(req.params.hotelId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as RoomStatus;

      if (isNaN(hotelId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid hotel ID',
          error: 'BAD_REQUEST'
        });
        return;
      }

      console.log(`[${new Date().toISOString()}] Fetching rooms for hotel ${hotelId}: page=${page}, limit=${limit}, status=${status || 'all'}`);

      const result = await this.roomService.getRoomsByHotel(hotelId, page, limit, status);

      res.status(200).json({
        success: true,
        data: result.rooms,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Error fetching rooms:`, error);

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
        message: 'Failed to fetch rooms',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Get room by ID
   * GET /api/v1/rooms/:roomId
   */
  async getRoomById(req: Request, res: Response): Promise<void> {
    try {
      const roomId = parseInt(req.params.roomId);

      if (isNaN(roomId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid room ID',
          error: 'BAD_REQUEST'
        });
        return;
      }

      console.log(`[${new Date().toISOString()}] Fetching room: ID ${roomId}`);

      const room = await this.roomService.getRoomById(roomId);

      if (!room) {
        res.status(404).json({
          success: false,
          message: 'Room not found',
          error: 'NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: room
      });
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Error fetching room:`, error);

      res.status(500).json({
        success: false,
        message: 'Failed to fetch room',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Update room
   * PUT /api/v1/rooms/:roomId
   */
  async updateRoom(req: Request, res: Response): Promise<void> {
    try {
      const roomId = parseInt(req.params.roomId);
      const updates = req.body;

      if (isNaN(roomId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid room ID',
          error: 'BAD_REQUEST'
        });
        return;
      }

      console.log(`[${new Date().toISOString()}] Updating room: ID ${roomId}`, updates);

      const room = await this.roomService.updateRoom(roomId, updates);

      console.log(`[${new Date().toISOString()}] Room updated successfully: ID ${roomId}`);

      res.status(200).json({
        success: true,
        data: room,
        message: 'Room updated successfully'
      });
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Error updating room:`, error);

      if (error.message === 'Room not found') {
        res.status(404).json({
          success: false,
          message: error.message,
          error: 'NOT_FOUND'
        });
        return;
      }

      if (error.message.includes('already exists')) {
        res.status(409).json({
          success: false,
          message: error.message,
          error: 'CONFLICT'
        });
        return;
      }

      if (error.message.includes('Invalid') || error.message.includes('must')) {
        res.status(400).json({
          success: false,
          message: error.message,
          error: 'BAD_REQUEST'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update room',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Delete room
   * DELETE /api/v1/rooms/:roomId
   */
  async deleteRoom(req: Request, res: Response): Promise<void> {
    try {
      const roomId = parseInt(req.params.roomId);

      if (isNaN(roomId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid room ID',
          error: 'BAD_REQUEST'
        });
        return;
      }

      console.log(`[${new Date().toISOString()}] Deleting room: ID ${roomId}`);

      await this.roomService.deleteRoom(roomId);

      console.log(`[${new Date().toISOString()}] Room deleted successfully: ID ${roomId}`);

      res.status(204).send();
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Error deleting room:`, error);

      if (error.message === 'Room not found') {
        res.status(404).json({
          success: false,
          message: error.message,
          error: 'NOT_FOUND'
        });
        return;
      }

      if (error.message.includes('Cannot delete')) {
        res.status(409).json({
          success: false,
          message: error.message,
          error: 'CONFLICT'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete room',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }
}

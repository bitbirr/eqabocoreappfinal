import request from 'supertest';
import { Express } from 'express';
import { DataSource } from 'typeorm';
import { createApp } from '../src/app';
import { AppDataSource } from '../src/config/database';
import { RoomStatus, RoomType } from '../src/models/Room';

describe('Room CRUD API', () => {
  let app: Express;
  let dataSource: DataSource;
  let testCityId: number;
  let testHotelId: number;
  let createdRoomId: number;

  beforeAll(async () => {
    // Initialize database connection
    dataSource = await AppDataSource.initialize();
    app = createApp(dataSource);

    // Create a test city
    const cityResponse = await request(app)
      .post('/api/v1/cities')
      .send({
        cityName: 'Test City for Rooms',
        gps: '9.0320,38.7469'
      });
    testCityId = cityResponse.body.data.cityId;

    // Create a test hotel
    const hotelResponse = await request(app)
      .post(`/api/v1/cities/${testCityId}/hotels`)
      .send({
        hotelName: 'Test Hotel for Rooms',
        address: 'Test Address'
      });
    testHotelId = hotelResponse.body.data.hotelId;
  });

  afterAll(async () => {
    // Clean up
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  describe('POST /api/v1/hotels/:hotelId/rooms', () => {
    it('should create a new room with valid data', async () => {
      const response = await request(app)
        .post(`/api/v1/hotels/${testHotelId}/rooms`)
        .send({
          roomNumber: '101',
          roomType: RoomType.DOUBLE,
          price: 2500.00
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('roomId');
      expect(response.body.data.roomNumber).toBe('101');
      expect(response.body.data.roomType).toBe(RoomType.DOUBLE);
      expect(response.body.data.price).toBe(2500.00);
      expect(response.body.data.status).toBe(RoomStatus.AVAILABLE);
      expect(response.body.data.hotelId).toBe(testHotelId);

      createdRoomId = response.body.data.roomId;
    });

    it('should create room with different types', async () => {
      const singleResponse = await request(app)
        .post(`/api/v1/hotels/${testHotelId}/rooms`)
        .send({
          roomNumber: '102',
          roomType: RoomType.SINGLE,
          price: 1500.00
        });

      expect(singleResponse.status).toBe(201);
      expect(singleResponse.body.data.roomType).toBe(RoomType.SINGLE);

      const suiteResponse = await request(app)
        .post(`/api/v1/hotels/${testHotelId}/rooms`)
        .send({
          roomNumber: '201',
          roomType: RoomType.SUITE,
          price: 5000.00
        });

      expect(suiteResponse.status).toBe(201);
      expect(suiteResponse.body.data.roomType).toBe(RoomType.SUITE);
    });

    it('should reject duplicate room number in same hotel', async () => {
      const response = await request(app)
        .post(`/api/v1/hotels/${testHotelId}/rooms`)
        .send({
          roomNumber: '101',
          roomType: RoomType.SINGLE,
          price: 1500.00
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should allow same room number in different hotels', async () => {
      // Create another hotel
      const hotelResponse = await request(app)
        .post(`/api/v1/cities/${testCityId}/hotels`)
        .send({
          hotelName: 'Another Test Hotel',
          address: 'Another Address'
        });

      const response = await request(app)
        .post(`/api/v1/hotels/${hotelResponse.body.data.hotelId}/rooms`)
        .send({
          roomNumber: '101',
          roomType: RoomType.DOUBLE,
          price: 2500.00
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should reject missing room number', async () => {
      const response = await request(app)
        .post(`/api/v1/hotels/${testHotelId}/rooms`)
        .send({
          roomType: RoomType.SINGLE,
          price: 1500.00
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should reject missing room type', async () => {
      const response = await request(app)
        .post(`/api/v1/hotels/${testHotelId}/rooms`)
        .send({
          roomNumber: '103',
          price: 1500.00
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid room type', async () => {
      const response = await request(app)
        .post(`/api/v1/hotels/${testHotelId}/rooms`)
        .send({
          roomNumber: '103',
          roomType: 'invalid-type',
          price: 1500.00
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid room type');
    });

    it('should reject missing price', async () => {
      const response = await request(app)
        .post(`/api/v1/hotels/${testHotelId}/rooms`)
        .send({
          roomNumber: '103',
          roomType: RoomType.SINGLE
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject negative price', async () => {
      const response = await request(app)
        .post(`/api/v1/hotels/${testHotelId}/rooms`)
        .send({
          roomNumber: '103',
          roomType: RoomType.SINGLE,
          price: -100.00
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive number');
    });

    it('should reject zero price', async () => {
      const response = await request(app)
        .post(`/api/v1/hotels/${testHotelId}/rooms`)
        .send({
          roomNumber: '103',
          roomType: RoomType.SINGLE,
          price: 0
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive number');
    });

    it('should reject room number exceeding 10 characters', async () => {
      const response = await request(app)
        .post(`/api/v1/hotels/${testHotelId}/rooms`)
        .send({
          roomNumber: '12345678901',
          roomType: RoomType.SINGLE,
          price: 1500.00
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('must not exceed 10 characters');
    });

    it('should reject non-existent hotel ID', async () => {
      const response = await request(app)
        .post('/api/v1/hotels/99999/rooms')
        .send({
          roomNumber: '103',
          roomType: RoomType.SINGLE,
          price: 1500.00
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Hotel not found');
    });

    it('should reject inactive hotel', async () => {
      // Create and disable a hotel
      const hotelResponse = await request(app)
        .post(`/api/v1/cities/${testCityId}/hotels`)
        .send({
          hotelName: 'Inactive Hotel',
          address: 'Test Address'
        });

      await request(app)
        .put(`/api/v1/hotels/${hotelResponse.body.data.hotelId}`)
        .send({ status: 'inactive' });

      const response = await request(app)
        .post(`/api/v1/hotels/${hotelResponse.body.data.hotelId}/rooms`)
        .send({
          roomNumber: '104',
          roomType: RoomType.SINGLE,
          price: 1500.00
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Hotel is not active');
    });
  });

  describe('GET /api/v1/hotels/:hotelId/rooms', () => {
    it('should retrieve all rooms for a hotel with pagination', async () => {
      const response = await request(app)
        .get(`/api/v1/hotels/${testHotelId}/rooms`)
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
    });

    it('should filter rooms by status', async () => {
      const response = await request(app)
        .get(`/api/v1/hotels/${testHotelId}/rooms`)
        .query({ status: RoomStatus.AVAILABLE });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should return 404 for non-existent hotel', async () => {
      const response = await request(app)
        .get('/api/v1/hotels/99999/rooms');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Hotel not found');
    });
  });

  describe('GET /api/v1/rooms/:roomId', () => {
    it('should retrieve a room by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/rooms/${createdRoomId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.roomId).toBe(createdRoomId);
      expect(response.body.data.roomNumber).toBe('101');
    });

    it('should return 404 for non-existent room', async () => {
      const response = await request(app)
        .get('/api/v1/rooms/99999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Room not found');
    });
  });

  describe('PUT /api/v1/rooms/:roomId', () => {
    it('should update room number', async () => {
      const response = await request(app)
        .put(`/api/v1/rooms/${createdRoomId}`)
        .send({
          roomNumber: '101A'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.roomNumber).toBe('101A');
    });

    it('should update room type', async () => {
      const response = await request(app)
        .put(`/api/v1/rooms/${createdRoomId}`)
        .send({
          roomType: RoomType.SUITE
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.roomType).toBe(RoomType.SUITE);
    });

    it('should update room price', async () => {
      const response = await request(app)
        .put(`/api/v1/rooms/${createdRoomId}`)
        .send({
          price: 3000.00
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.price).toBe(3000.00);
    });

    it('should update room status', async () => {
      const response = await request(app)
        .put(`/api/v1/rooms/${createdRoomId}`)
        .send({
          status: RoomStatus.RESERVED
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(RoomStatus.RESERVED);

      // Restore to available for other tests
      await request(app)
        .put(`/api/v1/rooms/${createdRoomId}`)
        .send({ status: RoomStatus.AVAILABLE });
    });

    it('should return 404 for non-existent room', async () => {
      const response = await request(app)
        .put('/api/v1/rooms/99999')
        .send({
          roomNumber: 'Non-existent'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Room not found');
    });

    it('should reject duplicate room number in same hotel', async () => {
      const response = await request(app)
        .put(`/api/v1/rooms/${createdRoomId}`)
        .send({
          roomNumber: '102'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('DELETE /api/v1/rooms/:roomId', () => {
    let roomToDelete: number;

    beforeAll(async () => {
      // Create a room to delete
      const response = await request(app)
        .post(`/api/v1/hotels/${testHotelId}/rooms`)
        .send({
          roomNumber: '999',
          roomType: RoomType.SINGLE,
          price: 1000.00
        });
      roomToDelete = response.body.data.roomId;
    });

    it('should hard delete an available room', async () => {
      const response = await request(app)
        .delete(`/api/v1/rooms/${roomToDelete}`);

      expect(response.status).toBe(204);

      // Verify room is deleted
      const getResponse = await request(app)
        .get(`/api/v1/rooms/${roomToDelete}`);

      expect(getResponse.status).toBe(404);
    });

    it('should prevent deletion of reserved room', async () => {
      // Create a room and set it to reserved
      const createResponse = await request(app)
        .post(`/api/v1/hotels/${testHotelId}/rooms`)
        .send({
          roomNumber: '998',
          roomType: RoomType.SINGLE,
          price: 1000.00
        });

      await request(app)
        .put(`/api/v1/rooms/${createResponse.body.data.roomId}`)
        .send({ status: RoomStatus.RESERVED });

      const response = await request(app)
        .delete(`/api/v1/rooms/${createResponse.body.data.roomId}`);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Cannot delete');
      expect(response.body.message).toContain('reserved');
    });

    it('should return 404 for non-existent room', async () => {
      const response = await request(app)
        .delete('/api/v1/rooms/99999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Room not found');
    });
  });
});

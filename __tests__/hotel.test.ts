import request from 'supertest';
import { Express } from 'express';
import { DataSource } from 'typeorm';
import { createApp } from '../src/app';
import { AppDataSource } from '../src/config/database';
import { City } from '../src/models/City';
import { Hotel, HotelStatus } from '../src/models/Hotel';

describe('Hotel CRUD API', () => {
  let app: Express;
  let dataSource: DataSource;
  let testCityId: number;
  let createdHotelId: number;

  beforeAll(async () => {
    // Initialize database connection
    dataSource = await AppDataSource.initialize();
    app = createApp(dataSource);

    // Create a test city
    const cityResponse = await request(app)
      .post('/api/v1/cities')
      .send({
        cityName: 'Test City for Hotels',
        gps: '9.0320,38.7469'
      });
    testCityId = cityResponse.body.data.cityId;
  });

  afterAll(async () => {
    // Clean up
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  describe('POST /api/v1/cities/:cityId/hotels', () => {
    it('should create a new hotel with valid data', async () => {
      const response = await request(app)
        .post(`/api/v1/cities/${testCityId}/hotels`)
        .send({
          hotelName: 'Grand Palace Hotel',
          address: 'Bole Road, Addis Ababa'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('hotelId');
      expect(response.body.data.hotelName).toBe('Grand Palace Hotel');
      expect(response.body.data.address).toBe('Bole Road, Addis Ababa');
      expect(response.body.data.status).toBe(HotelStatus.ACTIVE);
      expect(response.body.data.cityId).toBe(testCityId);

      createdHotelId = response.body.data.hotelId;
    });

    it('should reject missing hotel name', async () => {
      const response = await request(app)
        .post(`/api/v1/cities/${testCityId}/hotels`)
        .send({
          address: 'Test Address'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should reject missing address', async () => {
      const response = await request(app)
        .post(`/api/v1/cities/${testCityId}/hotels`)
        .send({
          hotelName: 'Test Hotel'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should reject hotel name exceeding 100 characters', async () => {
      const response = await request(app)
        .post(`/api/v1/cities/${testCityId}/hotels`)
        .send({
          hotelName: 'H'.repeat(101),
          address: 'Test Address'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('must not exceed 100 characters');
    });

    it('should reject address exceeding 255 characters', async () => {
      const response = await request(app)
        .post(`/api/v1/cities/${testCityId}/hotels`)
        .send({
          hotelName: 'Test Hotel',
          address: 'A'.repeat(256)
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('must not exceed 255 characters');
    });

    it('should reject non-existent city ID', async () => {
      const response = await request(app)
        .post('/api/v1/cities/99999/hotels')
        .send({
          hotelName: 'Test Hotel',
          address: 'Test Address'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('City not found');
    });

    it('should reject inactive city', async () => {
      // Create and disable a city
      const cityResponse = await request(app)
        .post('/api/v1/cities')
        .send({
          cityName: 'Inactive City',
          gps: '10.0000,40.0000'
        });
      const inactiveCityId = cityResponse.body.data.cityId;

      await request(app)
        .put(`/api/v1/cities/${inactiveCityId}`)
        .send({ status: 'disabled' });

      const response = await request(app)
        .post(`/api/v1/cities/${inactiveCityId}/hotels`)
        .send({
          hotelName: 'Test Hotel',
          address: 'Test Address'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('City is not active');
    });
  });

  describe('GET /api/v1/cities/:cityId/hotels', () => {
    it('should retrieve all hotels for a city with pagination', async () => {
      const response = await request(app)
        .get(`/api/v1/cities/${testCityId}/hotels`)
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
    });

    it('should return 404 for non-existent city', async () => {
      const response = await request(app)
        .get('/api/v1/cities/99999/hotels');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('City not found');
    });
  });

  describe('GET /api/v1/hotels/:hotelId', () => {
    it('should retrieve a hotel by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/hotels/${createdHotelId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.hotelId).toBe(createdHotelId);
      expect(response.body.data.hotelName).toBe('Grand Palace Hotel');
    });

    it('should return 404 for non-existent hotel', async () => {
      const response = await request(app)
        .get('/api/v1/hotels/99999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Hotel not found');
    });
  });

  describe('PUT /api/v1/hotels/:hotelId', () => {
    it('should update hotel name', async () => {
      const response = await request(app)
        .put(`/api/v1/hotels/${createdHotelId}`)
        .send({
          hotelName: 'Updated Grand Palace Hotel'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.hotelName).toBe('Updated Grand Palace Hotel');
    });

    it('should update hotel address', async () => {
      const response = await request(app)
        .put(`/api/v1/hotels/${createdHotelId}`)
        .send({
          address: 'Updated Address, Bole'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.address).toBe('Updated Address, Bole');
    });

    it('should update hotel status', async () => {
      const response = await request(app)
        .put(`/api/v1/hotels/${createdHotelId}`)
        .send({
          status: HotelStatus.INACTIVE
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(HotelStatus.INACTIVE);

      // Restore to active for other tests
      await request(app)
        .put(`/api/v1/hotels/${createdHotelId}`)
        .send({ status: HotelStatus.ACTIVE });
    });

    it('should return 404 for non-existent hotel', async () => {
      const response = await request(app)
        .put('/api/v1/hotels/99999')
        .send({
          hotelName: 'Non-existent'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Hotel not found');
    });
  });

  describe('GET /api/v1/hotels/:hotelId/room-status', () => {
    it('should get room status summary for a hotel', async () => {
      const response = await request(app)
        .get(`/api/v1/hotels/${createdHotelId}/room-status`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalRooms');
      expect(response.body.data).toHaveProperty('available');
      expect(response.body.data).toHaveProperty('reserved');
      expect(response.body.data).toHaveProperty('rooms');
      expect(response.body.data.rooms).toBeInstanceOf(Array);
    });

    it('should return 404 for non-existent hotel', async () => {
      const response = await request(app)
        .get('/api/v1/hotels/99999/room-status');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Hotel not found');
    });
  });

  describe('DELETE /api/v1/hotels/:hotelId', () => {
    let hotelToDelete: number;

    beforeAll(async () => {
      // Create a hotel to delete
      const response = await request(app)
        .post(`/api/v1/cities/${testCityId}/hotels`)
        .send({
          hotelName: 'Hotel To Delete',
          address: 'Test Address'
        });
      hotelToDelete = response.body.data.hotelId;
    });

    it('should soft delete a hotel (set status to disabled)', async () => {
      const response = await request(app)
        .delete(`/api/v1/hotels/${hotelToDelete}`);

      expect(response.status).toBe(204);

      // Verify hotel status is disabled
      const getResponse = await request(app)
        .get(`/api/v1/hotels/${hotelToDelete}`);

      expect(getResponse.body.data.status).toBe(HotelStatus.DISABLED);
    });

    it('should return 404 for non-existent hotel', async () => {
      const response = await request(app)
        .delete('/api/v1/hotels/99999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Hotel not found');
    });

    it('should prevent deletion of hotel with reserved rooms', async () => {
      // Create a hotel
      const hotelResponse = await request(app)
        .post(`/api/v1/cities/${testCityId}/hotels`)
        .send({
          hotelName: 'Hotel With Reserved Rooms',
          address: 'Test Address'
        });
      const hotelWithRoomsId = hotelResponse.body.data.hotelId;

      // Create a room
      const roomResponse = await request(app)
        .post(`/api/v1/hotels/${hotelWithRoomsId}/rooms`)
        .send({
          roomNumber: '101',
          roomType: 'double',
          price: 2500.00
        });

      // Set room to reserved
      await request(app)
        .put(`/api/v1/rooms/${roomResponse.body.data.roomId}`)
        .send({ status: 'Reserved' });

      // Try to delete the hotel
      const response = await request(app)
        .delete(`/api/v1/hotels/${hotelWithRoomsId}`);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Cannot delete hotel');
      expect(response.body.message).toContain('reserved room');
    });
  });

  describe('GET /api/hotels/featured', () => {
    it('should retrieve featured hotels with both hotelId and id', async () => {
      const response = await request(app)
        .get('/api/hotels/featured')
        .query({ limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('hotels');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data.hotels).toBeInstanceOf(Array);
      
      // Verify that hotels have both hotelId (integer) and id (UUID)
      if (response.body.data.hotels.length > 0) {
        const hotel = response.body.data.hotels[0];
        expect(hotel).toHaveProperty('hotelId');
        expect(hotel).toHaveProperty('id');
        expect(typeof hotel.hotelId).toBe('number');
        expect(typeof hotel.id).toBe('string');
        expect(hotel).toHaveProperty('name');
        expect(hotel).toHaveProperty('location');
        expect(hotel).toHaveProperty('room_count');
      }
    });

    it('should respect the limit parameter', async () => {
      const response = await request(app)
        .get('/api/hotels/featured')
        .query({ limit: 5 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.hotels.length).toBeLessThanOrEqual(5);
    });
  });
});

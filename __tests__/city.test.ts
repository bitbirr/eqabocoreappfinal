import request from 'supertest';
import { Express } from 'express';
import { DataSource } from 'typeorm';
import { createApp } from '../src/app';
import { AppDataSource } from '../src/config/database';
import { City, CityStatus } from '../src/models/City';

describe('City CRUD API', () => {
  let app: Express;
  let dataSource: DataSource;
  let createdCityId: number;

  beforeAll(async () => {
    // Initialize database connection
    dataSource = await AppDataSource.initialize();
    app = createApp(dataSource);

    // Clear cities table
    await dataSource.getRepository(City).delete({});
  });

  afterAll(async () => {
    // Clean up
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  describe('POST /api/v1/cities', () => {
    it('should create a new city with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/cities')
        .send({
          cityName: 'Addis Ababa',
          gps: '9.0320,38.7469'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('cityId');
      expect(response.body.data.cityName).toBe('Addis Ababa');
      expect(response.body.data.gps).toBe('9.0320,38.7469');
      expect(response.body.data.status).toBe(CityStatus.ACTIVE);

      createdCityId = response.body.data.cityId;
    });

    it('should reject duplicate city name', async () => {
      const response = await request(app)
        .post('/api/v1/cities')
        .send({
          cityName: 'Addis Ababa',
          gps: '9.0320,38.7469'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should reject missing city name', async () => {
      const response = await request(app)
        .post('/api/v1/cities')
        .send({
          gps: '9.0320,38.7469'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid GPS format', async () => {
      const response = await request(app)
        .post('/api/v1/cities')
        .send({
          cityName: 'Test City',
          gps: 'invalid-gps'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid GPS');
    });

    it('should reject city name exceeding 100 characters', async () => {
      const response = await request(app)
        .post('/api/v1/cities')
        .send({
          cityName: 'A'.repeat(101),
          gps: '9.0320,38.7469'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('must not exceed 100 characters');
    });
  });

  describe('GET /api/v1/cities', () => {
    it('should retrieve all cities with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/cities')
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });
  });

  describe('GET /api/v1/cities/:cityId', () => {
    it('should retrieve a city by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/cities/${createdCityId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cityId).toBe(createdCityId);
      expect(response.body.data.cityName).toBe('Addis Ababa');
    });

    it('should return 404 for non-existent city', async () => {
      const response = await request(app)
        .get('/api/v1/cities/99999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('City not found');
    });

    it('should return 400 for invalid city ID', async () => {
      const response = await request(app)
        .get('/api/v1/cities/invalid');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/cities/:cityId', () => {
    it('should update city name', async () => {
      const response = await request(app)
        .put(`/api/v1/cities/${createdCityId}`)
        .send({
          cityName: 'Addis Ababa Updated'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cityName).toBe('Addis Ababa Updated');
    });

    it('should update GPS coordinates', async () => {
      const response = await request(app)
        .put(`/api/v1/cities/${createdCityId}`)
        .send({
          gps: '9.0330,38.7480'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.gps).toBe('9.0330,38.7480');
    });

    it('should update status', async () => {
      const response = await request(app)
        .put(`/api/v1/cities/${createdCityId}`)
        .send({
          status: CityStatus.DISABLED
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(CityStatus.DISABLED);

      // Restore to active for other tests
      await request(app)
        .put(`/api/v1/cities/${createdCityId}`)
        .send({ status: CityStatus.ACTIVE });
    });

    it('should return 404 for non-existent city', async () => {
      const response = await request(app)
        .put('/api/v1/cities/99999')
        .send({
          cityName: 'Non-existent'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid GPS format on update', async () => {
      const response = await request(app)
        .put(`/api/v1/cities/${createdCityId}`)
        .send({
          gps: 'invalid-format'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid GPS');
    });
  });

  describe('DELETE /api/v1/cities/:cityId', () => {
    let cityToDelete: number;

    beforeAll(async () => {
      // Create a city to delete
      const response = await request(app)
        .post('/api/v1/cities')
        .send({
          cityName: 'City To Delete',
          gps: '10.0000,40.0000'
        });
      cityToDelete = response.body.data.cityId;
    });

    it('should soft delete a city (set status to disabled)', async () => {
      const response = await request(app)
        .delete(`/api/v1/cities/${cityToDelete}`);

      expect(response.status).toBe(204);

      // Verify city status is disabled
      const getResponse = await request(app)
        .get(`/api/v1/cities/${cityToDelete}`);

      expect(getResponse.body.data.status).toBe(CityStatus.DISABLED);
    });

    it('should return 404 for non-existent city', async () => {
      const response = await request(app)
        .delete('/api/v1/cities/99999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should prevent deletion of city with active hotels', async () => {
      // First create a hotel for the city
      const hotelResponse = await request(app)
        .post(`/api/v1/cities/${createdCityId}/hotels`)
        .send({
          hotelName: 'Test Hotel',
          address: 'Test Address'
        });

      // Try to delete the city
      const response = await request(app)
        .delete(`/api/v1/cities/${createdCityId}`);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Cannot delete city');
      expect(response.body.message).toContain('active hotel');
    });
  });
});

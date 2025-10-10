import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { CityService } from '../services/CityService';

export class CityController {
  private cityService: CityService;

  constructor(dataSource: DataSource) {
    this.cityService = new CityService(dataSource);
  }

  /**
   * Create a new city
   * POST /api/v1/cities
   */
  async createCity(req: Request, res: Response): Promise<void> {
    try {
      const { cityName, gps } = req.body;

      console.log(`[${new Date().toISOString()}] Creating city: ${cityName} at ${gps}`);

      const city = await this.cityService.createCity(cityName, gps);

      console.log(`[${new Date().toISOString()}] City created successfully: ID ${city.cityId}`);

      res.status(201).json({
        success: true,
        data: city,
        message: 'City created successfully'
      });
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Error creating city:`, error);

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
        error.message.includes('Invalid GPS') ||
        error.message.includes('must not exceed')
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
        message: 'Failed to create city',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Get all cities with pagination
   * GET /api/v1/cities
   */
  async getAllCities(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      console.log(`[${new Date().toISOString()}] Fetching cities: page=${page}, limit=${limit}`);

      const result = await this.cityService.getAllCities(page, limit);

      res.status(200).json({
        success: true,
        data: result.cities,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Error fetching cities:`, error);

      res.status(500).json({
        success: false,
        message: 'Failed to fetch cities',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Get city by ID
   * GET /api/v1/cities/:cityId
   */
  async getCityById(req: Request, res: Response): Promise<void> {
    try {
      const cityId = parseInt(req.params.cityId);

      if (isNaN(cityId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid city ID',
          error: 'BAD_REQUEST'
        });
        return;
      }

      console.log(`[${new Date().toISOString()}] Fetching city: ID ${cityId}`);

      const city = await this.cityService.getCityById(cityId);

      if (!city) {
        res.status(404).json({
          success: false,
          message: 'City not found',
          error: 'NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: city
      });
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Error fetching city:`, error);

      res.status(500).json({
        success: false,
        message: 'Failed to fetch city',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Update city
   * PUT /api/v1/cities/:cityId
   */
  async updateCity(req: Request, res: Response): Promise<void> {
    try {
      const cityId = parseInt(req.params.cityId);
      const updates = req.body;

      if (isNaN(cityId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid city ID',
          error: 'BAD_REQUEST'
        });
        return;
      }

      console.log(`[${new Date().toISOString()}] Updating city: ID ${cityId}`, updates);

      const city = await this.cityService.updateCity(cityId, updates);

      console.log(`[${new Date().toISOString()}] City updated successfully: ID ${cityId}`);

      res.status(200).json({
        success: true,
        data: city,
        message: 'City updated successfully'
      });
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Error updating city:`, error);

      if (error.message === 'City not found') {
        res.status(404).json({
          success: false,
          message: error.message,
          error: 'NOT_FOUND'
        });
        return;
      }

      if (
        error.message.includes('already exists') ||
        error.message.includes('Invalid GPS') ||
        error.message.includes('must not exceed')
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
        message: 'Failed to update city',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Delete city (soft delete)
   * DELETE /api/v1/cities/:cityId
   */
  async deleteCity(req: Request, res: Response): Promise<void> {
    try {
      const cityId = parseInt(req.params.cityId);

      if (isNaN(cityId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid city ID',
          error: 'BAD_REQUEST'
        });
        return;
      }

      console.log(`[${new Date().toISOString()}] Deleting city: ID ${cityId}`);

      await this.cityService.deleteCity(cityId);

      console.log(`[${new Date().toISOString()}] City deleted successfully: ID ${cityId}`);

      res.status(204).send();
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Error deleting city:`, error);

      if (error.message === 'City not found') {
        res.status(404).json({
          success: false,
          message: error.message,
          error: 'NOT_FOUND'
        });
        return;
      }

      if (error.message.includes('Cannot delete city')) {
        res.status(409).json({
          success: false,
          message: error.message,
          error: 'CONFLICT'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete city',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }
}

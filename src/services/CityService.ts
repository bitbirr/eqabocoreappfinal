import { Repository, DataSource } from 'typeorm';
import { City, CityStatus } from '../models/City';
import { Hotel, HotelStatus } from '../models/Hotel';

export class CityService {
  private cityRepository: Repository<City>;
  private hotelRepository: Repository<Hotel>;

  constructor(dataSource: DataSource) {
    this.cityRepository = dataSource.getRepository(City);
    this.hotelRepository = dataSource.getRepository(Hotel);
  }

  /**
   * Validate GPS coordinates format (latitude,longitude)
   */
  validateGPS(gps: string): boolean {
    const gpsPattern = /^-?([0-9]{1,2}|1[0-7][0-9]|180)(\.\d+)?,-?([0-9]{1,2}|1[0-7][0-9]|180)(\.\d+)?$/;
    return gpsPattern.test(gps);
  }

  /**
   * Create a new city
   */
  async createCity(cityName: string, gps: string): Promise<City> {
    // Validate inputs
    if (!cityName || cityName.trim().length === 0) {
      throw new Error('City name is required');
    }

    if (cityName.length > 100) {
      throw new Error('City name must not exceed 100 characters');
    }

    if (!gps || !this.validateGPS(gps)) {
      throw new Error('Invalid GPS format. Expected format: "latitude,longitude" (e.g., "9.0320,38.7469")');
    }

    // Check for duplicate city name
    const existingCity = await this.cityRepository.findOne({
      where: { cityName }
    });

    if (existingCity) {
      throw new Error(`City with name "${cityName}" already exists`);
    }

    // Create city
    const city = this.cityRepository.create({
      cityName,
      gps,
      status: CityStatus.ACTIVE
    });

    return await this.cityRepository.save(city);
  }

  /**
   * Get all cities with pagination
   */
  async getAllCities(page: number = 1, limit: number = 20): Promise<{ cities: City[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [cities, total] = await this.cityRepository.findAndCount({
      order: {
        created_at: 'DESC'
      },
      take: limit,
      skip
    });

    return { cities, total, page, limit };
  }

  /**
   * Get city by ID
   */
  async getCityById(cityId: number): Promise<City | null> {
    const city = await this.cityRepository.findOne({
      where: { cityId },
      relations: ['hotels']
    });

    return city;
  }

  /**
   * Update city
   */
  async updateCity(cityId: number, updates: Partial<City>): Promise<City> {
    const city = await this.cityRepository.findOne({
      where: { cityId }
    });

    if (!city) {
      throw new Error('City not found');
    }

    // Validate city name if being updated
    if (updates.cityName) {
      if (updates.cityName.length > 100) {
        throw new Error('City name must not exceed 100 characters');
      }

      // Check for duplicate city name
      const existingCity = await this.cityRepository.findOne({
        where: { cityName: updates.cityName }
      });

      if (existingCity && existingCity.cityId !== cityId) {
        throw new Error(`City with name "${updates.cityName}" already exists`);
      }
    }

    // Validate GPS if being updated
    if (updates.gps && !this.validateGPS(updates.gps)) {
      throw new Error('Invalid GPS format. Expected format: "latitude,longitude" (e.g., "9.0320,38.7469")');
    }

    // Apply updates
    Object.assign(city, updates);
    city.updated_at = new Date();

    return await this.cityRepository.save(city);
  }

  /**
   * Soft delete city (set status to disabled)
   */
  async deleteCity(cityId: number): Promise<void> {
    const city = await this.cityRepository.findOne({
      where: { cityId }
    });

    if (!city) {
      throw new Error('City not found');
    }

    // Check if city has active hotels
    const activeHotelsCount = await this.hotelRepository.count({
      where: {
        cityId,
        status: HotelStatus.ACTIVE
      }
    });

    if (activeHotelsCount > 0) {
      throw new Error(`Cannot delete city with ${activeHotelsCount} active hotel(s). Please disable all hotels first.`);
    }

    // Soft delete by setting status to disabled
    city.status = CityStatus.DISABLED;
    city.updated_at = new Date();
    await this.cityRepository.save(city);
  }
}

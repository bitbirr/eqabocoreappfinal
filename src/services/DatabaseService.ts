import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User, Hotel, Room, Booking, Payment, PaymentLog } from '../models';

export class DatabaseService {
  private static instance: DatabaseService;

  public userRepository: Repository<User>;
  public hotelRepository: Repository<Hotel>;
  public roomRepository: Repository<Room>;
  public bookingRepository: Repository<Booking>;
  public paymentRepository: Repository<Payment>;
  public paymentLogRepository: Repository<PaymentLog>;

  private constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.hotelRepository = AppDataSource.getRepository(Hotel);
    this.roomRepository = AppDataSource.getRepository(Room);
    this.bookingRepository = AppDataSource.getRepository(Booking);
    this.paymentRepository = AppDataSource.getRepository(Payment);
    this.paymentLogRepository = AppDataSource.getRepository(PaymentLog);
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async isConnected(): Promise<boolean> {
    try {
      return AppDataSource.isInitialized;
    } catch (error) {
      return false;
    }
  }

  public async healthCheck(): Promise<{ status: string; timestamp: Date }> {
    try {
      await AppDataSource.query('SELECT 1');
      return {
        status: 'healthy',
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Database health check failed: ${error}`);
    }
  }
}
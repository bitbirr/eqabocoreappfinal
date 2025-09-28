import { DataSource } from 'typeorm';
import { entities } from '../models';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'eqabobackend',
  synchronize: process.env.NODE_ENV === 'development', // Only in development
  logging: process.env.NODE_ENV === 'development',
  entities: entities,
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('Database config:', {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS ? '***' : 'undefined',
      database: process.env.DB_NAME || 'eqabobackend'
    });
    await AppDataSource.initialize();
    console.log('Database connection established successfully');
    
    // Run migrations in production
    if (process.env.NODE_ENV === 'production') {
      await AppDataSource.runMigrations();
      console.log('Migrations executed successfully');
    }
  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.destroy();
    console.log('Database connection closed successfully');
  } catch (error) {
    console.error('Error during database closure:', error);
    throw error;
  }
};
import { DataSource } from 'typeorm';
import { entities } from '../models';
import * as dotenv from 'dotenv';

dotenv.config();

const interpretTruthy = (value: string | undefined) => {
  if (!value) return false;
  return ['1', 'true', 'yes', 'require'].includes(value.toLowerCase());
};

const shouldUseSSL = (value: string | undefined) => {
  if (!value) return false;
  return ['1', 'true', 'require'].includes(value.toLowerCase());
};

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'eqabobackend',
  synchronize: interpretTruthy(process.env.TYPEORM_SYNC),
  logging: process.env.NODE_ENV === 'development',
  entities: entities,
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
  ssl: shouldUseSSL(process.env.DB_SSL || process.env.PGSSLMODE) ? { rejectUnauthorized: false } : false,
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
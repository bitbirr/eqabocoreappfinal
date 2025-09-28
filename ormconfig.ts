import { DataSource } from 'typeorm';
import { entities } from './src/models';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.dev' });

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'eqabobackend',
  entities: entities,
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: true,
});
import { DataSource } from 'typeorm';
import { entities } from './src/models';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.dev' });

const interpretTruthy = (value: string | undefined) => {
  if (!value) return false;
  return ['1', 'true', 'yes', 'require'].includes(value.toLowerCase());
};

const shouldUseSSL = (value: string | undefined) => {
  if (!value) return false;
  return ['1', 'true', 'require'].includes(value.toLowerCase());
};

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
  synchronize: interpretTruthy(process.env.TYPEORM_SYNC),
  logging: true,
  ssl: shouldUseSSL(process.env.DB_SSL || process.env.PGSSLMODE) ? { rejectUnauthorized: false } : false,
});
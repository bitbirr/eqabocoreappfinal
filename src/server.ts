import 'reflect-metadata';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { createApp, appConfig } from './app';
import { entities } from './models';

// Load environment variables
dotenv.config();

/**
 * Database configuration
 */
// Normalize env var names between server and CLI/seeders
const DB_USER = process.env.DB_USER || process.env.DB_USERNAME || 'postgres';
const DB_PASS = process.env.DB_PASS || process.env.DB_PASSWORD || 'password';
const DB_SSL = (process.env.DB_SSL || process.env.PGSSLMODE || '').toLowerCase();
const useSSL = ['1', 'true', 'require'].includes(DB_SSL) || process.env.NODE_ENV === 'production';

// Detect whether we're running compiled JS (dist) or TS (ts-node)
const runningTs = __filename.endsWith('.ts');

const interpretTruthy = (value: string | undefined) => {
  if (!value) return false;
  return ['1', 'true', 'yes', 'require'].includes(value.toLowerCase());
};

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: DB_USER,
  password: DB_PASS,
  database: process.env.DB_NAME || 'eqabo_hotel_booking',
  entities: entities,
  // Use JS migrations when running compiled code, TS migrations when using ts-node
  migrations: runningTs ? ['src/migrations/*.ts'] : ['dist/migrations/*.js'],
  migrationsTableName: 'migrations',
  // Avoid destructive schema sync; prefer migrations. Enable only if TYPEORM_SYNC=true is explicitly set.
  synchronize: interpretTruthy(process.env.TYPEORM_SYNC),
  logging: process.env.NODE_ENV === 'development',
  ssl: useSSL ? { rejectUnauthorized: false } : false
});

/**
 * Start the server
 */
async function startServer() {
  try {
    // Initialize database connection
    console.log('🔄 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Database connected successfully');

    // Optionally run migrations in production if enabled
    const runMigrations = ['1', 'true', 'yes'].includes((process.env.RUN_MIGRATIONS || '').toLowerCase());
    if (runMigrations) {
      console.log('📦 Running database migrations...');
      try {
        const migrations = await dataSource.runMigrations();
        console.log(`✅ Migrations complete (${migrations.length} applied)`);
      } catch (mErr) {
        console.error('❌ Migration error:', mErr);
        // Fail fast in production if migrations are requested and fail
        if (process.env.NODE_ENV === 'production') {
          process.exit(1);
        }
      }
    }

    // Create Express app
    const app = createApp(dataSource);

    // Start server
    const port = appConfig.port;
    app.listen(port, () => {
      console.log(`🚀 ${appConfig.name} v${appConfig.version} is running on port ${port}`);
      console.log(`📖 API Documentation: /api-docs`);
      console.log(`❤️  Health Check: /api/health`);
      console.log(`🔐 Authentication endpoints:`);
      console.log(`   📝 Register: POST /api/auth/register`);
      console.log(`   🔑 Login: POST /api/auth/login`);
      console.log(`   👤 Profile: GET /api/auth/me`);
      console.log(`   🛡️  Admin: GET /api/auth/admin-only`);
      console.log(`   🏨 Hotel Owner: GET /api/auth/hotel-owner-only`);
      console.log(`\n🔧 Environment: ${appConfig.environment}`);
      console.log(`🔒 Security features enabled: ${Object.entries(appConfig.features).filter(([, enabled]) => enabled).map(([feature]) => feature).join(', ')}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  try {
    await dataSource.destroy();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Received SIGTERM, shutting down gracefully...');
  try {
    await dataSource.destroy();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Start the server
if (require.main === module) {
  startServer();
}

export { dataSource, startServer };
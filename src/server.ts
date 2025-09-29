import 'reflect-metadata';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { createApp, appConfig } from './app';
import { entities } from './models';
// @ts-ignore
import { expirePendingBookingsJob } from './jobs/expirePending';

// Load environment variables
dotenv.config();

/**
 * Database configuration
 */
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'eqabo_hotel_booking',
  entities: entities,
  synchronize: process.env.NODE_ENV === 'development', // Only in development
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
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

    // Create Express app
    const app = createApp(dataSource);

    // Start scheduled jobs
    console.log('🕐 Starting scheduled jobs...');
    expirePendingBookingsJob.start(dataSource);
    console.log('✅ Scheduled jobs started successfully');

    // Start server
    const port = appConfig.port;
    app.listen(port, () => {
      console.log(`🚀 ${appConfig.name} v${appConfig.version} is running on port ${port}`);
      console.log(`📖 API Documentation: http://localhost:${port}/api/docs`);
      console.log(`❤️  Health Check: http://localhost:${port}/api/health`);
      console.log(`🔐 Authentication endpoints:`);
      console.log(`   📝 Register: POST http://localhost:${port}/api/auth/register`);
      console.log(`   🔑 Login: POST http://localhost:${port}/api/auth/login`);
      console.log(`   👤 Profile: GET http://localhost:${port}/api/auth/me`);
      console.log(`   🛡️  Admin: GET http://localhost:${port}/api/auth/admin-only`);
      console.log(`   🏨 Hotel Owner: GET http://localhost:${port}/api/auth/hotel-owner-only`);
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
    // Stop scheduled jobs
    console.log('🛑 Stopping scheduled jobs...');
    expirePendingBookingsJob.stop();
    
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
    // Stop scheduled jobs
    console.log('🛑 Stopping scheduled jobs...');
    expirePendingBookingsJob.stop();
    
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
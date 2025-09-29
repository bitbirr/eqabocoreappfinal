"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSource = void 0;
exports.startServer = startServer;
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
const typeorm_1 = require("typeorm");
const app_1 = require("./app");
const models_1 = require("./models");
// @ts-ignore
const expirePending_1 = require("./jobs/expirePending");
// Load environment variables
dotenv_1.default.config();
/**
 * Database configuration
 */
const dataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'eqabo_hotel_booking',
    entities: models_1.entities,
    synchronize: process.env.NODE_ENV === 'development', // Only in development
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
exports.dataSource = dataSource;
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
        const app = (0, app_1.createApp)(dataSource);
        // Start scheduled jobs
        console.log('🕐 Starting scheduled jobs...');
        expirePending_1.expirePendingBookingsJob.start(dataSource);
        console.log('✅ Scheduled jobs started successfully');
        // Start server
        const port = app_1.appConfig.port;
        app.listen(port, () => {
            console.log(`🚀 ${app_1.appConfig.name} v${app_1.appConfig.version} is running on port ${port}`);
            console.log(`📖 API Documentation: http://localhost:${port}/api/docs`);
            console.log(`❤️  Health Check: http://localhost:${port}/api/health`);
            console.log(`🔐 Authentication endpoints:`);
            console.log(`   📝 Register: POST http://localhost:${port}/api/auth/register`);
            console.log(`   🔑 Login: POST http://localhost:${port}/api/auth/login`);
            console.log(`   👤 Profile: GET http://localhost:${port}/api/auth/me`);
            console.log(`   🛡️  Admin: GET http://localhost:${port}/api/auth/admin-only`);
            console.log(`   🏨 Hotel Owner: GET http://localhost:${port}/api/auth/hotel-owner-only`);
            console.log(`\n🔧 Environment: ${app_1.appConfig.environment}`);
            console.log(`🔒 Security features enabled: ${Object.entries(app_1.appConfig.features).filter(([, enabled]) => enabled).map(([feature]) => feature).join(', ')}`);
        });
    }
    catch (error) {
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
        expirePending_1.expirePendingBookingsJob.stop();
        await dataSource.destroy();
        console.log('✅ Database connection closed');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});
process.on('SIGTERM', async () => {
    console.log('\n🔄 Received SIGTERM, shutting down gracefully...');
    try {
        // Stop scheduled jobs
        console.log('🛑 Stopping scheduled jobs...');
        expirePending_1.expirePendingBookingsJob.stop();
        await dataSource.destroy();
        console.log('✅ Database connection closed');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});
// Start the server
if (require.main === module) {
    startServer();
}

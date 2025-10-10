#!/usr/bin/env ts-node

import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { AppDataSource } from '../config/database';
import { DatabaseSeeder } from './DatabaseSeeder';
import { CityHotelRoomSeeder } from './CityHotelRoomSeeder';

// Load environment variables
dotenv.config({ path: '.env.dev' });

async function runSeeding() {
  console.log('🚀 Starting Eqabo Database Seeding Process...');
  console.log('=====================================');

  try {
    // Initialize database connection
    console.log('📡 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');

    // Get seeder instances
    const seeder = DatabaseSeeder.getInstance();
    const citySeeder = CityHotelRoomSeeder.getInstance();

    // Check command line arguments
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case 'users':
        await seeder.seedUsersOnly();
        break;
      case 'hotels':
        await seeder.seedHotelsOnly();
        break;
      case 'cities':
        await citySeeder.seedAll();
        const citySummary = await citySeeder.getSeededDataSummary();
        console.log('');
        console.log('📊 City-Hotel-Room Summary:');
        console.log('===========================');
        console.log(`🏙️  Cities: ${citySummary.cities}`);
        console.log(`🏨 Hotels: ${citySummary.hotels}`);
        console.log(`🛏️ Rooms: ${citySummary.rooms}`);
        console.log(`📈 Total Records: ${citySummary.total}`);
        break;
      case 'summary':
        const summary = await seeder.getSeededDataSummary();
        const citiesSummary = await citySeeder.getSeededDataSummary();
        console.log('📊 Current Database Summary:');
        console.log('============================');
        console.log('Legacy Data:');
        console.log(`👥 Users: ${summary.users}`);
        console.log(`🏨 Hotels: ${summary.hotels}`);
        console.log(`🛏️ Rooms: ${summary.rooms}`);
        console.log(`📅 Bookings: ${summary.bookings}`);
        console.log(`💳 Payments: ${summary.payments}`);
        console.log(`📋 Payment Logs: ${summary.paymentLogs}`);
        console.log(`📈 Total Legacy Records: ${summary.total}`);
        console.log('');
        console.log('City-Hotel-Room Data:');
        console.log(`🏙️  Cities: ${citiesSummary.cities}`);
        console.log(`🏨 Hotels: ${citiesSummary.hotels}`);
        console.log(`🛏️ Rooms: ${citiesSummary.rooms}`);
        console.log(`📈 Total City Records: ${citiesSummary.total}`);
        break;
      case 'all':
      default:
        await seeder.seedAll();
        
        // Show summary after seeding
        const finalSummary = await seeder.getSeededDataSummary();
        console.log('');
        console.log('📊 Final Database Summary:');
        console.log('==========================');
        console.log(`👥 Users: ${finalSummary.users}`);
        console.log(`🏨 Hotels: ${finalSummary.hotels}`);
        console.log(`🛏️ Rooms: ${finalSummary.rooms}`);
        console.log(`📅 Bookings: ${finalSummary.bookings}`);
        console.log(`💳 Payments: ${finalSummary.payments}`);
        console.log(`📋 Payment Logs: ${finalSummary.paymentLogs}`);
        console.log(`📈 Total Records: ${finalSummary.total}`);
        break;
    }

    console.log('');
    console.log('🎉 Seeding process completed successfully!');

  } catch (error) {
    console.error('❌ Error during seeding process:', error);
    process.exit(1);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('📡 Database connection closed');
    }
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run the seeding process
if (require.main === module) {
  runSeeding();
}
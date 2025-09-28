#!/usr/bin/env ts-node

import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { AppDataSource } from '../config/database';
import { DatabaseSeeder } from './DatabaseSeeder';

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

    // Get seeder instance
    const seeder = DatabaseSeeder.getInstance();

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
      case 'summary':
        const summary = await seeder.getSeededDataSummary();
        console.log('📊 Current Database Summary:');
        console.log('============================');
        console.log(`👥 Users: ${summary.users}`);
        console.log(`🏨 Hotels: ${summary.hotels}`);
        console.log(`🛏️ Rooms: ${summary.rooms}`);
        console.log(`📅 Bookings: ${summary.bookings}`);
        console.log(`💳 Payments: ${summary.payments}`);
        console.log(`📋 Payment Logs: ${summary.paymentLogs}`);
        console.log(`📈 Total Records: ${summary.total}`);
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
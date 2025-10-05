#!/usr/bin/env ts-node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv = __importStar(require("dotenv"));
const database_1 = require("../config/database");
const DatabaseSeeder_1 = require("./DatabaseSeeder");
// Load environment variables
dotenv.config({ path: '.env.dev' });
async function runSeeding() {
    console.log('🚀 Starting Eqabo Database Seeding Process...');
    console.log('=====================================');
    try {
        // Initialize database connection
        console.log('📡 Connecting to database...');
        await database_1.AppDataSource.initialize();
        console.log('✅ Database connected successfully');
        // Get seeder instance
        const seeder = DatabaseSeeder_1.DatabaseSeeder.getInstance();
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
    }
    catch (error) {
        console.error('❌ Error during seeding process:', error);
        process.exit(1);
    }
    finally {
        // Close database connection
        if (database_1.AppDataSource.isInitialized) {
            await database_1.AppDataSource.destroy();
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

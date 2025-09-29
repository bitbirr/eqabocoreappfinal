"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const database_1 = require("../config/database");
const models_1 = require("../models");
class DatabaseService {
    constructor() {
        this.userRepository = database_1.AppDataSource.getRepository(models_1.User);
        this.hotelRepository = database_1.AppDataSource.getRepository(models_1.Hotel);
        this.roomRepository = database_1.AppDataSource.getRepository(models_1.Room);
        this.bookingRepository = database_1.AppDataSource.getRepository(models_1.Booking);
        this.paymentRepository = database_1.AppDataSource.getRepository(models_1.Payment);
        this.paymentLogRepository = database_1.AppDataSource.getRepository(models_1.PaymentLog);
    }
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    async isConnected() {
        try {
            return database_1.AppDataSource.isInitialized;
        }
        catch (error) {
            return false;
        }
    }
    async healthCheck() {
        try {
            await database_1.AppDataSource.query('SELECT 1');
            return {
                status: 'healthy',
                timestamp: new Date()
            };
        }
        catch (error) {
            throw new Error(`Database health check failed: ${error}`);
        }
    }
}
exports.DatabaseService = DatabaseService;

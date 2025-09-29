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
exports.closeDatabase = exports.initializeDatabase = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const models_1 = require("../models");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'password',
    database: process.env.DB_NAME || 'eqabobackend',
    synchronize: process.env.NODE_ENV === 'development', // Only in development
    logging: process.env.NODE_ENV === 'development',
    entities: models_1.entities,
    migrations: ['src/migrations/*.ts'],
    migrationsTableName: 'migrations',
    ssl: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test' ? { rejectUnauthorized: false } : false,
});
const initializeDatabase = async () => {
    try {
        console.log('Database config:', {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASS ? '***' : 'undefined',
            database: process.env.DB_NAME || 'eqabobackend'
        });
        await exports.AppDataSource.initialize();
        console.log('Database connection established successfully');
        // Run migrations in production
        if (process.env.NODE_ENV === 'production') {
            await exports.AppDataSource.runMigrations();
            console.log('Migrations executed successfully');
        }
    }
    catch (error) {
        console.error('Error during database initialization:', error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
const closeDatabase = async () => {
    try {
        await exports.AppDataSource.destroy();
        console.log('Database connection closed successfully');
    }
    catch (error) {
        console.error('Error during database closure:', error);
        throw error;
    }
};
exports.closeDatabase = closeDatabase;

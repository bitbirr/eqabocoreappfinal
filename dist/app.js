"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const User_1 = require("./models/User");
const routes_1 = require("./routes");
const swagger_1 = require("./config/swagger");
/**
 * Create and configure Express application with authentication
 */
function createApp(dataSource) {
    const app = (0, express_1.default)();
    // Middleware
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true }));
    // CORS middleware (configure as needed for your frontend)
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
        }
        else {
            next();
        }
    });
    // Request logging middleware
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
    // Get User repository
    const userRepository = dataSource.getRepository(User_1.User);
    // Swagger UI Documentation
    app.use('/api/docs', swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.specs, swagger_1.swaggerUiOptions));
    // Routes
    app.use('/api', (0, routes_1.createMainRouter)(userRepository, dataSource));
    // Root endpoint
    app.get('/', (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Welcome to Eqabo Hotel Booking API',
            version: '1.0.0',
            documentation: '/api/docs',
            health: '/api/health',
            authentication: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                profile: 'GET /api/auth/me'
            }
        });
    });
    // Global error handler
    app.use((error, req, res, next) => {
        console.error('Global error handler:', error);
        res.status(error.status || 500).json({
            success: false,
            error: error.message || 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    });
    return app;
}
/**
 * Application configuration
 */
exports.appConfig = {
    name: 'Eqabo Hotel Booking API',
    version: '1.0.0',
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    features: {
        authentication: true,
        roleBasedAccess: true,
        phoneValidation: true,
        jwtTokens: true,
        passwordHashing: true,
        rateLimiting: true
    },
    security: {
        jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
        bcryptSaltRounds: 12,
        rateLimitWindow: 15 * 60 * 1000, // 15 minutes
        maxAuthAttempts: 5
    },
    validation: {
        phoneFormat: 'Ethiopian (+251XXXXXXXXX)',
        passwordMinLength: 8,
        requiredPasswordComplexity: true
    }
};

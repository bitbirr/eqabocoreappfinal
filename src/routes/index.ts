import { Router } from 'express';
import { Repository, DataSource } from 'typeorm';
import { User } from '../models/User';
import { createAuthRoutes } from './authRoutes';
import { createUserRoutes } from './userRoutes';
import { createHotelRoutes } from './hotelRoutes';
import { createBookingRoutes } from './bookingRoutes';
import { createPaymentRoutes } from './paymentRoutes';

/**
 * Main router that combines all application routes
 */
export function createMainRouter(userRepository: Repository<User>, dataSource: DataSource): Router {
  const router = Router();

  // Authentication routes
  router.use('/auth', createAuthRoutes(userRepository));

  // User routes
  router.use('/users', createUserRoutes(userRepository));

  // Hotel booking workflow routes
  router.use('/hotels', createHotelRoutes(dataSource));
  router.use('/bookings', createBookingRoutes(dataSource));
  router.use('/payments', createPaymentRoutes(dataSource));

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'API is healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  // API documentation endpoint
  router.get('/docs', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Eqabo Hotel Booking API Documentation',
      version: '1.0.0',
      endpoints: {
        authentication: {
          basePath: '/api/auth',
          endpoints: [
            'POST /register - Register new user (admin/hotel_owner)',
            'POST /login - Login with phone and password',
            'GET /me - Get current user profile (protected)',
            'POST /refresh - Refresh JWT token (protected)',
            'POST /logout - Logout user (protected)',
            'GET /validate - Validate JWT token (protected)',
            'GET /admin-only - Admin-only access (protected)',
            'GET /hotel-owner-only - Hotel owner-only access (protected)'
          ]
        },
        hotels: {
          basePath: '/api/hotels',
          endpoints: [
            'GET /?city=Addis - Search hotels by city',
            'GET /:id/rooms?checkin=2025-10-01&checkout=2025-10-03 - Get available rooms'
          ]
        },
        bookings: {
          basePath: '/api/bookings',
          endpoints: [
            'POST / - Create new booking (userName, phone, hotelId, roomId, checkIn, checkOut)',
            'GET /:id - Get booking details'
          ]
        },
        payments: {
          basePath: '/api/payments',
          endpoints: [
            'POST /initiate - Initiate payment (bookingId, provider)',
            'POST /callback - Payment provider callback',
            'GET /:id - Get payment status'
          ]
        },
        general: {
          basePath: '/api',
          endpoints: [
            'GET /health - API health check',
            'GET /docs - API documentation'
          ]
        }
      },
      authentication: {
        type: 'Bearer Token (JWT)',
        header: 'Authorization: Bearer <token>',
        tokenExpiry: '7 days',
        supportedRoles: ['admin', 'hotel_owner']
      },
      phoneFormat: {
        description: 'Ethiopian phone number format',
        examples: [
          '+251927802065',
          '251927802065',
          '0927802065'
        ],
        note: 'All formats are normalized to +251XXXXXXXXX'
      }
    });
  });

  // 404 handler for undefined routes
  router.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
      message: `The requested route ${req.method} ${req.originalUrl} does not exist`,
      availableRoutes: [
        'GET /api/health',
        'GET /api/docs',
        'POST /api/auth/register',
        'POST /api/auth/login',
        'GET /api/auth/me',
        'POST /api/auth/refresh',
        'POST /api/auth/logout',
        'GET /api/auth/validate',
        'GET /api/auth/admin-only',
        'GET /api/auth/hotel-owner-only',
        'GET /api/hotels?city=Addis',
        'GET /api/hotels/:id/rooms?checkin=2025-10-01&checkout=2025-10-03',
        'POST /api/bookings',
        'GET /api/bookings/:id',
        'POST /api/payments/initiate',
        'POST /api/payments/callback',
        'GET /api/payments/:id'
      ]
    });
  });

  return router;
}

/**
 * Route configuration for the entire application
 */
export const routeConfig = {
  apiVersion: '1.0.0',
  basePath: '/api',
  authentication: {
    type: 'JWT',
    header: 'Authorization',
    format: 'Bearer <token>',
    expiry: '7 days'
  },
  rateLimit: {
    authEndpoints: {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000 // 15 minutes
    }
  },
  validation: {
    phoneFormat: 'Ethiopian (+251XXXXXXXXX)',
    passwordRequirements: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true
    }
  },
  supportedRoles: ['admin', 'hotel_owner'],
  endpoints: {
    public: [
      'GET /api/health',
      'GET /api/docs',
      'POST /api/auth/register',
      'POST /api/auth/login'
    ],
    protected: [
      'GET /api/auth/me',
      'POST /api/auth/refresh',
      'POST /api/auth/logout',
      'GET /api/auth/validate'
    ],
    adminOnly: [
      'GET /api/auth/admin-only'
    ],
    hotelOwnerOnly: [
      'GET /api/auth/hotel-owner-only'
    ]
  }
};
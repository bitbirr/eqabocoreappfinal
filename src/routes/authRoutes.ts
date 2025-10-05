import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/AuthService';
import { 
  authenticateToken, 
  requireAdmin, 
  requireHotelOwner,
  authRateLimit,
  validateRequestBody
} from '../middlewares/authMiddleware';
import { Repository } from 'typeorm';
import { User } from '../models/User';

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - first_name
 *         - last_name
 *         - phone
 *         - password
 *       properties:
 *         first_name:
 *           type: string
 *           example: "John"
 *         last_name:
 *           type: string
 *           example: "Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *         phone:
 *           type: string
 *           example: "+251927802065"
 *         password:
 *           type: string
 *           minLength: 8
 *           example: "SecurePass123"
 *         role:
 *           type: string
 *           enum: [admin, hotel_owner]
 *           example: "hotel_owner"
 *     LoginRequest:
 *       type: object
 *       required:
 *         - phone
 *         - password
 *       properties:
 *         phone:
 *           type: string
 *           example: "+251927802065"
 *         password:
 *           type: string
 *           example: "SecurePass123"
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Authentication successful"
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             token:
 *               type: string
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             expiresIn:
 *               type: string
 *               example: "7d"
 */

/**
 * Create authentication routes
 */
export function createAuthRoutes(userRepository: Repository<User>): Router {
  const router = Router();
  const authService = new AuthService(userRepository);
  const authController = new AuthController(authService);

  // Apply rate limiting to authentication endpoints
  const rateLimiter = authRateLimit();

  // Public routes (no authentication required)
  
  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     tags: [Authentication]
   *     summary: Register a new user
   *     description: Create a new user account with admin or hotel_owner role
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterRequest'
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Validation error or user already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       429:
   *         description: Too many requests (rate limit exceeded)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/register', 
    rateLimiter,
    validateRequestBody(['first_name', 'last_name', 'phone', 'password']),
    authController.register
  );

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     tags: [Authentication]
   *     summary: User login
   *     description: Authenticate user with phone and password
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       401:
   *         description: Invalid credentials
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       429:
   *         description: Too many requests (rate limit exceeded)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/login', 
    rateLimiter,
    validateRequestBody(['phone', 'password']),
    authController.login
  );

  // Protected routes (authentication required)
  const authMiddleware = authenticateToken(authService);

  /**
   * @swagger
   * /api/auth/me:
   *   get:
   *     tags: [Authentication]
   *     summary: Get current user profile
   *     description: Retrieve the profile information of the authenticated user
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *       401:
   *         description: Unauthorized - Invalid or missing token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/me', 
    authMiddleware,
    authController.getProfile
  );

  /**
   * @swagger
   * /api/auth/refresh:
   *   post:
   *     tags: [Authentication]
   *     summary: Refresh JWT token
   *     description: Generate a new JWT token for the authenticated user
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       401:
   *         description: Unauthorized - Invalid or missing token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/refresh', 
    authMiddleware,
    authController.refreshToken
  );

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     tags: [Authentication]
   *     summary: User logout
   *     description: Logout user (client-side token removal recommended)
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Logout successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Logout successful"
   *       401:
   *         description: Unauthorized - Invalid or missing token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/logout', 
    authMiddleware,
    authController.logout
  );

  /**
   * @swagger
   * /api/auth/validate:
   *   get:
   *     tags: [Authentication]
   *     summary: Validate JWT token
   *     description: Check if the provided JWT token is valid
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Token is valid
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Token is valid"
   *                 data:
   *                   type: object
   *                   properties:
   *                     valid:
   *                       type: boolean
   *                       example: true
   *                     user:
   *                       $ref: '#/components/schemas/User'
   *       401:
   *         description: Unauthorized - Invalid or missing token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/validate', 
    authMiddleware,
    authController.validateToken
  );

  // Role-based protected routes
  
  /**
   * @swagger
   * /api/auth/admin-only:
   *   get:
   *     tags: [Authentication]
   *     summary: Admin-only endpoint
   *     description: Example endpoint that requires admin role
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Admin access granted
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Admin access granted"
   *                 data:
   *                   type: object
   *                   properties:
   *                     role:
   *                       type: string
   *                       example: "admin"
   *                     access_level:
   *                       type: string
   *                       example: "full"
   *       401:
   *         description: Unauthorized - Invalid or missing token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - Admin role required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/admin-only', 
    authMiddleware,
    requireAdmin,
    authController.adminOnly
  );

  /**
   * @swagger
   * /api/auth/hotel-owner-only:
   *   get:
   *     tags: [Authentication]
   *     summary: Hotel owner-only endpoint
   *     description: Example endpoint that requires hotel_owner role
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Hotel owner access granted
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Hotel owner access granted"
   *                 data:
   *                   type: object
   *                   properties:
   *                     role:
   *                       type: string
   *                       example: "hotel_owner"
   *                     access_level:
   *                       type: string
   *                       example: "hotel_management"
   *       401:
   *         description: Unauthorized - Invalid or missing token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - Hotel owner role required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/hotel-owner-only', 
    authMiddleware,
    requireHotelOwner,
    authController.hotelOwnerOnly
  );

  /**
   * @swagger
   * /api/auth/firebase:
   *   post:
   *     tags: [Authentication]
   *     summary: Get Firebase custom token
   *     description: Generate a Firebase custom token with role claims for the authenticated user
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Firebase token generated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Firebase custom token generated successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     customToken:
   *                       type: string
   *                       example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
   *                     userId:
   *                       type: string
   *                       example: "uuid-here"
   *                     role:
   *                       type: string
   *                       example: "customer"
   *                     expiresIn:
   *                       type: string
   *                       example: "1h"
   *       401:
   *         description: Unauthorized - Invalid or missing token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       503:
   *         description: Firebase service unavailable
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/firebase', 
    authMiddleware,
    authController.getFirebaseToken
  );

  return router;
}

/**
 * Authentication routes configuration
 */
export const authRoutesConfig = {
  basePath: '/api/auth',
  routes: [
    {
      method: 'POST',
      path: '/register',
      description: 'Register a new user (admin or hotel_owner)',
      public: true,
      rateLimit: true,
      validation: ['first_name', 'last_name', 'phone', 'password']
    },
    {
      method: 'POST',
      path: '/login',
      description: 'Login with phone and password',
      public: true,
      rateLimit: true,
      validation: ['phone', 'password']
    },
    {
      method: 'GET',
      path: '/me',
      description: 'Get current user profile',
      protected: true,
      roles: ['any']
    },
    {
      method: 'POST',
      path: '/refresh',
      description: 'Refresh JWT token',
      protected: true,
      roles: ['any']
    },
    {
      method: 'POST',
      path: '/logout',
      description: 'Logout user (client-side token removal)',
      protected: true,
      roles: ['any']
    },
    {
      method: 'GET',
      path: '/validate',
      description: 'Validate JWT token',
      protected: true,
      roles: ['any']
    },
    {
      method: 'GET',
      path: '/admin-only',
      description: 'Admin-only access example',
      protected: true,
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/hotel-owner-only',
      description: 'Hotel owner-only access example',
      protected: true,
      roles: ['hotel_owner']
    }
  ]
};
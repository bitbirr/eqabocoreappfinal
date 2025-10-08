import { Request, Response } from 'express';
import { AuthService, RegisterRequest, LoginRequest } from '../services/AuthService';
import { UserRole } from '../models/User';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { FirebaseService } from '../services/FirebaseService';

export class AuthController {
  private authService: AuthService;
  private firebaseService: FirebaseService;

  constructor(authService: AuthService) {
    this.authService = authService;
    this.firebaseService = new FirebaseService();
  }

  /**
   * Register a new user
   * POST /api/auth/register
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { first_name, last_name, phone, password, role } = req.body;

      // Validate password strength
      const passwordValidation = this.authService.validatePassword(password);
      if (!passwordValidation.isValid) {
        res.status(400).json({
          success: false,
          error: passwordValidation.error
        });
        return;
      }

      // Validate role (only allow admin and hotel_owner for this MVP)
      if (role && ![UserRole.ADMIN, UserRole.HOTEL_OWNER].includes(role)) {
        res.status(400).json({
          success: false,
          error: 'Invalid role. Only admin and hotel_owner roles are allowed'
        });
        return;
      }

      const registerData: RegisterRequest = {
        first_name,
        last_name,
        phone,
        password,
        role: role || UserRole.HOTEL_OWNER // Default to hotel_owner if not specified
      };

      const result = await this.authService.register(registerData);

      if (result.success) {
        res.status(201).json({
          success: true,
          message: 'User registered successfully',
          data: {
            token: result.token,
            user: result.user
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Registration controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * Login user
   * POST /api/auth/login
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { phone, password } = req.body;

      const loginData: LoginRequest = { phone, password };
      const result = await this.authService.login(loginData);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Login successful',
          data: {
            token: result.token,
            user: result.user
          }
        });
      } else {
        res.status(401).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Login controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * Get user profile
   * GET /api/auth/me
   */
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const user = await this.authService.getUserById(req.user.id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user
        }
      });
    } catch (error) {
      console.error('Get profile controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * Refresh JWT token
   * POST /api/auth/refresh
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // Get fresh user data
      const user = await this.authService.getUserById(req.user.id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      // Generate new token with fresh data
      const newToken = (this.authService as any).generateToken({
        id: user.id,
        phone: user.phone,
        role: user.role
      });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: newToken,
          user
        }
      });
    } catch (error) {
      console.error('Refresh token controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * Logout user (client-side token removal)
   * POST /api/auth/logout
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // In a JWT-based system, logout is typically handled client-side
      // by removing the token from storage
      res.status(200).json({
        success: true,
        message: 'Logout successful',
        data: {
          user_id: req.user.id
        }
      });
    } catch (error) {
      console.error('Logout controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * Validate JWT token
   * GET /api/auth/validate
   */
  validateToken = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // If we reach here, the token is valid (middleware already verified it)
      res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: {
          user: {
            id: req.user.id,
            phone: req.user.phone,
            role: req.user.role
          }
        }
      });
    } catch (error) {
      console.error('Validate token controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * Admin-only endpoint example
   * GET /api/auth/admin-only
   */
  adminOnly = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Admin access granted',
        data: {
          user: req.user,
          adminFeatures: [
            'User management',
            'System configuration',
            'Analytics dashboard',
            'Hotel approval'
          ]
        }
      });
    } catch (error) {
      console.error('Admin-only controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * Hotel owner-only endpoint example
   * GET /api/auth/hotel-owner-only
   */
  hotelOwnerOnly = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Hotel owner access granted',
        data: {
          user: req.user,
          ownerFeatures: [
            'Hotel management',
            'Room management',
            'Booking management',
            'Revenue analytics'
          ]
        }
      });
    } catch (error) {
      console.error('Hotel owner-only controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * Generate Firebase custom token with role claims
   * POST /api/auth/firebase
   */
  getFirebaseToken = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        console.error('Firebase token request failed: No authenticated user');
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Authentication required'
        });
        return;
      }

      // Validate user data
      if (!req.user.id || !req.user.role) {
        console.error('Firebase token request failed: Invalid user data', {
          hasId: !!req.user.id,
          hasRole: !!req.user.role
        });
        res.status(400).json({
          success: false,
          error: 'Invalid user data',
          message: 'User ID and role are required'
        });
        return;
      }

      // Check if Firebase is initialized
      if (!this.firebaseService.isInitialized()) {
        console.error('Firebase token request failed: Firebase service not initialized');
        res.status(503).json({
          success: false,
          error: 'Firebase service is not available',
          message: 'Firebase service is not available. Please contact support.'
        });
        return;
      }

      console.log(`Generating Firebase custom token for user ${req.user.id} with role ${req.user.role}`);

      // Create custom token with role claims
      const customToken = await this.firebaseService.createCustomToken(
        req.user.id,
        req.user.role
      );

      // Validate that the token was actually generated
      if (!customToken || typeof customToken !== 'string' || customToken.trim() === '') {
        console.error('Firebase token generation failed: Token is null or empty', {
          userId: req.user.id,
          tokenType: typeof customToken,
          tokenLength: customToken ? customToken.length : 0
        });
        res.status(500).json({
          success: false,
          error: 'Failed to generate Firebase token',
          message: 'Firebase token generation returned an invalid token'
        });
        return;
      }

      console.log(`Firebase custom token generated successfully for user ${req.user.id}, token length: ${customToken.length}`);

      res.status(200).json({
        success: true,
        message: 'Firebase custom token generated successfully',
        data: {
          customToken,
          userId: req.user.id,
          role: req.user.role,
          expiresIn: '1h'
        }
      });
    } catch (error) {
      console.error('Firebase token generation error:', error);
      
      // Log detailed error information
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }

      res.status(500).json({
        success: false,
        error: 'Failed to generate Firebase token',
        message: error instanceof Error ? error.message : 'Internal server error while generating Firebase token'
      });
    }
  };

  /**
   * Update user FCM token
   * POST /api/users/fcm-token
   */
  updateFcmToken = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // Support both camelCase (fcmToken) and snake_case (fcm_token) field names
      const fcmToken = req.body.fcmToken || req.body.fcm_token;

      if (!fcmToken) {
        console.error('FCM token validation failed. Request body:', JSON.stringify(req.body));
        res.status(400).json({
          success: false,
          error: 'FCM token is required',
          message: 'Please provide either "fcmToken" or "fcm_token" field in the request body'
        });
        return;
      }

      // Update user's FCM token
      const updated = await this.authService.updateFcmToken(req.user.id, fcmToken);

      if (!updated) {
        res.status(500).json({
          success: false,
          error: 'Failed to update FCM token'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'FCM token updated successfully',
        data: {
          userId: req.user.id
        }
      });
    } catch (error) {
      console.error('FCM token update error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update FCM token'
      });
    }
  };
}
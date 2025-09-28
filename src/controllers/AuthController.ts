import { Request, Response } from 'express';
import { AuthService, RegisterRequest, LoginRequest } from '../services/AuthService';
import { UserRole } from '../models/User';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
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
}
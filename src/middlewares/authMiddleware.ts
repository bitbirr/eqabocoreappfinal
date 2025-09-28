import { Request, Response, NextFunction } from 'express';
import { AuthService, JWTPayload } from '../services/AuthService';
import { UserRole } from '../models/User';

// Extend Express Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: JWTPayload;
}

/**
 * Authentication middleware that verifies JWT tokens
 */
export function authenticateToken(authService: AuthService) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token is required'
      });
      return;
    }

    const decoded = authService.verifyToken(token);
    if (!decoded) {
      res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
      return;
    }

    req.user = decoded;
    next();
  };
}

/**
 * Role-based authorization middleware
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Required role(s): ${allowedRoles.join(', ')}`
      });
      return;
    }

    next();
  };
}

/**
 * Admin-only middleware
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  requireRole(UserRole.ADMIN)(req, res, next);
}

/**
 * Hotel owner-only middleware
 */
export function requireHotelOwner(req: Request, res: Response, next: NextFunction): void {
  requireRole(UserRole.HOTEL_OWNER)(req, res, next);
}

/**
 * Admin or Hotel owner middleware
 */
export function requireAdminOrHotelOwner(req: Request, res: Response, next: NextFunction): void {
  requireRole(UserRole.ADMIN, UserRole.HOTEL_OWNER)(req, res, next);
}

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export function optionalAuth(authService: AuthService) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = authService.verifyToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }

    next();
  };
}

/**
 * Middleware to check if user owns the resource (for user-specific operations)
 */
export function requireOwnership(getUserIdFromParams: (req: Request) => string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const resourceUserId = getUserIdFromParams(req);
    
    // Admin can access any resource, others can only access their own
    if (req.user.role !== UserRole.ADMIN && req.user.id !== resourceUserId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You can only access your own resources'
      });
      return;
    }

    next();
  };
}

/**
 * Rate limiting middleware for authentication endpoints
 */
export function authRateLimit() {
  const attempts = new Map<string, { count: number; resetTime: number }>();
  const maxAttempts = 5;
  const windowMs = 15 * 60 * 1000; // 15 minutes

  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    const clientAttempts = attempts.get(clientIp);
    
    if (clientAttempts) {
      if (now > clientAttempts.resetTime) {
        // Reset window
        attempts.set(clientIp, { count: 1, resetTime: now + windowMs });
      } else if (clientAttempts.count >= maxAttempts) {
        res.status(429).json({
          success: false,
          error: 'Too many authentication attempts. Please try again later.'
        });
        return;
      } else {
        clientAttempts.count++;
      }
    } else {
      attempts.set(clientIp, { count: 1, resetTime: now + windowMs });
    }

    next();
  };
}

/**
 * Validation middleware for request body
 */
export function validateRequestBody(requiredFields: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
      return;
    }

    next();
  };
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
exports.requireRole = requireRole;
exports.requireAdmin = requireAdmin;
exports.requireHotelOwner = requireHotelOwner;
exports.requireAdminOrHotelOwner = requireAdminOrHotelOwner;
exports.optionalAuth = optionalAuth;
exports.requireOwnership = requireOwnership;
exports.authRateLimit = authRateLimit;
exports.validateRequestBody = validateRequestBody;
const User_1 = require("../models/User");
/**
 * Authentication middleware that verifies JWT tokens
 */
function authenticateToken(authService) {
    return (req, res, next) => {
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
function requireRole(...allowedRoles) {
    return (req, res, next) => {
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
function requireAdmin(req, res, next) {
    requireRole(User_1.UserRole.ADMIN)(req, res, next);
}
/**
 * Hotel owner-only middleware
 */
function requireHotelOwner(req, res, next) {
    requireRole(User_1.UserRole.HOTEL_OWNER)(req, res, next);
}
/**
 * Admin or Hotel owner middleware
 */
function requireAdminOrHotelOwner(req, res, next) {
    requireRole(User_1.UserRole.ADMIN, User_1.UserRole.HOTEL_OWNER)(req, res, next);
}
/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
function optionalAuth(authService) {
    return (req, res, next) => {
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
function requireOwnership(getUserIdFromParams) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
            return;
        }
        const resourceUserId = getUserIdFromParams(req);
        // Admin can access any resource, others can only access their own
        if (req.user.role !== User_1.UserRole.ADMIN && req.user.id !== resourceUserId) {
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
function authRateLimit() {
    const attempts = new Map();
    const maxAttempts = 5;
    const windowMs = 15 * 60 * 1000; // 15 minutes
    return (req, res, next) => {
        const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();
        const clientAttempts = attempts.get(clientIp);
        if (clientAttempts) {
            if (now > clientAttempts.resetTime) {
                // Reset window
                attempts.set(clientIp, { count: 1, resetTime: now + windowMs });
            }
            else if (clientAttempts.count >= maxAttempts) {
                res.status(429).json({
                    success: false,
                    error: 'Too many authentication attempts. Please try again later.'
                });
                return;
            }
            else {
                clientAttempts.count++;
            }
        }
        else {
            attempts.set(clientIp, { count: 1, resetTime: now + windowMs });
        }
        next();
    };
}
/**
 * Validation middleware for request body
 */
function validateRequestBody(requiredFields) {
    return (req, res, next) => {
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const User_1 = require("../models/User");
class AuthController {
    constructor(authService) {
        /**
         * Register a new user
         * POST /api/auth/register
         */
        this.register = async (req, res) => {
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
                if (role && ![User_1.UserRole.ADMIN, User_1.UserRole.HOTEL_OWNER].includes(role)) {
                    res.status(400).json({
                        success: false,
                        error: 'Invalid role. Only admin and hotel_owner roles are allowed'
                    });
                    return;
                }
                const registerData = {
                    first_name,
                    last_name,
                    phone,
                    password,
                    role: role || User_1.UserRole.HOTEL_OWNER // Default to hotel_owner if not specified
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
                }
                else {
                    res.status(400).json({
                        success: false,
                        error: result.error
                    });
                }
            }
            catch (error) {
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
        this.login = async (req, res) => {
            try {
                const { phone, password } = req.body;
                const loginData = { phone, password };
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
                }
                else {
                    res.status(401).json({
                        success: false,
                        error: result.error
                    });
                }
            }
            catch (error) {
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
        this.getProfile = async (req, res) => {
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
            }
            catch (error) {
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
        this.refreshToken = async (req, res) => {
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
                const newToken = this.authService.generateToken({
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
            }
            catch (error) {
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
        this.logout = async (req, res) => {
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
            }
            catch (error) {
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
        this.validateToken = async (req, res) => {
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
            }
            catch (error) {
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
        this.adminOnly = async (req, res) => {
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
            }
            catch (error) {
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
        this.hotelOwnerOnly = async (req, res) => {
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
            }
            catch (error) {
                console.error('Hotel owner-only controller error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        };
        this.authService = authService;
    }
}
exports.AuthController = AuthController;

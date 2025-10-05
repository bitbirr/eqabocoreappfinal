"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const phoneValidation_1 = require("../utils/phoneValidation");
class AuthService {
    constructor(userRepository) {
        this.userRepository = userRepository;
        this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
        this.saltRounds = 12;
    }
    /**
     * Register a new user
     */
    async register(registerData) {
        try {
            const { first_name, last_name, phone, password, role } = registerData;
            // Validate input
            if (!first_name || !last_name || !phone || !password || !role) {
                return {
                    success: false,
                    error: 'All fields are required: first_name, last_name, phone, password, role'
                };
            }
            // Validate phone number
            const phoneValidation = (0, phoneValidation_1.validateEthiopianPhone)(phone);
            if (!phoneValidation.isValid) {
                return {
                    success: false,
                    error: phoneValidation.error
                };
            }
            // Validate role
            if (!Object.values(User_1.UserRole).includes(role)) {
                return {
                    success: false,
                    error: 'Invalid role. Must be admin or hotel_owner'
                };
            }
            // Check if user already exists
            const existingUser = await this.userRepository.findOne({
                where: { phone: phoneValidation.normalizedPhone }
            });
            if (existingUser) {
                return {
                    success: false,
                    error: 'User with this phone number already exists'
                };
            }
            // Hash password
            const password_hash = await bcrypt_1.default.hash(password, this.saltRounds);
            // Create user
            const user = this.userRepository.create({
                first_name,
                last_name,
                phone: phoneValidation.normalizedPhone,
                password_hash,
                role,
                email: `${phoneValidation.normalizedPhone}@temp.com` // Temporary email since it's required
            });
            const savedUser = await this.userRepository.save(user);
            // Generate JWT token
            const token = this.generateToken({
                id: savedUser.id,
                phone: savedUser.phone,
                role: savedUser.role
            });
            return {
                success: true,
                token,
                user: this.sanitizeUser(savedUser)
            };
        }
        catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: 'Internal server error during registration'
            };
        }
    }
    /**
     * Login user
     */
    async login(loginData) {
        try {
            const { phone, password } = loginData;
            // Validate input
            if (!phone || !password) {
                return {
                    success: false,
                    error: 'Phone and password are required'
                };
            }
            // Validate and normalize phone
            const phoneValidation = (0, phoneValidation_1.validateEthiopianPhone)(phone);
            if (!phoneValidation.isValid) {
                return {
                    success: false,
                    error: phoneValidation.error
                };
            }
            // Find user by phone
            const user = await this.userRepository.findOne({
                where: { phone: phoneValidation.normalizedPhone }
            });
            if (!user) {
                return {
                    success: false,
                    error: 'Invalid phone number or password'
                };
            }
            // Verify password
            const isPasswordValid = await bcrypt_1.default.compare(password, user.password_hash);
            if (!isPasswordValid) {
                return {
                    success: false,
                    error: 'Invalid phone number or password'
                };
            }
            // Generate JWT token
            const token = this.generateToken({
                id: user.id,
                phone: user.phone,
                role: user.role
            });
            return {
                success: true,
                token,
                user: this.sanitizeUser(user)
            };
        }
        catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: 'Internal server error during login'
            };
        }
    }
    /**
     * Verify JWT token
     */
    verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.jwtSecret);
            return decoded;
        }
        catch (error) {
            console.error('Token verification error:', error);
            return null;
        }
    }
    /**
     * Get user by ID
     */
    async getUserById(id) {
        try {
            const user = await this.userRepository.findOne({ where: { id } });
            return user ? this.sanitizeUser(user) : null;
        }
        catch (error) {
            console.error('Get user by ID error:', error);
            return null;
        }
    }
    /**
     * Generate JWT token
     */
    generateToken(payload) {
        const options = {
            expiresIn: this.jwtExpiresIn
        };
        return jsonwebtoken_1.default.sign(payload, this.jwtSecret, options);
    }
    /**
     * Sanitize user data for response (remove sensitive fields)
     */
    sanitizeUser(user) {
        return {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            role: user.role,
            created_at: user.created_at
        };
    }
    /**
     * Validate password strength
     */
    validatePassword(password) {
        if (!password || password.length < 8) {
            return {
                isValid: false,
                error: 'Password must be at least 8 characters long'
            };
        }
        // Add more password validation rules as needed
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            return {
                isValid: false,
                error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
            };
        }
        return { isValid: true };
    }
}
exports.AuthService = AuthService;

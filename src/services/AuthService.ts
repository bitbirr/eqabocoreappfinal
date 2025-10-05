import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { StringValue } from 'ms';
import { Repository } from 'typeorm';
import { User, UserRole } from '../models/User';
import { validateEthiopianPhone } from '../utils/phoneValidation';

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  phone: string;
  password: string;
  role: UserRole;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: UserProfile;
  error?: string;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: UserRole;
  created_at: Date;
}

export interface JWTPayload {
  id: string;
  phone: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export class AuthService {
  private userRepository: Repository<User>;
  private jwtSecret: string;
  private jwtExpiresIn: string;
  private saltRounds: number;

  constructor(userRepository: Repository<User>) {
    this.userRepository = userRepository;
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    this.saltRounds = 12;
  }

  /**
   * Register a new user
   */
  async register(registerData: RegisterRequest): Promise<AuthResponse> {
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
      const phoneValidation = validateEthiopianPhone(phone);
      if (!phoneValidation.isValid) {
        return {
          success: false,
          error: phoneValidation.error
        };
      }

      // Validate role
      if (!Object.values(UserRole).includes(role)) {
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
      const password_hash = await bcrypt.hash(password, this.saltRounds);

      // Create user
      const user = this.userRepository.create({
        first_name,
        last_name,
        phone: phoneValidation.normalizedPhone!,
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

    } catch (error) {
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
  async login(loginData: LoginRequest): Promise<AuthResponse> {
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
      const phoneValidation = validateEthiopianPhone(phone);
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
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
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

    } catch (error) {
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
  verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload;
      return decoded;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserProfile | null> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      return user ? this.sanitizeUser(user) : null;
    } catch (error) {
      console.error('Get user by ID error:', error);
      return null;
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    const options: jwt.SignOptions = { 
      expiresIn: this.jwtExpiresIn as StringValue
    };
    return jwt.sign(payload, this.jwtSecret, options);
  }

  /**
   * Sanitize user data for response (remove sensitive fields)
   */
  private sanitizeUser(user: User): UserProfile {
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
  validatePassword(password: string): { isValid: boolean; error?: string } {
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

  /**
   * Update user's FCM token
   */
  async updateFcmToken(userId: string, fcmToken: string): Promise<boolean> {
    try {
      const result = await this.userRepository.update(
        { id: userId },
        { fcm_token: fcmToken }
      );
      return result.affected !== undefined && result.affected > 0;
    } catch (error) {
      console.error('Update FCM token error:', error);
      return false;
    }
  }
}
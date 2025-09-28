# 🔐 Eqabo Authentication System

A lightweight, secure authentication system for the Eqabo Hotel Booking application, featuring phone-based authentication, JWT sessions, and role-based access control.

## 🚀 Features

- **Phone-based Authentication**: Uses Ethiopian phone numbers as unique identifiers
- **Secure Password Hashing**: bcrypt with 12 salt rounds
- **JWT Sessions**: 7-day token expiry with refresh capability
- **Role-based Access Control**: Admin and Hotel Owner roles
- **Ethiopian Phone Validation**: Automatic normalization to +251 format
- **Rate Limiting**: Protection against brute force attacks
- **Comprehensive Validation**: Input validation and error handling

## 📱 Phone Number Format

The system accepts and normalizes Ethiopian phone numbers in multiple formats:

- `+251927802065` ✅ (International with +)
- `251927802065` ✅ (International without +)
- `0927802065` ✅ (Local format)

All formats are normalized to: `+251XXXXXXXXX`

## 🔑 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user (admin/hotel_owner) |
| `POST` | `/api/auth/login` | Login with phone + password |
| `GET` | `/api/health` | API health check |
| `GET` | `/api/docs` | API documentation |

### Protected Endpoints (Requires JWT)

| Method | Endpoint | Role Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/auth/me` | Any | Get current user profile |
| `POST` | `/api/auth/refresh` | Any | Refresh JWT token |
| `POST` | `/api/auth/logout` | Any | Logout user |
| `GET` | `/api/auth/validate` | Any | Validate JWT token |
| `GET` | `/api/auth/admin-only` | Admin | Admin-only access |
| `GET` | `/api/auth/hotel-owner-only` | Hotel Owner | Hotel owner-only access |

## 📝 Request/Response Examples

### Register User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+251927802065",
  "password": "SecurePass123",
  "role": "hotel_owner"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-here",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+251927802065",
      "role": "hotel_owner",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "phone": "+251927802065",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-here",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+251927802065",
      "role": "hotel_owner",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Protected Request

```bash
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+251927802065",
      "role": "hotel_owner",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## 🛠️ Setup Instructions

### 1. Environment Configuration

Update your `.env.dev` file:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eqabobackend
DB_USER=postgres
DB_PASS=root

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production-eqabo-2024
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
```

### 2. Install Dependencies

Dependencies are already included in `package.json`:
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT token management
- `@types/bcrypt` - TypeScript types
- `@types/jsonwebtoken` - TypeScript types

### 3. Database Setup

Ensure your PostgreSQL database is running and the User entity is migrated:

```bash
npm run migration:run
```

### 4. Start the Server

```bash
# Development mode
npm run dev

# Or
npm run server

# Production mode
npm run build
npm start
```

The server will start on `http://localhost:3000`

## 🔒 Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### JWT Security
- Signed with secret key
- 7-day expiry (configurable)
- Includes user ID, phone, and role

### Rate Limiting
- 5 attempts per 15-minute window for auth endpoints
- IP-based tracking

### Phone Validation
- Ethiopian format validation
- Automatic normalization
- Duplicate prevention

## 🏗️ Architecture

### File Structure

```
src/
├── controllers/
│   └── AuthController.ts      # Authentication endpoints
├── middlewares/
│   └── authMiddleware.ts      # JWT & role-based middleware
├── models/
│   └── User.ts               # User entity with roles
├── routes/
│   ├── authRoutes.ts         # Authentication routes
│   └── index.ts              # Main router
├── services/
│   └── AuthService.ts        # Authentication business logic
├── utils/
│   └── phoneValidation.ts    # Ethiopian phone validation
├── app.ts                    # Express app configuration
└── server.ts                 # Server entry point
```

### Key Components

1. **AuthService**: Handles registration, login, and JWT operations
2. **AuthController**: HTTP request/response handling
3. **authMiddleware**: JWT verification and role-based access
4. **phoneValidation**: Ethiopian phone number validation
5. **User Entity**: TypeORM entity with authentication fields

## 🧪 Testing the API

### Using curl

```bash
# Register a new hotel owner
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "phone": "+251927802065",
    "password": "TestPass123",
    "role": "hotel_owner"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+251927802065",
    "password": "TestPass123"
  }'

# Access protected endpoint (replace TOKEN with actual token)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### Using Postman

1. Import the API endpoints
2. Set up environment variables for `baseUrl` and `token`
3. Test registration → login → protected endpoints flow

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common error codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `JWT_EXPIRES_IN` | Token expiry time | `7d` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |

### Customization

- **Token Expiry**: Modify `JWT_EXPIRES_IN` in environment
- **Password Rules**: Update `validatePassword()` in `AuthService`
- **Rate Limits**: Adjust `authRateLimit()` in middleware
- **Phone Validation**: Modify patterns in `phoneValidation.ts`

## 📚 Next Steps

1. **Frontend Integration**: Use the JWT tokens in your frontend application
2. **Hotel Management**: Extend with hotel-specific endpoints for owners
3. **Admin Panel**: Build admin-specific functionality
4. **Audit Logging**: Add authentication event logging
5. **Password Reset**: Implement phone-based password reset
6. **2FA**: Add two-factor authentication via SMS

## 🤝 Support

For questions or issues with the authentication system, refer to:
- API Documentation: `GET /api/docs`
- Health Check: `GET /api/health`
- This README file

The authentication system is now ready for production use with proper security measures and Ethiopian phone number support! 🎉
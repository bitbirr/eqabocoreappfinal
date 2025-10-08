# 🏨 Eqabo Hotel Booking Platform

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/bitbirr/eqabocoreappfinal)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.9.2-blue.svg)](https://www.typescriptlang.org/)

> A comprehensive hotel booking platform designed for the Ethiopian market, featuring seamless booking workflows, integrated payment processing, and Ethiopian payment gateway support.

---

## 🌟 Overview

**Eqabo** is a modern, API-first hotel booking platform that bridges the gap between hotels and customers in Ethiopia. Built with TypeScript, Express.js, and PostgreSQL, it provides a complete solution for hotel discovery, room booking, and payment processing with native support for Ethiopian payment gateways.

### Key Highlights

- 🔐 **Secure Authentication**: JWT-based authentication with Ethiopian phone number support
- 🏨 **Hotel Management**: Comprehensive hotel and room management system
- 📅 **Smart Booking**: Intelligent booking system with date validation and availability checking
- 💳 **Payment Integration**: Multi-gateway support (Chapa, TeleBirr, eBirr, Kaafi)
- 📚 **API Documentation**: Complete OpenAPI/Swagger documentation
- 🧪 **Testing Ready**: Postman collections for end-to-end testing
- 🇪🇹 **Ethiopian Focus**: Ethiopian phone format, local payment gateways, ETB currency

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/bitbirr/eqabocoreappfinal.git
cd eqabocoreappfinal

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.dev
# Edit .env.dev with your database credentials

# Run database migrations
npm run migration:run

# Seed the database with test data
npm run seed

# Start the development server
npm run dev

# Server will start at http://localhost:3000
```

### Verify Installation

```bash
# Health check
curl http://localhost:3000/api/health

# View API documentation
open http://localhost:3000/api-docs
```

---

## 📚 Documentation

### Comprehensive Guides

We have extensive documentation to help you get started:

#### 🎯 **[Documentation Index](docs/README.md)**
Start here to find the right documentation for your needs.

#### 📖 **Essential Docs**

- **[Project Overview](docs/PROJECT_OVERVIEW.md)** - Project status, features, architecture, and objectives
- **[Developer Guide](docs/DEVELOPER_GUIDE.md)** - Complete development setup and workflow
- **[Business Plan](docs/BUSINESS_PLAN.md)** - Revenue model, market strategy, and financial projections
- **[Pre-Live Testing Guide](docs/PRE_LIVE_TESTING.md)** - MVP definition and testing scenarios
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Infrastructure setup and go-to-market strategy
- **[OpenAPI Guide](docs/OPENAPI_GUIDE.md)** - API specification and best practices
- **[Contributing Guide](docs/CONTRIBUTING.md)** - How to contribute to the project

#### 🔧 **Technical Docs**

- **[Authentication Guide](AUTH_README.md)** - JWT authentication and phone validation
- **[Database Setup](DATABASE_SETUP.md)** - Database configuration and schema
- **[Seeding Guide](SEEDING_GUIDE.md)** - Test data generation
- **[Postman Workflow](postman/WORKFLOW-GUIDE.md)** - End-to-end testing with Postman
- **[Firebase Integration](FIREBASE_BACKEND.md)** - Real-time updates and push notifications
- **[Payment Gateway Integration](PAYMENT_GATEWAY_INTEGRATION.md)** - Chapa, TeleBirr, eBirr, Kaafi setup

---

## ✨ Features

### 🔐 Authentication & Security
- Phone-based authentication (Ethiopian +251 format)
- JWT token system with 7-day expiry
- Role-based access control (Admin, Hotel Owner, Customer)
- bcrypt password hashing
- Rate limiting protection

### 🏨 Hotel Management
- Hotel profiles with images and amenities
- Multi-hotel support for owners
- Status management (active, inactive, pending)
- Search and filter by city, rating, amenities
- Rich media support

### 🛏️ Room Management
- Multiple room types per hotel
- Dynamic pricing configuration
- Capacity and availability tracking
- Room-specific amenities
- Real-time status updates

### 📅 Booking System
- Date validation and overlap prevention
- Automatic price calculation
- Guest information management
- Special requests support
- Multi-status workflow (pending → confirmed → completed)

### 💳 Payment Processing
- **Real payment gateway integrations** for all major Ethiopian providers
- **Chapa**: Leading Ethiopian payment gateway
- **TeleBirr**: Ethio Telecom's mobile money service
- **eBirr (CBE Birr)**: Commercial Bank of Ethiopia's mobile payment
- **Kaafi**: Ethiopian mobile payment solution
- Secure payment initiation with provider checkout URLs
- Webhook callbacks with signature verification
- Payment verification endpoints for status checks
- Complete transaction audit trail
- Real-time Firestore synchronization
- Automatic FCM notifications on payment events

### 📊 Admin & Analytics
- User and hotel management
- Booking oversight
- Revenue tracking
- System health monitoring
- Performance metrics

---

## 🎯 API Endpoints

### Complete Workflow

```
1️⃣ Authentication → 2️⃣ Hotel Search → 3️⃣ Room Availability → 
4️⃣ Create Booking → 5️⃣ Payment → 6️⃣ Callback → 7️⃣ Receipt
```

### Main Endpoints

```
Authentication:
  POST   /api/auth/register      # Register user
  POST   /api/auth/login         # Login
  GET    /api/auth/me            # Get current user

Hotels:
  GET    /api/hotels             # Search hotels
  GET    /api/hotels/:id         # Get hotel details
  POST   /api/hotels             # Create hotel (owner)
  
Rooms:
  GET    /api/hotels/:id/rooms/available  # Check availability

Bookings:
  POST   /api/bookings           # Create booking
  GET    /api/bookings/:id       # Get booking details

Payments:
  POST   /api/payments/initiate    # Initiate payment with gateway
  POST   /api/payments/callback    # Payment webhook callback
  GET    /api/payments/:id         # Get payment status
  GET    /api/payments/:id/verify  # Verify payment with gateway
  GET    /api/payments/:id       # Get payment status

Documentation:
  GET    /api-docs               # Swagger UI
  GET    /api/health             # Health check
```

**[View Full API Documentation](http://localhost:3000/api-docs)** (when server is running)

### 📖 API Documentation

The API is fully documented using **OpenAPI 3.0 (Swagger)**. The interactive documentation provides:

- **Complete endpoint reference** with request/response examples
- **Schema definitions** for all data models
- **Try it out** functionality to test endpoints directly
- **Authentication support** with JWT token management
- **Error response** documentation

#### Accessing the Documentation

1. **Interactive Swagger UI**: Visit `http://localhost:3000/api-docs` when the server is running
2. **OpenAPI Specification**: The spec is auto-generated from JSDoc comments in the code
3. **Documentation Guide**: See [OpenAPI Guide](docs/OPENAPI_GUIDE.md) for detailed information

#### Using the Interactive Documentation

1. **Authorize**: Click the "Authorize" button and enter your JWT token
2. **Explore Endpoints**: Browse endpoints organized by tags (Authentication, Hotels, Bookings, Payments)
3. **Test Requests**: Use "Try it out" to send real API requests
4. **View Responses**: See actual response schemas and examples

#### Documentation Features

- ✅ **16 API endpoints** fully documented
- ✅ **11 data schemas** with examples
- ✅ **4 endpoint categories** (Authentication, Hotels, Bookings, Payments)
- ✅ **Request/response examples** for all endpoints
- ✅ **Error handling** documentation
- ✅ **Authentication flows** clearly explained
- ✅ **Rate limiting** information included
- ✅ **Payment gateway integration guide**

---

## 🧪 Testing

### Postman Collections

We provide complete Postman collections for end-to-end testing:

```bash
# Located in postman/ directory
- Hotel-Booking-Workflow.postman_collection.json
- Hotel-Booking-Workflow.postman_environment.json
```

**[View Workflow Guide](postman/WORKFLOW-GUIDE.md)**

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.1.0
- **Language**: TypeScript 5.9.2
- **Database**: PostgreSQL 14+
- **ORM**: TypeORM 0.3.27
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password**: bcrypt 6.0.0
- **Documentation**: Swagger/OpenAPI 3.0
- **Testing**: Jest 30.1.3
- **Logging**: Winston 3.17.0

---

## 📦 Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run server           # Alternative dev server

# Build
npm run build            # Compile TypeScript to JavaScript
npm start                # Start production server (requires build)

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage

# Database
npm run migration:run    # Run database migrations
npm run migration:revert # Revert last migration
npm run seed             # Seed database with test data
npm run seed:summary     # View seeded data summary

# TypeORM CLI
npm run typeorm          # Run TypeORM commands
```

---

## 🌍 Environment Variables

Required environment variables (create `.env.dev`):

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eqabobackend
DB_USER=postgres
DB_PASS=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
API_BASE_URL=http://localhost:3000

# Firebase (Optional - for real-time features)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Payment Gateways (Optional - configure as needed)
# Chapa
CHAPA_SECRET_KEY=your-chapa-secret-key
CHAPA_API_URL=https://api.chapa.co/v1

# TeleBirr
TELEBIRR_APP_ID=your-telebirr-app-id
TELEBIRR_APP_KEY=your-telebirr-app-key
TELEBIRR_PUBLIC_KEY=your-telebirr-public-key

# eBirr (CBE Birr)
EBIRR_MERCHANT_ID=your-ebirr-merchant-id
EBIRR_API_KEY=your-ebirr-api-key

# Kaafi
KAAFI_MERCHANT_CODE=your-kaafi-merchant-code
KAAFI_API_KEY=your-kaafi-api-key
KAAFI_SECRET_KEY=your-kaafi-secret-key
```

See [`.env.example`](.env.example) for complete configuration options.

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📈 Project Status

**Status**: MVP Complete, Ready for Pre-Live Testing

**Latest Features**:
- ✅ Complete authentication system
- ✅ Hotel and room management
- ✅ Booking workflow with validation
- ✅ **Real payment gateway integrations (Chapa, TeleBirr, eBirr, Kaafi)**
- ✅ **Payment verification and webhook security**
- ✅ **Firebase real-time updates and push notifications**
- ✅ Comprehensive API documentation
- ✅ Postman testing collections
- ✅ Database seeding system

**Roadmap**:
- [ ] Email notifications
- [ ] SMS notifications (Ethiopian providers)
- [ ] Review and rating system
- [ ] Mobile app (iOS/Android)
- [ ] Admin dashboard
- [ ] Multi-language support (Amharic)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact & Support

- **GitHub**: https://github.com/bitbirr/eqabocoreappfinal
- **Email**: support@eqabo.com
- **API Documentation**: http://localhost:3000/api-docs
- **Issues**: https://github.com/bitbirr/eqabocoreappfinal/issues
- **Discussions**: https://github.com/bitbirr/eqabocoreappfinal/discussions

---

## 🙏 Acknowledgments

- Ethiopian hospitality industry for inspiration
- Open-source community for amazing tools
- All contributors who help improve Eqabo

---

## 🎓 Learn More

- **[Documentation Index](docs/README.md)** - Complete documentation overview
- **[Developer Guide](docs/DEVELOPER_GUIDE.md)** - In-depth development guide
- **[Business Plan](docs/BUSINESS_PLAN.md)** - Business strategy and model
- **[API Guide](docs/OPENAPI_GUIDE.md)** - API best practices

---

**Made with ❤️ for Ethiopian Hotels**

**Version**: 1.0.0  
**Last Updated**: January 2025

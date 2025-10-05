# 👨‍💻 Developer Onboarding Guide

## Welcome to the Eqabo Development Team!

This guide will help you get up and running with the Eqabo Hotel Booking Platform codebase. Whether you're a new team member or an open-source contributor, this document provides everything you need to start contributing effectively.

---

## 1. Getting Started

### 1.1 Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 18.x or higher | JavaScript runtime |
| **npm** | 9.x or higher | Package manager |
| **PostgreSQL** | 14.x or higher | Database |
| **Git** | 2.x or higher | Version control |
| **VS Code** | Latest | Recommended IDE |

**Optional but Recommended**:
- **Postman** or **Insomnia**: API testing
- **pgAdmin** or **DBeaver**: Database management
- **Docker**: Containerized development (future)

### 1.2 Development Environment Setup

#### Step 1: Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/bitbirr/eqabocoreappfinal.git

# Or via SSH (if configured)
git clone git@github.com:bitbirr/eqabocoreappfinal.git

# Navigate to project directory
cd eqabocoreappfinal
```

#### Step 2: Install Dependencies

```bash
# Install all Node.js dependencies
npm install

# This will install:
# - Runtime dependencies (express, typeorm, etc.)
# - Development dependencies (typescript, jest, etc.)
```

#### Step 3: Database Setup

**Option A: Local PostgreSQL**

```bash
# Start PostgreSQL service
sudo service postgresql start  # Linux
brew services start postgresql # macOS

# Create database
createdb eqabobackend

# Or using psql
psql -U postgres
CREATE DATABASE eqabobackend;
\q
```

**Option B: Cloud PostgreSQL (Neon)**

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Use in your `.env.dev` file

#### Step 4: Environment Configuration

```bash
# Create environment file
cp .env.example .env.dev

# Edit with your values
nano .env.dev
```

**Required Environment Variables**:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eqabobackend
DB_USER=postgres
DB_PASS=your_password

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-development
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# Payment Gateway (Optional for development)
CHAPA_SECRET_KEY=test-secret-key
CHAPA_PUBLIC_KEY=test-public-key
```

#### Step 5: Run Database Migrations

```bash
# Run migrations to create tables
npm run migration:run

# Verify tables were created
psql -d eqabobackend -c "\dt"
# Should show: users, hotels, rooms, bookings, payments, payment_logs
```

#### Step 6: Seed Test Data

```bash
# Seed database with test data
npm run seed

# This creates:
# - 7 test users (admin, owners, customers)
# - 5 test hotels
# - 15 test rooms
# - Sample bookings and payments
```

#### Step 7: Start Development Server

```bash
# Start server in development mode (with hot reload)
npm run dev

# Or use the alternative command
npm run server

# Server will start on http://localhost:3000
```

#### Step 8: Verify Installation

```bash
# Health check
curl http://localhost:3000/api/health

# Expected response:
# {
#   "success": true,
#   "message": "API is healthy",
#   "timestamp": "2025-01-15T10:30:00.000Z",
#   "version": "1.0.0"
# }

# View API documentation
open http://localhost:3000/api/docs
```

---

## 2. Project Structure

### 2.1 Directory Layout

```
eqabocoreappfinal/
├── src/                          # Source code
│   ├── app.ts                    # Express app configuration
│   ├── server.ts                 # Server entry point
│   ├── config/                   # Configuration files
│   │   ├── database.ts           # Database connection
│   │   └── swagger.ts            # OpenAPI/Swagger config
│   ├── controllers/              # Request handlers
│   │   ├── AuthController.ts
│   │   ├── HotelController.ts
│   │   ├── BookingController.ts
│   │   └── PaymentController.ts
│   ├── middlewares/              # Express middlewares
│   │   └── authMiddleware.ts     # JWT auth & authorization
│   ├── models/                   # TypeORM entities
│   │   ├── User.ts
│   │   ├── Hotel.ts
│   │   ├── Room.ts
│   │   ├── Booking.ts
│   │   ├── Payment.ts
│   │   └── PaymentLog.ts
│   ├── routes/                   # API routes
│   │   ├── index.ts              # Main router
│   │   ├── authRoutes.ts
│   │   ├── hotelRoutes.ts
│   │   ├── bookingRoutes.ts
│   │   └── paymentRoutes.ts
│   ├── services/                 # Business logic
│   │   ├── AuthService.ts        # Authentication logic
│   │   └── DatabaseService.ts    # Database utilities
│   ├── utils/                    # Utility functions
│   │   └── phoneValidation.ts    # Phone number validation
│   ├── migrations/               # Database migrations
│   │   └── 1700000000000-InitialMigration.ts
│   └── seeds/                    # Database seeding
│       ├── seed.ts
│       ├── DatabaseSeeder.ts
│       ├── data/
│       │   └── seedData.ts
│       └── utils/
│           └── seedHelpers.ts
├── scripts/                      # Utility scripts
│   └── seed.js                   # JS seed script
├── postman/                      # Postman collections
│   ├── Hotel-Booking-Workflow.postman_collection.json
│   └── Hotel-Booking-Workflow.postman_environment.json
├── docs/                         # Documentation
│   ├── PROJECT_OVERVIEW.md
│   ├── BUSINESS_PLAN.md
│   ├── PRE_LIVE_TESTING.md
│   ├── OPENAPI_GUIDE.md
│   └── DEPLOYMENT_GUIDE.md
├── dist/                         # Compiled JavaScript (git-ignored)
├── node_modules/                 # Dependencies (git-ignored)
├── .env.dev                      # Environment variables (git-ignored)
├── .gitignore                    # Git ignore rules
├── package.json                  # NPM dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── ormconfig.ts                  # TypeORM configuration
└── README.md                     # Project README
```

### 2.2 Key Files Explained

#### `src/server.ts`
Entry point of the application. Initializes database and starts Express server.

#### `src/app.ts`
Express application configuration. Sets up middleware, routes, and error handling.

#### `src/config/database.ts`
Database connection configuration using TypeORM.

#### `src/config/swagger.ts`
OpenAPI/Swagger documentation configuration.

#### `src/models/`
TypeORM entities representing database tables. Each file defines a data model with relationships.

#### `src/controllers/`
HTTP request/response handlers. Controllers receive requests, call services, and return responses.

#### `src/services/`
Business logic layer. Services contain the core application logic separated from HTTP concerns.

#### `src/middlewares/authMiddleware.ts`
Authentication and authorization middleware for protecting routes.

#### `src/routes/`
Route definitions that map URLs to controller methods.

---

## 3. Development Workflow

### 3.1 Daily Development Cycle

```bash
# 1. Pull latest changes
git pull origin main

# 2. Create a new branch for your feature
git checkout -b feature/your-feature-name

# 3. Make your changes
# Edit files...

# 4. Run tests
npm test

# 5. Build to check for TypeScript errors
npm run build

# 6. Commit your changes
git add .
git commit -m "feat: add your feature description"

# 7. Push to your branch
git push origin feature/your-feature-name

# 8. Create a Pull Request on GitHub
```

### 3.2 Available NPM Scripts

```bash
# Development
npm run dev          # Start server with hot reload
npm run server       # Alternative dev server command

# Build
npm run build        # Compile TypeScript to JavaScript
npm start            # Start production server (requires build)

# Testing
npm test             # Run test suite (Jest)
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Database
npm run typeorm                    # Run TypeORM CLI
npm run migration:generate         # Generate new migration
npm run migration:run              # Run pending migrations
npm run migration:revert           # Revert last migration
npm run schema:sync                # Sync schema (dev only!)
npm run schema:drop                # Drop all tables (danger!)

# Seeding
npm run seed         # Run JS seed script
npm run seed:ts      # Run TS seed script
npm run seed:all     # Seed all entities
npm run seed:users   # Seed only users
npm run seed:hotels  # Seed only hotels
npm run seed:summary # Show seed data summary
```

### 3.3 Git Workflow

We follow a **feature branch workflow**:

```bash
# Main branches
main        # Production-ready code
develop     # Development branch (if needed)

# Feature branches
feature/    # New features
bugfix/     # Bug fixes
hotfix/     # Urgent production fixes
docs/       # Documentation updates
refactor/   # Code refactoring

# Example branch names
feature/add-review-system
bugfix/fix-payment-callback
hotfix/critical-security-patch
docs/update-api-documentation
refactor/optimize-database-queries
```

### 3.4 Commit Message Convention

We use **Conventional Commits**:

```bash
# Format
<type>(<scope>): <subject>

# Types
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation changes
style:    # Code style changes (formatting)
refactor: # Code refactoring
perf:     # Performance improvements
test:     # Adding or updating tests
chore:    # Maintenance tasks

# Examples
feat(auth): add password reset functionality
fix(booking): resolve date validation error
docs(api): update OpenAPI specification
refactor(hotel): optimize search query performance
test(payment): add unit tests for payment callback
```

---

## 4. Coding Standards

### 4.1 TypeScript Guidelines

**Use Strict Types**:
```typescript
// ✅ Good
function calculateTotal(nights: number, pricePerNight: number): number {
  return nights * pricePerNight;
}

// ❌ Bad
function calculateTotal(nights, pricePerNight) {
  return nights * pricePerNight;
}
```

**Define Interfaces**:
```typescript
// ✅ Good
interface BookingRequest {
  room_id: string;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
}

// ❌ Bad
const booking: any = { ... };
```

**Use Enums for Constants**:
```typescript
// ✅ Good
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// ❌ Bad
const STATUS_PENDING = 'pending';
const STATUS_CONFIRMED = 'confirmed';
```

### 4.2 Code Formatting

**Use Consistent Formatting**:
- 2 spaces for indentation
- Single quotes for strings
- Trailing commas in objects/arrays
- Semicolons at end of statements

**Example**:
```typescript
const hotel = {
  name: 'Skylight Hotel',
  city: 'Addis Ababa',
  amenities: ['WiFi', 'Pool', 'Gym'],
};
```

### 4.3 Error Handling

**Always Handle Errors**:
```typescript
// ✅ Good
try {
  const booking = await bookingRepository.save(newBooking);
  res.status(201).json({
    success: true,
    data: { booking }
  });
} catch (error) {
  console.error('Error creating booking:', error);
  res.status(500).json({
    success: false,
    error: 'Failed to create booking'
  });
}

// ❌ Bad
const booking = await bookingRepository.save(newBooking);
res.json(booking);
```

**Provide Meaningful Error Messages**:
```typescript
// ✅ Good
if (!room) {
  res.status(404).json({
    success: false,
    error: 'Room not found',
    code: 'ROOM_NOT_FOUND'
  });
  return;
}

// ❌ Bad
if (!room) {
  res.status(404).json({ error: 'Not found' });
  return;
}
```

### 4.4 API Response Standards

**Consistent Response Format**:
```typescript
// Success Response
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response payload
  }
}

// Error Response
{
  "success": false,
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE" // Optional
}
```

### 4.5 Database Best Practices

**Use Transactions for Multiple Operations**:
```typescript
// ✅ Good
const queryRunner = dataSource.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();

try {
  await queryRunner.manager.save(booking);
  await queryRunner.manager.update(Room, roomId, { status: 'booked' });
  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction();
  throw error;
} finally {
  await queryRunner.release();
}
```

**Use Repository Pattern**:
```typescript
// ✅ Good
const hotelRepository = dataSource.getRepository(Hotel);
const hotels = await hotelRepository.find({
  where: { city: 'Addis Ababa', status: 'active' },
  relations: ['rooms', 'owner']
});

// ❌ Bad
const hotels = await dataSource.query(
  'SELECT * FROM hotels WHERE city = $1',
  ['Addis Ababa']
);
```

---

## 5. Testing

### 5.1 Test Structure

```
src/
├── __tests__/              # Test files
│   ├── auth.test.ts
│   ├── hotel.test.ts
│   ├── booking.test.ts
│   └── payment.test.ts
```

### 5.2 Writing Tests

**Example Test**:
```typescript
import request from 'supertest';
import { createApp } from '../app';
import { initializeDatabase } from '../config/database';

describe('Authentication API', () => {
  let app;
  let dataSource;

  beforeAll(async () => {
    dataSource = await initializeDatabase();
    app = createApp(dataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          first_name: 'Test',
          last_name: 'User',
          phone: '+251911234567',
          password: 'TestPass123!',
          role: 'hotel_owner'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject duplicate phone numbers', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          first_name: 'Test',
          last_name: 'User',
          phone: '+251922334455',
          password: 'TestPass123!',
          role: 'hotel_owner'
        });

      // Duplicate registration
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          first_name: 'Another',
          last_name: 'User',
          phone: '+251922334455',
          password: 'TestPass123!',
          role: 'hotel_owner'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
```

### 5.3 Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts
```

---

## 6. API Development

### 6.1 Creating a New Endpoint

**Step 1: Define the Route**

```typescript
// src/routes/exampleRoutes.ts
import { Router } from 'express';
import { ExampleController } from '../controllers/ExampleController';

export function createExampleRoutes(dataSource: DataSource): Router {
  const router = Router();
  const controller = new ExampleController(dataSource);

  router.get('/', controller.getAll.bind(controller));
  router.get('/:id', controller.getById.bind(controller));
  router.post('/', controller.create.bind(controller));

  return router;
}
```

**Step 2: Create the Controller**

```typescript
// src/controllers/ExampleController.ts
import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { Example } from '../models/Example';

export class ExampleController {
  private exampleRepository;

  constructor(dataSource: DataSource) {
    this.exampleRepository = dataSource.getRepository(Example);
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const examples = await this.exampleRepository.find();
      res.status(200).json({
        success: true,
        data: { examples }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch examples'
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const example = await this.exampleRepository.findOne({
        where: { id }
      });

      if (!example) {
        res.status(404).json({
          success: false,
          error: 'Example not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { example }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch example'
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const example = this.exampleRepository.create(req.body);
      const savedExample = await this.exampleRepository.save(example);

      res.status(201).json({
        success: true,
        message: 'Example created successfully',
        data: { example: savedExample }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create example'
      });
    }
  }
}
```

**Step 3: Add OpenAPI Documentation**

```typescript
/**
 * @swagger
 * /api/examples:
 *   get:
 *     summary: Get all examples
 *     tags: [Examples]
 *     responses:
 *       200:
 *         description: Examples retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     examples:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Example'
 */
router.get('/', controller.getAll.bind(controller));
```

**Step 4: Register the Route**

```typescript
// src/routes/index.ts
import { createExampleRoutes } from './exampleRoutes';

export function createMainRouter(userRepository, dataSource): Router {
  const router = Router();

  // ... existing routes
  router.use('/examples', createExampleRoutes(dataSource));

  return router;
}
```

### 6.2 Creating a New Model

```typescript
// src/models/Example.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity('examples')
export class Example {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
```

---

## 7. Database Migrations

### 7.1 Creating a Migration

```bash
# Generate migration from entity changes
npm run migration:generate -- src/migrations/AddExampleTable

# This will create a file like:
# src/migrations/1705320000000-AddExampleTable.ts
```

### 7.2 Migration Example

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddExampleTable1705320000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'examples',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()'
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100'
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP'
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP'
          }
        ]
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('examples');
  }
}
```

### 7.3 Running Migrations

```bash
# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run typeorm migration:show
```

---

## 8. Debugging

### 8.1 VS Code Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "runtimeArgs": ["-r", "ts-node/register"],
      "args": ["${workspaceFolder}/src/server.ts"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### 8.2 Debugging Tips

**Add Breakpoints**:
- Click on the left margin in VS Code to add breakpoints
- Press F5 to start debugging
- Use F10 (step over), F11 (step into), Shift+F11 (step out)

**Console Logging**:
```typescript
// Add temporary debug logs
console.log('Debug:', variable);
console.error('Error:', error);
console.table(arrayOfObjects);
```

**Database Query Logging**:
```typescript
// In src/config/database.ts
export const AppDataSource = new DataSource({
  // ...
  logging: true, // Enable SQL query logging
  logger: 'advanced-console'
});
```

---

## 9. Common Tasks

### 9.1 Adding a New Hotel

```bash
# Using Postman or curl
curl -X POST http://localhost:3000/api/hotels \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Hotel",
    "description": "A great hotel",
    "address": "123 Main St",
    "city": "Addis Ababa",
    "phone": "+251115551234",
    "email": "info@newhotel.com",
    "amenities": ["WiFi", "Pool"],
    "images": ["https://example.com/image.jpg"]
  }'
```

### 9.2 Testing the Booking Flow

```bash
# 1. Register/Login
# 2. Search hotels
GET /api/hotels?city=Addis Ababa

# 3. Check room availability
GET /api/hotels/{hotel_id}/rooms/available?checkin=2025-10-01&checkout=2025-10-03

# 4. Create booking
POST /api/bookings
{
  "room_id": "uuid",
  "check_in_date": "2025-10-01",
  "check_out_date": "2025-10-03",
  "guest_count": 2,
  "guest_name": "Test User",
  "guest_email": "test@example.com",
  "guest_phone": "+251911234567"
}

# 5. Initiate payment
POST /api/payments/initiate
{
  "booking_id": "uuid",
  "provider": "chapa"
}

# 6. Simulate callback
POST /api/payments/callback
{
  "reference": "provider-reference",
  "status": "success"
}
```

### 9.3 Resetting the Database

```bash
# Drop all tables
npm run schema:drop

# Run migrations
npm run migration:run

# Seed data
npm run seed
```

---

## 10. Troubleshooting

### 10.1 Common Issues

**Issue**: "Cannot find module"
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Issue**: "Database connection error"
```bash
# Solution: Check PostgreSQL is running
sudo service postgresql status
sudo service postgresql start

# Check connection details in .env.dev
```

**Issue**: "Port 3000 already in use"
```bash
# Solution: Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port in .env.dev
PORT=3001
```

**Issue**: "Migration failed"
```bash
# Solution: Revert and try again
npm run migration:revert
npm run migration:run

# Or drop and recreate database
npm run schema:drop
npm run migration:run
```

---

## 11. Resources

### 11.1 Documentation

- **Project Docs**: `/docs` directory
- **API Docs**: http://localhost:3000/api/docs
- **TypeORM Docs**: https://typeorm.io
- **Express Docs**: https://expressjs.com
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

### 11.2 Tools

- **Postman Collections**: `/postman` directory
- **VS Code Extensions**:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - REST Client
  - PostgreSQL Explorer

### 11.3 Team Communication

- **Slack/Discord**: (Add your team channel)
- **GitHub Issues**: For bugs and features
- **GitHub Discussions**: For questions and ideas
- **Weekly Standup**: (Add your meeting schedule)

---

## 12. Next Steps

Now that you're set up, here's what to do next:

1. **Explore the Codebase**: Read through the main files to understand the structure
2. **Run the Postman Collection**: Test the complete booking workflow
3. **Pick a Starter Issue**: Look for issues labeled "good first issue"
4. **Join Team Meeting**: Introduce yourself and ask questions
5. **Make Your First Contribution**: Fix a bug or add a small feature

**Welcome aboard! Happy coding! 🚀**

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Maintained By**: Eqabo Development Team

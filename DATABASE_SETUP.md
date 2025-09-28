# Database Setup Guide

This project uses TypeORM with PostgreSQL for database management.

## Prerequisites

- PostgreSQL database (local or cloud like Neon)
- Node.js and npm installed

## Environment Variables

Update your `.env.dev` file with your database credentials:

```env
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eqabobackend
DB_USER=postgres
DB_PASS=your_password
```

For Neon or other cloud PostgreSQL providers, use their connection details.

## Database Schema

The database includes the following tables:
- `users` - User accounts (customers, hotel owners, admins)
- `hotels` - Hotel information
- `rooms` - Hotel rooms with pricing and availability
- `bookings` - Reservation records
- `payments` - Payment transactions
- `payment_logs` - Payment audit logs

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Migration Options

#### Option A: Using TypeORM Migrations (Recommended)
```bash
# Run the initial migration
npm run migration:run
```

#### Option B: Using Raw SQL (For Neon or direct SQL execution)
Execute the SQL file directly in your database:
```sql
-- Run the contents of sql/migrations/01_init.sql
```

### 3. Initialize Database Connection

In your main application file, initialize the database:

```typescript
import { initializeDatabase } from './src/config/database';

async function startApp() {
  try {
    await initializeDatabase();
    // Start your Express server here
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

startApp();
```

## Available Scripts

- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert the last migration
- `npm run migration:generate -- src/migrations/MigrationName` - Generate a new migration
- `npm run schema:sync` - Sync schema (development only)
- `npm run schema:drop` - Drop all tables (be careful!)

## Usage Examples

### Using the Database Service

```typescript
import { DatabaseService } from './src/services/DatabaseService';

const dbService = DatabaseService.getInstance();

// Create a new user
const user = await dbService.userRepository.save({
  name: 'John Doe',
  email: 'john@example.com',
  role: UserRole.CUSTOMER
});

// Find hotels
const hotels = await dbService.hotelRepository.find({
  relations: ['owner', 'rooms']
});
```

### Using Repositories Directly

```typescript
import { AppDataSource } from './src/config/database';
import { User } from './src/models';

const userRepository = AppDataSource.getRepository(User);
const users = await userRepository.find();
```

## Entity Relationships

- Users can own multiple Hotels (one-to-many)
- Hotels have multiple Rooms (one-to-many)
- Users can make multiple Bookings (one-to-many)
- Bookings belong to one Hotel and one Room (many-to-one)
- Bookings can have multiple Payments (one-to-many)
- Bookings can have multiple Payment Logs (one-to-many)

## Notes

- The database uses UUID primary keys with PostgreSQL's `gen_random_uuid()`
- Timestamps are stored with timezone information (`TIMESTAMPTZ`)
- The `nights` field in bookings is automatically calculated
- Foreign key constraints ensure data integrity
- Indexes are created for optimal query performance
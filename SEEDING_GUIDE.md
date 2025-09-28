# Database Seeding Guide

This guide explains how to use the database seeding system for the Eqabo hotel booking application.

## Overview

The seeding system provides realistic sample data for all entities in the hotel booking system:
- **Users**: Customers, hotel owners, and administrators
- **Hotels**: Various hotels with different statuses and locations
- **Rooms**: Different room types with varying prices and amenities
- **Bookings**: Sample reservations with different statuses
- **Payments**: Payment records with various providers and statuses
- **Payment Logs**: Audit trail for payment activities

## Prerequisites

1. **Database Setup**: Ensure your PostgreSQL database is running and accessible
2. **Environment Variables**: Configure your `.env.dev` file with correct database credentials
3. **Migrations**: Run database migrations before seeding

```bash
# Run migrations first
npm run migration:run
```

## Environment Configuration

Ensure your `.env.dev` file contains the correct database connection details:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eqabobackend
DB_USER=your_username
DB_PASS=your_password
```

## Available Seeding Commands

### 1. Seed All Data (Recommended)
```bash
npm run seed
# or
npm run seed:all
```
This command will:
- Clear existing data (if any)
- Seed all entities in the correct dependency order
- Display a summary of seeded data

### 2. Seed Specific Entity Types
```bash
# Seed only users
npm run seed:users

# Seed only hotels (requires users to exist)
npm run seed:hotels
```

### 3. View Seeding Summary
```bash
npm run seed:summary
```
Shows current database statistics without modifying data.

## Seeding Process Details

### Data Generation Features

1. **Realistic Ethiopian Context**:
   - Ethiopian names and phone numbers
   - Local cities and locations
   - Ethiopian Birr (ETB) currency

2. **Relationship Integrity**:
   - Proper foreign key relationships
   - Consistent data across entities
   - Realistic booking dates and pricing

3. **Diverse Data Scenarios**:
   - Multiple user roles (customer, hotel_owner, admin)
   - Various hotel and room statuses
   - Different booking and payment statuses
   - Multiple payment providers (Chappa, TeleBirr, eBirr, Kaafi)

### Sample Data Volumes

- **Users**: 10 records (3 customers, 3 hotel owners, 1 admin)
- **Hotels**: 5 records with different statuses
- **Rooms**: 15 records across all hotels
- **Bookings**: 8 records with various statuses
- **Payments**: 6 records with different providers
- **Payment Logs**: 12 audit records

## Seeding Order

The system automatically handles entity dependencies:

1. **Users** (no dependencies)
2. **Hotels** (depends on Users)
3. **Rooms** (depends on Hotels)
4. **Bookings** (depends on Users, Hotels, Rooms)
5. **Payments** (depends on Bookings)
6. **Payment Logs** (depends on Payments, Bookings)

## Error Handling

The seeding system includes comprehensive error handling:

- **Database Connection**: Validates connection before proceeding
- **Data Validation**: Ensures data integrity and relationships
- **Transaction Safety**: Uses database transactions for consistency
- **Detailed Logging**: Provides clear error messages and progress updates

## Troubleshooting

### Common Issues

1. **Authentication Failed**:
   ```
   Error: password authentication failed for user "postgres"
   ```
   **Solution**: Check your database credentials in `.env.dev`

2. **Database Not Found**:
   ```
   Error: database "eqabobackend" does not exist
   ```
   **Solution**: Create the database or update `DB_NAME` in `.env.dev`

3. **Migration Required**:
   ```
   Error: relation "users" does not exist
   ```
   **Solution**: Run migrations first: `npm run migration:run`

4. **Port Already in Use**:
   ```
   Error: connect ECONNREFUSED
   ```
   **Solution**: Ensure PostgreSQL is running on the specified port

### Verification Steps

After successful seeding, verify the data:

```sql
-- Check record counts
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'hotels', COUNT(*) FROM hotels
UNION ALL
SELECT 'rooms', COUNT(*) FROM rooms
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'payment_logs', COUNT(*) FROM payment_logs;

-- Check relationships
SELECT 
  h.name as hotel_name,
  COUNT(r.id) as room_count,
  COUNT(b.id) as booking_count
FROM hotels h
LEFT JOIN rooms r ON h.id = r.hotel_id
LEFT JOIN bookings b ON h.id = b.hotel_id
GROUP BY h.id, h.name;
```

## Development Usage

### Using Seeded Data in Development

The seeded data provides realistic scenarios for testing:

```typescript
// Example: Find a hotel owner
const hotelOwner = await userRepository.findOne({
  where: { role: UserRole.HOTEL_OWNER },
  relations: ['hotels']
});

// Example: Find available rooms
const availableRooms = await roomRepository.find({
  where: { status: RoomStatus.AVAILABLE },
  relations: ['hotel']
});

// Example: Find pending bookings
const pendingBookings = await bookingRepository.find({
  where: { status: BookingStatus.PENDING },
  relations: ['user', 'hotel', 'room']
});
```

### Customizing Seed Data

To modify the seed data:

1. Edit `src/seeds/data/seedData.ts`
2. Update the data arrays with your custom values
3. Run the seeding command to apply changes

### Adding New Seed Data

To add new entities to the seeding process:

1. Add data to `src/seeds/data/seedData.ts`
2. Update `src/seeds/DatabaseSeeder.ts` to handle the new entity
3. Add appropriate CLI commands in `src/seeds/seed.ts`

## Production Considerations

⚠️ **Warning**: This seeding system is designed for development and testing environments only.

For production environments:
- Never run seeding commands on production databases
- Use proper data migration scripts for production data
- Implement proper backup and recovery procedures
- Use environment-specific configuration files

## Integration with Testing

The seeding system can be integrated with your test suite:

```typescript
// In your test setup
import { DatabaseSeeder } from '../src/seeds/DatabaseSeeder';

beforeEach(async () => {
  const seeder = DatabaseSeeder.getInstance();
  await seeder.clearAllData();
  await seeder.seedAll();
});
```

This ensures each test runs with a clean, consistent dataset.
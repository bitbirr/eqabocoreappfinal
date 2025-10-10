# City-Hotel-Room CRUD API Documentation

## Overview

This document describes the RESTful API implementation for managing Cities, Hotels, and Rooms in the Eqabo booking system. The API follows a hierarchical data structure: **City > Hotels > Rooms**.

## Base URL

All endpoints are prefixed with `/api/v1`

## Authentication

Most endpoints do not require authentication for read operations. Write operations (POST, PUT, DELETE) may require authentication depending on your deployment configuration.

## Data Hierarchy

1. **City** - Top-level entity representing Ethiopian cities
2. **Hotel** - Belongs to a City
3. **Room** - Belongs to a Hotel

Cascading rules:
- Disabling a city prevents deletion if it has active hotels
- Disabling a hotel prevents deletion if it has reserved rooms
- Rooms can be hard deleted if Available, but reserved rooms cannot be deleted

---

## Cities API

### Create City
```http
POST /api/v1/cities
Content-Type: application/json

{
  "cityName": "Addis Ababa",
  "gps": "9.0320,38.7469"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "cityId": 1,
    "cityName": "Addis Ababa",
    "gps": "9.0320,38.7469",
    "status": "active",
    "created_at": "2025-10-10T19:00:00.000Z",
    "updated_at": "2025-10-10T19:00:00.000Z"
  },
  "message": "City created successfully"
}
```

**Validation Rules**:
- `cityName`: Required, unique, max 100 characters
- `gps`: Required, format: "latitude,longitude" (e.g., "9.0320,38.7469")
- `status`: Auto-set to "active" on creation

**Possible Errors**:
- `400`: Invalid input (missing fields, invalid GPS format, name too long)
- `409`: City name already exists
- `500`: Internal server error

---

### Get All Cities
```http
GET /api/v1/cities?page=1&limit=20
```

**Query Parameters**:
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20, max 100

**Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "cityId": 1,
      "cityName": "Addis Ababa",
      "gps": "9.0320,38.7469",
      "status": "active",
      "created_at": "2025-10-10T19:00:00.000Z",
      "updated_at": "2025-10-10T19:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "totalPages": 1
  }
}
```

---

### Get City by ID
```http
GET /api/v1/cities/{cityId}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "cityId": 1,
    "cityName": "Addis Ababa",
    "gps": "9.0320,38.7469",
    "status": "active",
    "created_at": "2025-10-10T19:00:00.000Z",
    "updated_at": "2025-10-10T19:00:00.000Z",
    "hotels": []
  }
}
```

**Possible Errors**:
- `400`: Invalid city ID format
- `404`: City not found
- `500`: Internal server error

---

### Update City
```http
PUT /api/v1/cities/{cityId}
Content-Type: application/json

{
  "cityName": "Addis Ababa Updated",
  "gps": "9.0330,38.7480",
  "status": "active"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "cityId": 1,
    "cityName": "Addis Ababa Updated",
    "gps": "9.0330,38.7480",
    "status": "active",
    "created_at": "2025-10-10T19:00:00.000Z",
    "updated_at": "2025-10-10T19:05:00.000Z"
  },
  "message": "City updated successfully"
}
```

**Validation Rules**:
- All fields optional
- `cityName` uniqueness is validated if provided
- `gps` format is validated if provided
- `status`: "active" or "disabled"

**Possible Errors**:
- `400`: Invalid input
- `404`: City not found
- `500`: Internal server error

---

### Delete City
```http
DELETE /api/v1/cities/{cityId}
```

**Response (204 No Content)**

**Behavior**:
- Soft delete: Sets status to "disabled"
- Updates `updated_at` timestamp
- Prevents deletion if city has active hotels

**Possible Errors**:
- `404`: City not found
- `409`: Cannot delete city with active hotels
- `500`: Internal server error

---

## Hotels API

### Create Hotel
```http
POST /api/v1/cities/{cityId}/hotels
Content-Type: application/json

{
  "hotelName": "Grand Palace Hotel",
  "address": "Bole Road, Addis Ababa"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "hotelId": 1,
    "cityId": 1,
    "hotelName": "Grand Palace Hotel",
    "address": "Bole Road, Addis Ababa",
    "status": "active",
    "created_at": "2025-10-10T19:00:00.000Z",
    "updated_at": "2025-10-10T19:00:00.000Z"
  },
  "message": "Hotel created successfully"
}
```

**Validation Rules**:
- `hotelName`: Required, max 100 characters
- `address`: Required, max 255 characters
- `cityId`: Must exist and be active
- `status`: Auto-set to "active" on creation

**Possible Errors**:
- `400`: Invalid input
- `404`: City not found or not active
- `500`: Internal server error

---

### Get Hotels by City
```http
GET /api/v1/cities/{cityId}/hotels?page=1&limit=20
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "hotelId": 1,
      "cityId": 1,
      "hotelName": "Grand Palace Hotel",
      "address": "Bole Road, Addis Ababa",
      "status": "active",
      "created_at": "2025-10-10T19:00:00.000Z",
      "updated_at": "2025-10-10T19:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### Get Hotel by ID
```http
GET /api/v1/hotels/{hotelId}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "hotelId": 1,
    "cityId": 1,
    "hotelName": "Grand Palace Hotel",
    "address": "Bole Road, Addis Ababa",
    "status": "active",
    "created_at": "2025-10-10T19:00:00.000Z",
    "updated_at": "2025-10-10T19:00:00.000Z",
    "city": {
      "cityId": 1,
      "cityName": "Addis Ababa"
    },
    "rooms": []
  }
}
```

---

### Update Hotel
```http
PUT /api/v1/hotels/{hotelId}
Content-Type: application/json

{
  "hotelName": "Updated Grand Palace Hotel",
  "address": "Updated Address",
  "status": "active"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "hotelId": 1,
    "hotelName": "Updated Grand Palace Hotel",
    "address": "Updated Address",
    "status": "active",
    "updated_at": "2025-10-10T19:10:00.000Z"
  },
  "message": "Hotel updated successfully"
}
```

---

### Delete Hotel
```http
DELETE /api/v1/hotels/{hotelId}
```

**Response (204 No Content)**

**Behavior**:
- Soft delete: Sets status to "disabled"
- Prevents deletion if hotel has reserved rooms

**Possible Errors**:
- `404`: Hotel not found
- `409`: Cannot delete hotel with reserved rooms
- `500`: Internal server error

---

### Get Hotel Room Status
```http
GET /api/v1/hotels/{hotelId}/room-status?page=1&limit=20
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "totalRooms": 50,
    "available": 30,
    "reserved": 20,
    "rooms": [
      {
        "roomId": 1,
        "roomNumber": "101",
        "status": "Available"
      },
      {
        "roomId": 2,
        "roomNumber": "102",
        "status": "Reserved"
      }
    ]
  }
}
```

---

## Rooms API

### Create Room
```http
POST /api/v1/hotels/{hotelId}/rooms
Content-Type: application/json

{
  "roomNumber": "101",
  "roomType": "double",
  "price": 2500.00
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "roomId": 1,
    "hotelId": 1,
    "roomNumber": "101",
    "roomType": "double",
    "price": 2500.00,
    "status": "Available",
    "created_at": "2025-10-10T19:00:00.000Z",
    "updated_at": "2025-10-10T19:00:00.000Z"
  },
  "message": "Room created successfully"
}
```

**Validation Rules**:
- `roomNumber`: Required, unique per hotel, max 10 characters
- `roomType`: Required, must be one of: "single", "double", "suite"
- `price`: Required, must be positive number
- `hotelId`: Must exist and be active
- `status`: Auto-set to "Available" on creation

**Possible Errors**:
- `400`: Invalid input
- `404`: Hotel not found or not active
- `409`: Room number already exists in this hotel
- `500`: Internal server error

---

### Get Rooms by Hotel
```http
GET /api/v1/hotels/{hotelId}/rooms?page=1&limit=20&status=Available
```

**Query Parameters**:
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status ("Available" or "Reserved")

**Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "roomId": 1,
      "hotelId": 1,
      "roomNumber": "101",
      "roomType": "double",
      "price": 2500.00,
      "status": "Available",
      "created_at": "2025-10-10T19:00:00.000Z",
      "updated_at": "2025-10-10T19:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

---

### Get Room by ID
```http
GET /api/v1/rooms/{roomId}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "roomId": 1,
    "hotelId": 1,
    "roomNumber": "101",
    "roomType": "double",
    "price": 2500.00,
    "status": "Available",
    "created_at": "2025-10-10T19:00:00.000Z",
    "updated_at": "2025-10-10T19:00:00.000Z",
    "hotel": {
      "hotelId": 1,
      "hotelName": "Grand Palace Hotel"
    }
  }
}
```

---

### Update Room
```http
PUT /api/v1/rooms/{roomId}
Content-Type: application/json

{
  "roomNumber": "101A",
  "roomType": "suite",
  "price": 3500.00,
  "status": "Available"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "roomId": 1,
    "roomNumber": "101A",
    "roomType": "suite",
    "price": 3500.00,
    "status": "Available",
    "updated_at": "2025-10-10T19:15:00.000Z"
  },
  "message": "Room updated successfully"
}
```

**Validation Rules**:
- All fields optional
- `roomNumber` uniqueness per hotel is validated if changed
- `roomType` must be valid if provided
- `price` must be positive if provided
- `status`: "Available" or "Reserved"

---

### Delete Room
```http
DELETE /api/v1/rooms/{roomId}
```

**Response (204 No Content)**

**Behavior**:
- Hard delete if status is "Available"
- Prevents deletion if status is "Reserved"

**Possible Errors**:
- `404`: Room not found
- `409`: Cannot delete reserved room
- `500`: Internal server error

---

## Database Seeding

### Seed Ethiopian Cities and Hotels
```bash
# Seed all cities, hotels, and rooms
npm run seed:ts cities

# View summary of seeded data
npm run seed:ts summary
```

**Ethiopian Cities Included** (10 cities):
- Addis Ababa
- Bahir Dar
- Gondar
- Hawassa
- Dire Dawa
- Mekelle
- Adama
- Lalibela
- Jimma
- Arba Minch

**Hotels Included** (15 hotels across Ethiopian cities):
- Skylight Hotel Addis (Addis Ababa)
- Capital Grand Hotel (Addis Ababa)
- Radisson Blu Hotel (Addis Ababa)
- Blue Nile Resort (Bahir Dar)
- Kuriftu Resort & Spa (Bahir Dar)
- Goha Hotel Gondar (Gondar)
- Rift Valley Lodge (Hawassa)
- Mountain View Inn (Lalibela)
- And more...

**Rooms Included** (20+ rooms with various types and prices)

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Detailed error message",
  "error": "ERROR_CODE"
}
```

**Common Error Codes**:
- `BAD_REQUEST`: Invalid input data (400)
- `NOT_FOUND`: Resource not found (404)
- `CONFLICT`: Duplicate resource or constraint violation (409)
- `INTERNAL_SERVER_ERROR`: Server error (500)

---

## Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run specific test file
npm test city.test.ts
npm test hotel.test.ts
npm test room.test.ts
```

**Test Coverage**:
- ✅ 60+ test cases
- ✅ All CRUD operations
- ✅ Input validation
- ✅ Error scenarios (400, 404, 409, 500)
- ✅ Data relationships and constraints
- ✅ Edge cases

---

## Swagger/OpenAPI Documentation

Interactive API documentation is available at:

```
http://localhost:3000/api-docs
```

This provides:
- Complete API reference
- Request/response schemas
- Try-it-out functionality
- Authentication testing

---

## Logging

All operations are logged with timestamps:

```
[2025-10-10T19:00:00.000Z] Creating city: Addis Ababa at 9.0320,38.7469
[2025-10-10T19:00:00.100Z] City created successfully: ID 1
[2025-10-10T19:00:01.000Z] Fetching cities: page=1, limit=20
```

---

## Best Practices

1. **GPS Format**: Always use "latitude,longitude" format (e.g., "9.0320,38.7469")
2. **Pagination**: Use page and limit parameters for large datasets
3. **Status Management**: Use soft deletes (status = "disabled") for data integrity
4. **Unique Constraints**: Room numbers are unique per hotel, not globally
5. **Error Handling**: Always check response status and handle errors appropriately
6. **Data Validation**: All inputs are validated server-side

---

## Migration

To set up the database schema:

```bash
# Run migrations
npm run migration:run

# Revert migrations
npm run migration:revert
```

The migration creates:
- `cities` table with auto-incrementing ID
- `hotels` table with foreign key to cities
- `rooms` table with foreign key to hotels
- Proper indexes and constraints
- Enum types for status and room types

---

## Contributing

When adding new features:
1. Update entity models with proper validation
2. Create/update services for business logic
3. Create/update controllers for HTTP handling
4. Update routes with Swagger documentation
5. Add comprehensive tests
6. Update this documentation
7. Run `npm run build` to verify compilation
8. Run `npm test` to verify tests pass

---

## License

This API is part of the Eqabo Hotel Booking System.

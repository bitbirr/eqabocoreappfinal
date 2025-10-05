# 📚 OpenAPI Specification Guide

## Overview

This document provides comprehensive guidelines for the Eqabo Hotel Booking API's OpenAPI 3.0 specification. It covers best practices, standards, and improvements to ensure the API is developer-friendly and follows RESTful design principles.

---

## 1. OpenAPI 3.0 Specification Structure

### 1.1 Complete OpenAPI Document

```yaml
openapi: 3.0.3
info:
  title: Eqabo Hotel Booking API
  version: 1.0.0
  description: |
    # Eqabo Hotel Booking Platform API
    
    A comprehensive hotel booking API designed for the Ethiopian market, featuring:
    - 🔐 JWT-based authentication
    - 🏨 Hotel and room management
    - 📅 Intelligent booking system
    - 💳 Multi-gateway payment processing
    - 🇪🇹 Ethiopian payment integration (Chapa, TeleBirr, eBirr, Kaafi)
    
    ## Getting Started
    
    1. **Register** an account via `/api/auth/register`
    2. **Login** to receive a JWT token via `/api/auth/login`
    3. **Authorize** your requests using the Bearer token
    4. **Explore** hotels, create bookings, and process payments
    
    ## Authentication
    
    All protected endpoints require a Bearer token in the Authorization header:
    ```
    Authorization: Bearer <your-jwt-token>
    ```
    
    ## Rate Limiting
    
    - Authentication endpoints: 5 requests per 15 minutes per IP
    - Other endpoints: 100 requests per minute per user
    
    ## Response Format
    
    All responses follow this structure:
    ```json
    {
      "success": true|false,
      "message": "Human-readable message",
      "data": { ... },
      "error": "Error message (if success=false)"
    }
    ```
    
  contact:
    name: Eqabo API Support
    email: support@eqabo.com
    url: https://eqabo.com/support
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT
  termsOfService: https://eqabo.com/terms

servers:
  - url: http://localhost:3000
    description: Development server
  - url: https://staging.eqabo.com
    description: Staging server
  - url: https://api.eqabo.com
    description: Production server

externalDocs:
  description: Full documentation and guides
  url: https://docs.eqabo.com

tags:
  - name: Authentication
    description: User registration, login, and session management
  - name: Hotels
    description: Hotel search, listing, and management
  - name: Rooms
    description: Room inventory and availability management
  - name: Bookings
    description: Reservation creation and management
  - name: Payments
    description: Payment processing and transaction management
  - name: Health
    description: System health and status endpoints

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: |
        JWT token obtained from the login endpoint.
        
        **Example**: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

  schemas:
    # Common Schemas
    Error:
      type: object
      required:
        - success
        - error
      properties:
        success:
          type: boolean
          example: false
          description: Always false for errors
        error:
          type: string
          example: "Invalid credentials"
          description: Human-readable error message
        code:
          type: string
          example: "AUTH_001"
          description: Machine-readable error code

    SuccessResponse:
      type: object
      required:
        - success
        - message
      properties:
        success:
          type: boolean
          example: true
          description: Always true for successful responses
        message:
          type: string
          example: "Operation completed successfully"
          description: Human-readable success message
        data:
          type: object
          description: Response payload

    Pagination:
      type: object
      properties:
        total:
          type: integer
          example: 150
          description: Total number of items
        limit:
          type: integer
          example: 20
          description: Items per page
        offset:
          type: integer
          example: 0
          description: Number of items to skip
        has_more:
          type: boolean
          example: true
          description: Whether more items exist

    # Entity Schemas
    User:
      type: object
      required:
        - id
        - first_name
        - last_name
        - phone
        - role
      properties:
        id:
          type: string
          format: uuid
          example: "550e8400-e29b-41d4-a716-446655440000"
          description: Unique user identifier
        first_name:
          type: string
          minLength: 1
          maxLength: 50
          example: "Abebe"
          description: User's first name
        last_name:
          type: string
          minLength: 1
          maxLength: 50
          example: "Kebede"
          description: User's last name
        phone:
          type: string
          pattern: '^\+251[79]\d{8}$'
          example: "+251911234567"
          description: Ethiopian phone number in international format
        email:
          type: string
          format: email
          example: "abebe@example.com"
          description: User's email address (optional)
        role:
          type: string
          enum: [admin, hotel_owner]
          example: "hotel_owner"
          description: User role for access control
        created_at:
          type: string
          format: date-time
          example: "2024-01-01T12:00:00Z"
          description: Account creation timestamp
        updated_at:
          type: string
          format: date-time
          example: "2024-01-15T12:00:00Z"
          description: Last update timestamp

    Hotel:
      type: object
      required:
        - id
        - name
        - city
        - address
        - owner_id
      properties:
        id:
          type: string
          format: uuid
          example: "550e8400-e29b-41d4-a716-446655440100"
          description: Unique hotel identifier
        name:
          type: string
          minLength: 3
          maxLength: 100
          example: "Skylight Hotel"
          description: Hotel name
        description:
          type: string
          maxLength: 1000
          example: "Luxury hotel in the heart of Addis Ababa"
          description: Hotel description
        address:
          type: string
          maxLength: 200
          example: "Bole Road, Addis Ababa"
          description: Physical address
        city:
          type: string
          maxLength: 50
          example: "Addis Ababa"
          description: City location
        phone:
          type: string
          pattern: '^\+251[179]\d{8}$'
          example: "+251115551234"
          description: Hotel contact phone
        email:
          type: string
          format: email
          example: "info@skylight.com"
          description: Hotel contact email
        rating:
          type: number
          format: float
          minimum: 0
          maximum: 5
          example: 4.5
          description: Average rating (0-5 stars)
        status:
          type: string
          enum: [active, inactive, pending]
          example: "active"
          description: Hotel operational status
        amenities:
          type: array
          items:
            type: string
          example: ["WiFi", "Pool", "Gym", "Restaurant"]
          description: Available amenities
        images:
          type: array
          items:
            type: string
            format: uri
          example: ["https://cdn.eqabo.com/hotels/skylight/main.jpg"]
          description: Hotel images
        owner_id:
          type: string
          format: uuid
          example: "550e8400-e29b-41d4-a716-446655440002"
          description: Hotel owner user ID
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    Room:
      type: object
      required:
        - id
        - hotel_id
        - room_type
        - price_per_night
        - capacity
      properties:
        id:
          type: string
          format: uuid
          example: "550e8400-e29b-41d4-a716-446655440200"
          description: Unique room identifier
        hotel_id:
          type: string
          format: uuid
          example: "550e8400-e29b-41d4-a716-446655440100"
          description: Parent hotel ID
        room_type:
          type: string
          example: "Deluxe Suite"
          description: Type of room
        price_per_night:
          type: number
          format: decimal
          minimum: 0
          example: 2500.00
          description: Price in Ethiopian Birr (ETB)
        capacity:
          type: integer
          minimum: 1
          maximum: 10
          example: 2
          description: Maximum number of guests
        description:
          type: string
          maxLength: 500
          example: "Spacious room with king bed and city view"
          description: Room description
        amenities:
          type: array
          items:
            type: string
          example: ["King Bed", "City View", "Mini Bar", "WiFi"]
          description: Room-specific amenities
        status:
          type: string
          enum: [available, booked, maintenance]
          example: "available"
          description: Current room status
        images:
          type: array
          items:
            type: string
            format: uri
          example: ["https://cdn.eqabo.com/rooms/deluxe/1.jpg"]
          description: Room images
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    Booking:
      type: object
      required:
        - id
        - user_id
        - hotel_id
        - room_id
        - check_in_date
        - check_out_date
        - guest_count
        - total_amount
        - status
      properties:
        id:
          type: string
          format: uuid
          example: "550e8400-e29b-41d4-a716-446655440300"
          description: Unique booking identifier
        user_id:
          type: string
          format: uuid
          description: User who made the booking
        hotel_id:
          type: string
          format: uuid
          description: Booked hotel
        room_id:
          type: string
          format: uuid
          description: Booked room
        check_in_date:
          type: string
          format: date
          example: "2025-10-01"
          description: Check-in date (YYYY-MM-DD)
        check_out_date:
          type: string
          format: date
          example: "2025-10-03"
          description: Check-out date (YYYY-MM-DD)
        guest_count:
          type: integer
          minimum: 1
          example: 2
          description: Number of guests
        guest_name:
          type: string
          example: "Abebe Kebede"
          description: Primary guest name
        guest_email:
          type: string
          format: email
          example: "abebe@example.com"
          description: Guest contact email
        guest_phone:
          type: string
          pattern: '^\+251[79]\d{8}$'
          example: "+251911234567"
          description: Guest contact phone
        special_requests:
          type: string
          maxLength: 500
          example: "Late check-in please"
          description: Special requests or notes
        nights:
          type: integer
          minimum: 1
          example: 2
          description: Number of nights (auto-calculated)
        total_amount:
          type: number
          format: decimal
          minimum: 0
          example: 5000.00
          description: Total booking amount in ETB
        status:
          type: string
          enum: [pending, confirmed, completed, cancelled]
          example: "confirmed"
          description: Current booking status
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    Payment:
      type: object
      required:
        - id
        - booking_id
        - amount
        - provider
        - status
      properties:
        id:
          type: string
          format: uuid
          example: "550e8400-e29b-41d4-a716-446655440400"
          description: Unique payment identifier
        booking_id:
          type: string
          format: uuid
          description: Related booking
        amount:
          type: number
          format: decimal
          minimum: 0
          example: 5000.00
          description: Payment amount in ETB
        provider:
          type: string
          enum: [chapa, telebirr, ebirr, kaafi]
          example: "chapa"
          description: Payment gateway provider
        provider_reference:
          type: string
          example: "CHAPA-TX-123456789"
          description: Payment provider's transaction reference
        status:
          type: string
          enum: [pending, completed, failed, refunded]
          example: "completed"
          description: Payment status
        paid_at:
          type: string
          format: date-time
          nullable: true
          description: Payment completion timestamp
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

  # Request Schemas
  parameters:
    hotelId:
      name: id
      in: path
      required: true
      schema:
        type: string
        format: uuid
      description: Hotel unique identifier
      example: "550e8400-e29b-41d4-a716-446655440100"

    bookingId:
      name: id
      in: path
      required: true
      schema:
        type: string
        format: uuid
      description: Booking unique identifier
      example: "550e8400-e29b-41d4-a716-446655440300"

    limit:
      name: limit
      in: query
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 20
      description: Number of items to return
      example: 20

    offset:
      name: offset
      in: query
      schema:
        type: integer
        minimum: 0
        default: 0
      description: Number of items to skip
      example: 0

  # Response Templates
  responses:
    Unauthorized:
      description: Authentication required or invalid token
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            success: false
            error: "Access token is required"

    Forbidden:
      description: Insufficient permissions
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            success: false
            error: "Access denied. Required role: admin"

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            success: false
            error: "Hotel not found"

    BadRequest:
      description: Invalid request parameters
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            success: false
            error: "Invalid phone number format"

    ServerError:
      description: Internal server error
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            success: false
            error: "Internal server error"

# Apply security globally (can be overridden per endpoint)
security:
  - bearerAuth: []
```

---

## 2. API Design Best Practices

### 2.1 RESTful Resource Naming

#### ✅ Correct Patterns
```
GET    /api/hotels              # List hotels (collection)
POST   /api/hotels              # Create hotel
GET    /api/hotels/{id}         # Get hotel (resource)
PUT    /api/hotels/{id}         # Update hotel
DELETE /api/hotels/{id}         # Delete hotel

GET    /api/hotels/{id}/rooms   # Nested resource
GET    /api/bookings/{id}/payments  # Related resources
```

#### ❌ Avoid
```
GET /api/getAllHotels           # Not RESTful
POST /api/createHotel           # Verb in URL
GET /api/hotel/{id}             # Inconsistent (singular vs plural)
GET /api/hotels/list            # Redundant action
```

### 2.2 HTTP Status Codes

| Code | Use Case | Example |
|------|----------|---------|
| **200** | Successful GET, PUT, PATCH | Retrieved hotel details |
| **201** | Successful POST (created) | Hotel created |
| **204** | Successful DELETE (no content) | Hotel deleted |
| **400** | Bad request / validation error | Invalid phone format |
| **401** | Authentication required | Missing token |
| **403** | Forbidden / insufficient permissions | Not hotel owner |
| **404** | Resource not found | Hotel ID doesn't exist |
| **409** | Conflict | Room already booked |
| **422** | Unprocessable entity | Business logic failure |
| **429** | Too many requests | Rate limit exceeded |
| **500** | Internal server error | Database connection failed |
| **503** | Service unavailable | Maintenance mode |

### 2.3 Query Parameters

#### Filtering
```
GET /api/hotels?city=Addis Ababa
GET /api/hotels?status=active&rating_min=4
GET /api/bookings?status=confirmed&user_id={id}
```

#### Sorting
```
GET /api/hotels?sort=rating&order=desc
GET /api/bookings?sort=created_at&order=asc
```

#### Pagination
```
GET /api/hotels?limit=20&offset=0
GET /api/hotels?page=1&per_page=20
```

#### Field Selection
```
GET /api/hotels?fields=id,name,rating
GET /api/hotels?include=rooms,owner
```

### 2.4 Request/Response Consistency

#### Standard Request Body
```json
{
  "field_name": "value",
  "nested_object": {
    "sub_field": "value"
  },
  "array_field": ["item1", "item2"]
}
```

#### Standard Success Response
```json
{
  "success": true,
  "message": "Hotel created successfully",
  "data": {
    "hotel": {
      "id": "uuid",
      "name": "Skylight Hotel",
      ...
    }
  }
}
```

#### Standard Error Response
```json
{
  "success": false,
  "error": "Invalid phone number format",
  "code": "VALIDATION_001",
  "details": {
    "field": "phone",
    "expected": "+251XXXXXXXXX",
    "received": "0911234567"
  }
}
```

---

## 3. Versioning Strategy

### 3.1 URL Versioning (Recommended)

```
# Current Implementation
/api/hotels

# Future versioned API
/api/v1/hotels
/api/v2/hotels

# Version in header (alternative)
Accept: application/vnd.eqabo.v1+json
```

### 3.2 Deprecation Strategy

```yaml
/api/v1/hotels:
  get:
    deprecated: true
    description: |
      ⚠️ **DEPRECATED**: This endpoint will be removed in v3.
      Please use `/api/v2/hotels` instead.
    x-sunset-date: "2025-12-31"
```

---

## 4. Error Handling Standards

### 4.1 Error Code System

```javascript
// Authentication Errors (AUTH_xxx)
AUTH_001: "Invalid credentials"
AUTH_002: "Token expired"
AUTH_003: "Insufficient permissions"

// Validation Errors (VAL_xxx)
VAL_001: "Missing required field"
VAL_002: "Invalid format"
VAL_003: "Value out of range"

// Business Logic Errors (BIZ_xxx)
BIZ_001: "Room not available"
BIZ_002: "Booking overlap detected"
BIZ_003: "Payment already processed"

// System Errors (SYS_xxx)
SYS_001: "Database connection failed"
SYS_002: "External service timeout"
SYS_003: "Rate limit exceeded"
```

### 4.2 Error Response Schema

```yaml
components:
  schemas:
    DetailedError:
      type: object
      required:
        - success
        - error
        - code
      properties:
        success:
          type: boolean
          example: false
        error:
          type: string
          example: "Room not available for selected dates"
        code:
          type: string
          example: "BIZ_001"
        details:
          type: object
          description: Additional error context
          properties:
            field:
              type: string
              example: "check_in_date"
            reason:
              type: string
              example: "Room already booked"
            suggested_dates:
              type: array
              items:
                type: string
                format: date
              example: ["2025-10-05", "2025-10-06"]
        timestamp:
          type: string
          format: date-time
          example: "2025-01-15T10:30:00Z"
        request_id:
          type: string
          format: uuid
          example: "550e8400-e29b-41d4-a716-446655440999"
          description: For support and debugging
```

---

## 5. Authentication & Security

### 5.1 JWT Authentication

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: |
        JWT token with 7-day expiry.
        
        **Obtain token**:
        1. Register: POST /api/auth/register
        2. Login: POST /api/auth/login
        
        **Token structure**:
        ```json
        {
          "user_id": "uuid",
          "phone": "+251911234567",
          "role": "hotel_owner",
          "iat": 1234567890,
          "exp": 1234567890
        }
        ```
        
        **Usage**:
        ```
        Authorization: Bearer <token>
        ```
```

### 5.2 Rate Limiting

```yaml
paths:
  /api/auth/login:
    post:
      summary: User login
      description: |
        Authenticate user and receive JWT token.
        
        **Rate Limit**: 5 requests per 15 minutes per IP address
      x-rate-limit:
        limit: 5
        window: 900
        key: "ip"
      responses:
        429:
          description: Too many login attempts
          headers:
            X-RateLimit-Limit:
              schema:
                type: integer
              description: Maximum requests allowed
            X-RateLimit-Remaining:
              schema:
                type: integer
              description: Requests remaining
            X-RateLimit-Reset:
              schema:
                type: integer
              description: Seconds until limit resets
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
```

### 5.3 CORS Configuration

```yaml
servers:
  - url: https://api.eqabo.com
    description: Production API
    x-cors:
      allowOrigins:
        - https://eqabo.com
        - https://www.eqabo.com
        - https://admin.eqabo.com
      allowMethods:
        - GET
        - POST
        - PUT
        - DELETE
        - OPTIONS
      allowHeaders:
        - Authorization
        - Content-Type
      maxAge: 3600
```

---

## 6. Pagination Standards

### 6.1 Offset-Based Pagination

```yaml
paths:
  /api/hotels:
    get:
      summary: List hotels
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
          description: Items per page
        - name: offset
          in: query
          schema:
            type: integer
            minimum: 0
            default: 0
          description: Items to skip
      responses:
        200:
          description: Hotels retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  data:
                    type: object
                    properties:
                      hotels:
                        type: array
                        items:
                          $ref: '#/components/schemas/Hotel'
                      pagination:
                        type: object
                        properties:
                          total:
                            type: integer
                            example: 150
                          limit:
                            type: integer
                            example: 20
                          offset:
                            type: integer
                            example: 0
                          has_more:
                            type: boolean
                            example: true
```

### 6.2 Cursor-Based Pagination (Future)

```yaml
# For real-time data or large datasets
parameters:
  - name: cursor
    in: query
    schema:
      type: string
    description: Pagination cursor from previous response
  - name: limit
    in: query
    schema:
      type: integer
      default: 20
```

---

## 7. Documentation Best Practices

### 7.1 Endpoint Documentation Template

```yaml
paths:
  /api/hotels/{id}:
    get:
      summary: Get hotel details
      description: |
        Retrieve detailed information about a specific hotel by ID.
        
        **Access**: Public (no authentication required)
        
        **Response includes**:
        - Hotel information (name, address, amenities)
        - Average rating and review count
        - Owner information
        - Available room types
        
        **Use cases**:
        - Display hotel details page
        - Show hotel in search results
        - Verify hotel information before booking
        
      tags:
        - Hotels
      operationId: getHotelById
      security: []  # Override global security for public endpoint
      parameters:
        - $ref: '#/components/parameters/hotelId'
      responses:
        200:
          description: Hotel retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  data:
                    type: object
                    properties:
                      hotel:
                        $ref: '#/components/schemas/Hotel'
              examples:
                skylight_hotel:
                  summary: Skylight Hotel Example
                  value:
                    success: true
                    data:
                      hotel:
                        id: "550e8400-e29b-41d4-a716-446655440100"
                        name: "Skylight Hotel"
                        city: "Addis Ababa"
                        rating: 4.5
                        amenities: ["WiFi", "Pool", "Gym"]
        404:
          $ref: '#/components/responses/NotFound'
        500:
          $ref: '#/components/responses/ServerError'
```

### 7.2 Code Examples

Include code examples for common languages:

```yaml
x-code-samples:
  - lang: 'curl'
    source: |
      curl -X POST https://api.eqabo.com/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{
          "phone": "+251911234567",
          "password": "YourPassword123"
        }'
  
  - lang: 'JavaScript'
    source: |
      const response = await fetch('https://api.eqabo.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: '+251911234567',
          password: 'YourPassword123'
        })
      });
      const data = await response.json();
      const token = data.data.token;
  
  - lang: 'Python'
    source: |
      import requests
      
      response = requests.post(
        'https://api.eqabo.com/api/auth/login',
        json={
          'phone': '+251911234567',
          'password': 'YourPassword123'
        }
      )
      token = response.json()['data']['token']
```

---

## 8. Validation & Testing

### 8.1 OpenAPI Validation Tools

```bash
# Install Spectral (OpenAPI linter)
npm install -g @stoplight/spectral-cli

# Validate OpenAPI spec
spectral lint openapi.yaml --ruleset spectral:oas

# Custom rules for Eqabo
# .spectral.yaml
extends: [[spectral:oas, all]]
rules:
  eqabo-error-response:
    description: Errors must include success=false and error message
    given: $.paths..responses[4xx,5xx].content..schema
    then:
      - field: properties.success
        function: truthy
      - field: properties.error
        function: truthy
```

### 8.2 Schema Validation

All request/response bodies must validate against defined schemas:

```typescript
// Example validation middleware
import { ValidateFunction } from 'ajv';

function validateSchema(schema: ValidateFunction) {
  return (req, res, next) => {
    const valid = schema(req.body);
    if (!valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: schema.errors
      });
    }
    next();
  };
}
```

---

## 9. Improvement Recommendations

### 9.1 Current State Analysis

**Strengths**:
- ✅ OpenAPI 3.0 compliant
- ✅ JWT authentication documented
- ✅ Basic schemas defined
- ✅ Swagger UI integrated

**Areas for Improvement**:
- 🔄 Add more detailed error responses
- 🔄 Include code examples in documentation
- 🔄 Add request/response examples for all endpoints
- 🔄 Implement versioning strategy
- 🔄 Add pagination documentation
- 🔄 Document rate limiting explicitly
- 🔄 Add webhook documentation for payments

### 9.2 Recommended Enhancements

#### Enhancement 1: Webhooks Documentation

```yaml
webhooks:
  paymentConfirmation:
    post:
      summary: Payment confirmation webhook
      description: |
        Eqabo will send a POST request to your configured webhook URL
        when a payment is processed.
        
        **Setup**: Configure webhook URL in hotel settings
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                event:
                  type: string
                  example: "payment.confirmed"
                booking_id:
                  type: string
                  format: uuid
                payment:
                  $ref: '#/components/schemas/Payment'
      responses:
        200:
          description: Webhook received successfully
```

#### Enhancement 2: API Changelog

```yaml
info:
  x-changelog:
    - version: "1.0.0"
      date: "2025-01-01"
      changes:
        - "Initial API release"
        - "Authentication with JWT"
        - "Hotel and room management"
        - "Booking and payment processing"
```

#### Enhancement 3: Response Time SLA

```yaml
info:
  x-sla:
    uptime: "99.9%"
    response_times:
      p50: "< 200ms"
      p95: "< 500ms"
      p99: "< 1000ms"
```

---

## 10. Developer Experience

### 10.1 Interactive Documentation

Swagger UI features to enable:
- ✅ "Try it out" functionality
- ✅ Bearer token persistence
- ✅ Request duration display
- ✅ Full request/response logging
- ✅ Schema expansion
- ✅ Search/filter endpoints

### 10.2 Postman Collection Generation

```bash
# Generate Postman collection from OpenAPI
npm install -g openapi-to-postmanv2

# Convert
openapi2postmanv2 -s openapi.yaml -o postman-collection.json -p -O folderStrategy=Tags
```

### 10.3 SDK Generation

```bash
# Generate client SDKs
npm install -g @openapitools/openapi-generator-cli

# Generate JavaScript/TypeScript SDK
openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-axios \
  -o sdk/typescript

# Generate Python SDK
openapi-generator-cli generate \
  -i openapi.yaml \
  -g python \
  -o sdk/python
```

---

## 11. Conclusion

This OpenAPI specification guide provides a comprehensive framework for maintaining and improving the Eqabo Hotel Booking API documentation. By following these standards and best practices, we ensure:

- **Consistency**: Uniform API design across all endpoints
- **Developer-Friendly**: Clear documentation with examples
- **Maintainability**: Well-structured schemas and references
- **Scalability**: Versioning and deprecation strategies
- **Quality**: Validation tools and testing guidelines

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Maintained By**: Eqabo API Team

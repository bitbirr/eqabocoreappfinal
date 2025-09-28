# Eqabo Hotel Booking API - Postman Collection

This directory contains a comprehensive Postman collection for testing the Eqabo Hotel Booking API with complete JWT authentication flow and all endpoints.

## 📁 Files Included

- `Eqabo-Hotel-Booking-API.postman_collection.json` - Main collection with all API endpoints
- `Eqabo-Hotel-Booking-Environment.postman_environment.json` - Environment variables
- `README.md` - This documentation file

## 🚀 Quick Start

### 1. Import Collection and Environment

1. Open Postman
2. Click **Import** button
3. Import both files:
   - `Eqabo-Hotel-Booking-API.postman_collection.json`
   - `Eqabo-Hotel-Booking-Environment.postman_environment.json`
4. Select the **Eqabo Hotel Booking Environment** from the environment dropdown

### 2. Start the API Server

Ensure your API server is running:
```bash
cd c:\eqabo-core-app
npm run dev
```

The server should be running on `http://localhost:3000`

## 🔐 Authentication Flow (Step-by-Step)

### Step 1: Register a New User

1. Navigate to **Authentication** → **Register User**
2. The request body contains sample data:
   ```json
   {
     "first_name": "Abebe",
     "last_name": "Kebede",
     "phone": "+251911123456",
     "password": "SecurePassword123!",
     "role": "hotel_owner"
   }
   ```
3. Click **Send**
4. ✅ **Success**: JWT token is automatically stored in environment variables
5. ✅ **User ID** is also stored for future requests

### Step 2: Login (Alternative to Registration)

If you already have an account:

1. Navigate to **Authentication** → **Login User**
2. Use existing credentials:
   ```json
   {
     "phone": "+251911123456",
     "password": "SecurePassword123!"
   }
   ```
3. Click **Send**
4. ✅ **JWT token** automatically stored and ready for use

### Step 3: Test Protected Endpoints

Once authenticated, you can access protected endpoints:

1. **Get User Profile** - View current user information
2. **Refresh Token** - Get a new JWT token
3. **Validate Token** - Check if current token is valid

## 🏨 Hotel Management Workflow

### Step 1: Search Hotels

1. Navigate to **Hotels** → **Search Hotels by City**
2. Default search for "Addis Ababa" with pagination
3. Modify query parameters as needed:
   - `city`: City name to search
   - `limit`: Number of results (default: 10)
   - `offset`: Skip results (default: 0)

### Step 2: Check Room Availability

1. Navigate to **Hotels** → **Get Room Availability**
2. Default search for hotel ID 1 with check-in/out dates
3. Modify parameters:
   - Hotel ID in URL path
   - `checkin`: Check-in date (YYYY-MM-DD)
   - `checkout`: Check-out date (YYYY-MM-DD)

## 🎫 Booking Workflow

### Step 1: Create a Booking

1. **Prerequisites**: Must be authenticated (JWT token required)
2. Navigate to **Bookings** → **Create Booking**
3. Sample booking data:
   ```json
   {
     "room_id": 1,
     "check_in_date": "2025-10-01",
     "check_out_date": "2025-10-03",
     "guest_name": "Abebe Kebede",
     "guest_email": "abebe.kebede@example.com",
     "guest_phone": "+251911123456",
     "special_requests": "Late check-in requested, non-smoking room preferred"
   }
   ```
4. Click **Send**
5. ✅ **Booking ID** automatically stored for payment processing

### Step 2: View Booking Details

1. Navigate to **Bookings** → **Get Booking Details**
2. Uses the stored `booking_id` from previous step
3. Returns complete booking information with room and hotel details

## 💳 Payment Workflow

### Step 1: Initiate Payment

1. **Prerequisites**: Must have a valid booking (booking_id required)
2. Navigate to **Payments** → **Initiate Payment**
3. Sample payment data:
   ```json
   {
     "booking_id": {{booking_id}},
     "payment_provider": "chapa"
   }
   ```
4. Click **Send**
5. ✅ **Payment ID** and **Transaction Reference** automatically stored

### Step 2: Simulate Payment Callback

1. Navigate to **Payments** → **Payment Callback**
2. This simulates the payment gateway callback:
   ```json
   {
     "transaction_reference": "{{transaction_reference}}",
     "status": "completed",
     "amount": 5000.00,
     "currency": "ETB",
     "provider_transaction_id": "chapa_txn_1234567890"
   }
   ```
3. Click **Send**

### Step 3: Check Payment Status

1. Navigate to **Payments** → **Get Payment Status**
2. Uses stored `payment_id` to check current status
3. Returns payment details with booking information

## 🔧 Environment Variables

The collection uses these environment variables (automatically managed):

| Variable | Description | Auto-Set |
|----------|-------------|----------|
| `base_url` | API base URL | ✅ |
| `jwt_token` | JWT authentication token | ✅ |
| `user_id` | Current user ID | ✅ |
| `booking_id` | Last created booking ID | ✅ |
| `payment_id` | Last created payment ID | ✅ |
| `transaction_reference` | Payment transaction reference | ✅ |

### Manual Environment Variables

You can also set these for testing:

| Variable | Example Value | Purpose |
|----------|---------------|---------|
| `test_email` | test.user@example.com | Testing email |
| `test_password` | TestPassword123! | Testing password |
| `test_phone` | +251911123456 | Testing phone number |
| `test_hotel_id` | 1 | Testing hotel ID |
| `test_room_id` | 1 | Testing room ID |

## 🧪 Testing Features

### Automatic JWT Token Management

- **Pre-request Script**: Automatically adds JWT token to protected endpoints
- **Test Scripts**: Validate responses and extract important data
- **Token Storage**: Automatically stores tokens after login/registration
- **Token Cleanup**: Removes tokens after logout

### Response Validation

Each request includes comprehensive tests:

- ✅ Status code validation
- ✅ Response structure validation
- ✅ Data type validation
- ✅ Performance testing (response time < 5s)
- ✅ Content-Type header validation

### Error Handling

- 🔍 Automatic error logging in console
- 📊 Response time tracking
- 🚨 Failed request debugging information

## 📋 Complete Testing Sequence

Follow this sequence for a complete API test:

1. **Health Check** - Verify API is running
2. **Register User** - Create new account (JWT auto-stored)
3. **Get User Profile** - Verify authentication works
4. **Search Hotels** - Find available hotels
5. **Get Room Availability** - Check specific hotel rooms
6. **Create Booking** - Make a reservation (booking_id auto-stored)
7. **Get Booking Details** - Verify booking was created
8. **Initiate Payment** - Start payment process (payment_id auto-stored)
9. **Payment Callback** - Simulate payment completion
10. **Get Payment Status** - Verify payment was processed
11. **Logout** - Clean up session (tokens auto-removed)

## 🛠️ Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Ensure you're logged in (JWT token present)
   - Check if token has expired (try refreshing)

2. **404 Not Found**
   - Verify API server is running on localhost:3000
   - Check endpoint URLs match your API routes

3. **400 Bad Request**
   - Validate request body format
   - Check required fields are present
   - Verify data types match API expectations

4. **Environment Variables Not Set**
   - Ensure environment is selected in Postman
   - Check if auto-extraction scripts ran successfully
   - Manually set variables if needed

### Debug Tips

- Check **Console** tab in Postman for debug logs
- Use **Tests** tab to see which validations passed/failed
- Review **Headers** tab to verify JWT token is being sent
- Check **Pre-request Script** tab for token management logic

## 🔗 API Documentation

For detailed API documentation, visit: `http://localhost:3000/api/docs`

## 📞 Support

If you encounter issues:

1. Check the API server logs
2. Verify database connectivity
3. Ensure all environment variables are properly set
4. Review the Postman console for error details

---

**Happy Testing! 🚀**
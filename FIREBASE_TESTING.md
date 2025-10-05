# Testing Firebase Backend Endpoints

This guide provides instructions for testing the newly implemented Firebase backend endpoints.

## Prerequisites

1. Ensure the server is running:
   ```bash
   npm run dev
   ```

2. Have a valid user account and JWT token. If you don't have one:
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "first_name": "Test",
       "last_name": "User",
       "phone": "+251927802065",
       "password": "TestPass123",
       "role": "customer"
     }'
   ```

   Save the `token` from the response.

## Test Endpoints

### 1. Get Firebase Custom Token

**Endpoint**: `POST /api/auth/firebase`

**Test**:
```bash
curl -X POST http://localhost:3000/api/auth/firebase \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response** (if Firebase is configured):
```json
{
  "success": true,
  "message": "Firebase custom token generated successfully",
  "data": {
    "customToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": "user-uuid",
    "role": "customer",
    "expiresIn": "1h"
  }
}
```

**Expected Response** (if Firebase is NOT configured):
```json
{
  "success": false,
  "error": "Firebase service is not available"
}
```

### 2. Update FCM Token

**Endpoint**: `POST /api/users/fcm-token`

**Test**:
```bash
curl -X POST http://localhost:3000/api/users/fcm-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "fcmToken": "fGxK7nHqRY6vZ8hC3mN1pQrS9tUvWxYz2aBcDeFgHiJkLmNoPqRsTuVwXyZ0"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "FCM token updated successfully",
  "data": {
    "userId": "user-uuid"
  }
}
```

**Verification**:
You can verify the FCM token was stored by checking your user profile:
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

The response won't include the FCM token (for security), but it's stored in the database.

### 3. Test Firestore Sync (via Booking Creation)

**Endpoint**: `POST /api/bookings`

**Prerequisites**:
- Have a valid hotel and room ID
- Firebase must be configured for Firestore sync

**Test**:
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "John Doe",
    "phone": "+251927802065",
    "hotelId": "YOUR_HOTEL_ID",
    "roomId": "YOUR_ROOM_ID",
    "checkIn": "2025-10-01",
    "checkOut": "2025-10-03"
  }'
```

**What Happens**:
1. Booking is created in PostgreSQL
2. Booking is synced to Firestore (if Firebase is configured)
3. FCM notification is sent (if user has FCM token)

**Verification**:
Check the server logs for:
```
Successfully synced booking to Firestore: <booking-id>
Successfully sent FCM notification: <message-id>
```

If Firebase is not configured, you'll see:
```
Firebase is not initialized, skipping Firestore sync
Firebase is not initialized, skipping notification
```

### 4. Test FCM Notification (via Payment)

**Endpoint**: `POST /api/payments/callback`

**Prerequisites**:
- Have an existing booking
- User must have FCM token stored
- Firebase must be configured

**Test Successful Payment**:
```bash
curl -X POST http://localhost:3000/api/payments/callback \
  -H "Content-Type: application/json" \
  -d '{
    "provider_reference": "YOUR_PAYMENT_REFERENCE",
    "status": "success",
    "transaction_id": "TXN123456"
  }'
```

**What Happens**:
1. Payment status updated to success
2. Booking status updated to confirmed
3. Firestore booking updated (if configured)
4. High-priority FCM notification sent (if user has token)

**Expected Notification**:
```json
{
  "title": "Payment Successful!",
  "body": "Your booking at <hotel-name> has been confirmed. Confirmation #ABCD1234",
  "data": {
    "type": "payment_confirmation",
    "booking_id": "booking-uuid",
    "status": "confirmed",
    "priority": "high"
  }
}
```

**Test Failed Payment**:
```bash
curl -X POST http://localhost:3000/api/payments/callback \
  -H "Content-Type: application/json" \
  -d '{
    "provider_reference": "YOUR_PAYMENT_REFERENCE",
    "status": "failed",
    "error_message": "Insufficient funds"
  }'
```

**Expected Notification**:
```json
{
  "title": "Payment Failed",
  "body": "Your payment for booking at <hotel-name> failed. The booking has been cancelled.",
  "data": {
    "type": "payment_confirmation",
    "booking_id": "booking-uuid",
    "status": "cancelled",
    "priority": "high"
  }
}
```

## Testing Without Firebase Configuration

The system is designed to work gracefully without Firebase configuration:

1. **Without Firebase ENV vars**: The service will log warnings but continue operating
2. **API endpoints still work**: All booking and payment endpoints function normally
3. **No Firestore sync**: Logs show "skipping Firestore sync"
4. **No FCM notifications**: Logs show "skipping notification"

This allows development and testing without requiring Firebase setup.

## Testing With Firebase Configuration

### Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)

2. Get your service account credentials:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file

3. Add to your `.env` file:
   ```bash
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key\n-----END PRIVATE KEY-----\n"
   ```

4. Restart the server

### Verification

Check server startup logs for:
```
Firebase Admin SDK initialized successfully
```

### Testing Firestore

1. Create a booking (as shown above)
2. Go to Firebase Console > Firestore Database
3. Look for a collection named `bookings`
4. Verify your booking document exists

### Testing FCM

1. Install the mobile app
2. Get the FCM token from the app
3. Store it via `POST /api/users/fcm-token`
4. Trigger a payment callback
5. Verify notification is received on the device

## Automated Tests

Run the test suite:
```bash
npm test
```

This runs unit tests for the FirebaseService that verify:
- Service initializes without crashing
- Gracefully handles missing configuration
- Methods return appropriate values when not initialized
- Throws errors when expected

## Integration Testing

For full integration testing with a real Firebase instance:

1. Set up Firebase credentials in `.env`
2. Run the server
3. Use Postman collection in `/postman` directory
4. Follow the workflow:
   - Register/Login
   - Get Firebase token
   - Store FCM token
   - Create booking (check Firestore)
   - Complete payment (check notification)

## Troubleshooting

### "Firebase service is not available"

**Cause**: Firebase environment variables not set

**Solution**: Add Firebase credentials to `.env` or continue without Firebase features

### "Firebase is not initialized"

**Cause**: Invalid Firebase credentials

**Solution**: 
- Verify `FIREBASE_PROJECT_ID` matches your project
- Ensure `FIREBASE_CLIENT_EMAIL` is correct
- Check `FIREBASE_PRIVATE_KEY` includes `\n` line breaks

### Notifications not sent

**Cause**: Multiple possible reasons

**Solution**:
- Verify FCM token is stored (check database)
- Ensure Firebase Cloud Messaging is enabled
- Check server logs for detailed error messages
- Verify device has internet and notification permissions

### Firestore sync fails

**Cause**: Security rules or network issues

**Solution**:
- Check Firestore security rules allow service account writes
- Verify network connectivity
- Check server logs for specific error details

## Next Steps

Once Firebase is configured and tested:

1. Test with mobile app
2. Verify real-time Firestore listeners work
3. Test FCM notifications on both Android and iOS
4. Verify deep linking from notifications
5. Test offline scenarios and fallback mechanisms

---

**Last Updated**: January 2025  
**Related Documentation**: See `FIREBASE_BACKEND.md` for architecture and setup details

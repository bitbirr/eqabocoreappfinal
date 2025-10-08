# Firebase Backend Integration Guide

## Overview

This document describes the Firebase backend integration implemented to support the mobile app's enhanced Firebase features, including custom authentication tokens, Firestore synchronization, and high-priority FCM notifications.

## Features Implemented

### 1. Custom Firebase Token Generation with Role Claims

**Endpoint**: `POST /api/auth/firebase`

**Authentication**: Required (Bearer token)

**Description**: Generates a Firebase custom token with role-based claims for secure Firestore and Storage access.

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "success": true,
  "message": "Firebase custom token generated successfully",
  "data": {
    "customToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": "uuid-here",
    "role": "customer",
    "expiresIn": "1h"
  }
}
```

**Custom Claims Included**:
- `role`: User role (customer, hotel_owner, admin)
- `userId`: Unique user identifier

**Security Features**:
- ✅ Backend-only token minting with JWT validation
- ✅ One-time use tokens with 1-hour expiration
- ✅ Auto-refreshing capability
- ✅ Role-based access control for Firestore security rules

### 2. FCM Token Storage

**Endpoint**: `POST /api/users/fcm-token`

**Authentication**: Required (Bearer token)

**Description**: Stores or updates the user's FCM device token for push notifications.

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "fcmToken": "fGxK7nHqRY6..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "FCM token updated successfully",
  "data": {
    "userId": "uuid-here"
  }
}
```

### 3. Firestore Synchronization

**When**: Automatically triggered on booking creation and updates

**Description**: Syncs booking data from PostgreSQL (Neon) to Firestore for real-time updates.

**Data Flow**:
1. Booking created/updated in PostgreSQL (source of truth)
2. Backend automatically syncs to Firestore
3. Mobile app receives real-time updates via Firestore listeners
4. Fallback to API polling if Firestore is unavailable

**Firestore Document Structure**:
```json
{
  "id": "booking-uuid",
  "user_id": "user-uuid",
  "hotel_id": "hotel-uuid",
  "room_id": "room-uuid",
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "phone": "+251927802065"
  },
  "hotel": {
    "id": "hotel-uuid",
    "name": "Grand Hotel",
    "location": "Addis Ababa"
  },
  "room": {
    "id": "room-uuid",
    "room_number": "101",
    "room_type": "Deluxe",
    "price_per_night": 1500
  },
  "checkin_date": "2025-10-01T00:00:00.000Z",
  "checkout_date": "2025-10-03T00:00:00.000Z",
  "nights": 2,
  "total_amount": 3000,
  "status": "confirmed",
  "created_at": "2025-01-15T10:30:00.000Z",
  "synced_at": "2025-01-15T10:30:01.000Z",
  "updated_at": "2025-01-15T10:30:01.000Z"
}
```

**Consistency Guarantees**:
- **PostgreSQL (Neon)**: Strong consistency - source of truth for critical operations
- **Firestore**: Eventual consistency - optimized for real-time updates
- **Offline Support**: Firestore local persistence enables offline access
- **Resilience**: API fallback ensures app works even if Firestore is unavailable

### 4. High-Priority FCM Notifications

**When**: Triggered on booking status changes and payment confirmations

**Notification Types**:

#### Booking Created
```json
{
  "title": "Booking created for Grand Hotel",
  "body": "Your booking for 2 night(s) has been created. Total: 3000 ETB",
  "data": {
    "type": "booking_update",
    "booking_id": "uuid",
    "status": "pending",
    "priority": "high",
    "action": "view_booking"
  }
}
```

#### Payment Successful
```json
{
  "title": "Payment Successful!",
  "body": "Your booking at Grand Hotel has been confirmed. Confirmation #ABCD1234",
  "data": {
    "type": "payment_confirmation",
    "payment_id": "uuid",
    "booking_id": "uuid",
    "status": "confirmed",
    "priority": "high",
    "action": "view_receipt"
  }
}
```

#### Payment Failed
```json
{
  "title": "Payment Failed",
  "body": "Your payment for booking at Grand Hotel failed. The booking has been cancelled.",
  "data": {
    "type": "payment_confirmation",
    "payment_id": "uuid",
    "booking_id": "uuid",
    "status": "cancelled",
    "priority": "high",
    "action": "view_receipt"
  }
}
```

**Platform-Specific Configuration**:

**Android**:
```json
{
  "android": {
    "priority": "high",
    "notification": {
      "channelId": "eqabo_critical",
      "priority": "max",
      "sound": "default",
      "defaultSound": true,
      "defaultVibrateTimings": true
    }
  }
}
```

**iOS**:
```json
{
  "apns": {
    "headers": {
      "apns-priority": "10",
      "apns-push-type": "alert"
    },
    "payload": {
      "aps": {
        "alert": {
          "title": "...",
          "body": "..."
        },
        "sound": "default",
        "badge": 1,
        "interruption-level": "time-sensitive"
      }
    }
  }
}
```

**Features**:
- ✅ High-priority delivery bypasses battery optimizations
- ✅ Always shows notifications even in foreground
- ✅ iOS time-sensitive notification support
- ✅ Structured payload for type-safe navigation
- ✅ Deep linking to booking details on tap

## Setup Instructions

### 1. Install Dependencies

The Firebase Admin SDK has been added to the project:

```bash
npm install firebase-admin
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Navigate to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file

### 3. Environment Variables

Add the following to your `.env` file:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

**Note**: The private key must be in quotes and include `\n` for line breaks.

### 4. Database Migration

Run the migration to add the FCM token field:

```bash
npm run migration:run
```

This adds the `fcm_token` column to the `users` table.

### 5. Firestore Security Rules

Apply these security rules in Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Bookings collection
    match /bookings/{bookingId} {
      // Users can read their own bookings
      allow read: if request.auth != null && 
                     (request.auth.token.userId == resource.data.user_id ||
                      request.auth.token.role == 'admin');
      
      // Only backend can write (using service account)
      allow write: if false;
    }
  }
}
```

### 6. Cloud Storage Security Rules

If using Firebase Storage for images:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User profile images
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      request.auth.token.userId == userId;
    }
    
    // Hotel images (hotel owners can upload)
    match /hotels/{hotelId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      request.auth.token.role == 'hotel_owner';
    }
  }
}
```

## Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        Mobile App                            │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Eqabo JWT │  │ Firebase Auth│  │  Firestore   │        │
│  │   (7 days) │  │ Custom Token │  │  Listeners   │        │
│  │            │  │   (1 hour)   │  │              │        │
│  └─────┬──────┘  └──────┬───────┘  └──────┬───────┘        │
└────────┼────────────────┼──────────────────┼────────────────┘
         │                │                  │
         │ 1. Login       │ 2. Get Token     │ 3. Real-time
         │                │                  │    Updates
         ▼                ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                             │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Auth   │  │   Firebase   │  │   Booking    │          │
│  │ Service  │  │   Service    │  │  Controller  │          │
│  └────┬─────┘  └──────┬───────┘  └──────┬───────┘          │
└───────┼────────────────┼──────────────────┼──────────────────┘
        │                │                  │
        │ JWT Verify     │ Mint Token       │ Create/Update
        │                │ + Claims         │ + Sync + Notify
        ▼                ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  Data & Services Layer                       │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │PostgreSQL│  │  Firestore   │  │     FCM      │          │
│  │  (Neon)  │  │              │  │              │          │
│  │  Source  │  │  Real-time   │  │ Push Notifs  │          │
│  │  of Truth│  │   Sync       │  │              │          │
│  └──────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Mobile App Integration Flow

1. **Login**:
   - User logs in with Eqabo credentials
   - Backend returns JWT token (7-day expiry)

2. **Firebase Authentication**:
   - Mobile app calls `POST /api/auth/firebase` with JWT
   - Backend validates JWT and mints Firebase custom token with role claims
   - Mobile app signs in to Firebase with custom token
   - Firebase auto-refreshes ID token

3. **FCM Token Registration**:
   - Mobile app obtains FCM device token
   - Mobile app calls `POST /api/users/fcm-token` to store token

4. **Booking Creation**:
   - Mobile app creates booking via `POST /api/bookings`
   - Backend writes to PostgreSQL (source of truth)
   - Backend syncs to Firestore (non-blocking)
   - Backend sends high-priority FCM notification (non-blocking)

5. **Real-time Updates**:
   - Mobile app subscribes to Firestore `/bookings/{userId}` collection
   - Receives instant updates on booking changes
   - Fallback to API polling if Firestore fails

6. **Payment Flow**:
   - User initiates payment
   - Backend updates PostgreSQL status
   - Backend updates Firestore status
   - Backend sends FCM notification with payment result

## Error Handling

The Firebase integration is designed to be resilient:

1. **Firebase Not Configured**: 
   - Service warns but doesn't crash
   - Features gracefully degrade
   - API continues to work normally

2. **Firestore Sync Fails**:
   - Logged but doesn't block response
   - Mobile app falls back to API polling

3. **FCM Notification Fails**:
   - Logged but doesn't block response
   - User still gets updates via real-time listeners or polling

## Testing

### 1. Test Firebase Token Generation

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+251927802065",
    "password": "YourPassword123"
  }'

# Get Firebase token
curl -X POST http://localhost:3000/api/auth/firebase \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>"
```

### 2. Test FCM Token Storage

```bash
curl -X POST http://localhost:3000/api/users/fcm-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "fcmToken": "fGxK7nHqRY6..."
  }'
```

### 3. Test Booking with Firestore Sync

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "John Doe",
    "phone": "+251927802065",
    "hotelId": "hotel-uuid",
    "roomId": "room-uuid",
    "checkIn": "2025-10-01",
    "checkOut": "2025-10-03"
  }'
```

Check Firestore Console to verify the booking was synced.

### 4. Test Payment Notification

```bash
# Initiate payment
curl -X POST http://localhost:3000/api/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "booking-uuid",
    "provider": "telebirr"
  }'

# Simulate payment callback (success)
curl -X POST http://localhost:3000/api/payments/callback \
  -H "Content-Type: application/json" \
  -d '{
    "provider_reference": "ref-from-initiate",
    "status": "success",
    "transaction_id": "TXN123456"
  }'
```

User should receive FCM notification on their device.

## Security Best Practices

1. **Never expose Firebase Admin SDK credentials**: Keep them in environment variables
2. **Validate JWT before minting Firebase tokens**: Prevent unauthorized access
3. **Use role claims in Firestore rules**: Enforce proper access control
4. **Keep Firebase custom tokens short-lived**: 1-hour expiry limits exposure
5. **Validate FCM tokens before storing**: Prevent storage of invalid tokens
6. **Log all Firebase operations**: Aid debugging and security auditing

## Troubleshooting

### Firebase not initializing

**Problem**: `Firebase service is not available` error

**Solution**:
- Verify `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` are set
- Ensure private key includes `\n` for line breaks
- Check Firebase Console for correct service account

### Firestore sync not working

**Problem**: Bookings not appearing in Firestore

**Solution**:
- Check Firestore security rules allow service account writes
- Verify network connectivity to Firestore
- Check application logs for sync errors

### Notifications not received

**Problem**: FCM notifications not delivered

**Solution**:
- Verify FCM token is correctly stored in database
- Check Firebase Cloud Messaging is enabled in Firebase Console
- Ensure device has internet connectivity
- Verify notification payload structure
- Check device notification permissions

## Support

For issues or questions:
- Check application logs for detailed error messages
- Verify environment variables are correctly set
- Ensure Firebase project is properly configured
- Review Firestore and Storage security rules

---

**Last Updated**: January 2025  
**Backend Version**: 1.0.0  
**Firebase Admin SDK Version**: ^12.0.0

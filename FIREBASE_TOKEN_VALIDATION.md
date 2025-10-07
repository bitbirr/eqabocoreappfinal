# Firebase Token Validation & Error Handling

## Overview

This document describes the validation and error handling improvements made to the Firebase custom token generation endpoint (`/api/auth/firebase`) to ensure it **never returns null or invalid tokens**.

## Guarantees

### 1. **Never Returns `customToken: null`**

The endpoint now validates the token at multiple levels:

- ✅ **Input validation**: Ensures `userId` and `role` are non-empty strings
- ✅ **Token generation validation**: Verifies Firebase Admin SDK returns a valid token
- ✅ **Output validation**: Validates token is non-null, non-empty string before sending response
- ✅ **Error handling**: Returns proper error responses (4xx/5xx) instead of null tokens

### 2. **Proper Error Messages**

All error responses now include:
- `success: false` - Boolean flag
- `error` - Short error identifier
- `message` - Detailed, user-friendly error message

### 3. **Comprehensive Logging**

Every request is logged with:
- Success: User ID, role, and token length
- Failure: Error type, details, and stack trace

## API Contract

### Success Response (200)

```json
{
  "success": true,
  "message": "Firebase custom token generated successfully",
  "data": {
    "customToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": "39f3c32a-63df-4254-a88b-a7ec5981941f",
    "role": "hotel_owner",
    "expiresIn": "1h"
  }
}
```

**Guarantees:**
- `customToken` is always a non-empty string
- `userId` matches the authenticated user
- `role` reflects the user's current role
- Token is valid for 1 hour

### Error Responses

#### 401 - No Authentication
```json
{
  "success": false,
  "error": "Authentication required",
  "message": "Authentication required"
}
```

#### 400 - Invalid User Data
```json
{
  "success": false,
  "error": "Invalid user data",
  "message": "User ID and role are required"
}
```

#### 503 - Firebase Service Unavailable
```json
{
  "success": false,
  "error": "Firebase service is not available",
  "message": "Firebase service is not available. Please contact support."
}
```

#### 500 - Token Generation Failed
```json
{
  "success": false,
  "error": "Failed to generate Firebase token",
  "message": "Firebase token generation returned an invalid token"
}
```

or

```json
{
  "success": false,
  "error": "Failed to generate Firebase token",
  "message": "<specific error message from Firebase SDK>"
}
```

## Validation Layers

### Layer 1: AuthController Input Validation

```typescript
// Validates authenticated user exists
if (!req.user) {
  return 401 error
}

// Validates user has required fields
if (!req.user.id || !req.user.role) {
  return 400 error
}

// Validates Firebase is initialized
if (!firebaseService.isInitialized()) {
  return 503 error
}
```

### Layer 2: FirebaseService Input Validation

```typescript
// Validates userId is non-empty string
if (!userId || typeof userId !== 'string' || userId.trim() === '') {
  throw Error('Invalid userId')
}

// Validates role is non-empty string
if (!role || typeof role !== 'string' || role.trim() === '') {
  throw Error('Invalid role')
}
```

### Layer 3: Token Output Validation

```typescript
// Validates token from Firebase Admin SDK
if (!token || typeof token !== 'string' || token.trim() === '') {
  throw Error('Firebase Admin SDK returned an invalid token')
}
```

### Layer 4: AuthController Output Validation

```typescript
// Double-check before sending response
if (!customToken || typeof customToken !== 'string' || customToken.trim() === '') {
  return 500 error with detailed logging
}
```

## Testing

All validation scenarios are covered by unit tests in `__tests__/firebase.test.ts`:

- ✅ Firebase not initialized
- ✅ Empty userId
- ✅ Null userId
- ✅ Whitespace-only userId
- ✅ Empty role
- ✅ Null role
- ✅ Whitespace-only role
- ✅ Successful token generation returns non-empty string

Run tests with:
```bash
npm test -- firebase.test.ts
```

## Logging Examples

### Success Case
```
Generating Firebase custom token for user 39f3c32a-63df-4254-a88b-a7ec5981941f with role hotel_owner
Creating Firebase custom token { userId: '39f3c32a-63df-4254-a88b-a7ec5981941f', role: 'hotel_owner' }
Firebase custom token created successfully { userId: '39f3c32a-63df-4254-a88b-a7ec5981941f', tokenLength: 1024 }
Firebase custom token generated successfully for user 39f3c32a-63df-4254-a88b-a7ec5981941f, token length: 1024
```

### Error Cases

#### Firebase Not Initialized
```
Firebase token request failed: Firebase service not initialized
```

#### Invalid User Data
```
Firebase token request failed: Invalid user data { hasId: true, hasRole: false }
```

#### Token Generation Failed
```
Cannot create custom token: Invalid userId { userId: '' }
Error creating custom token: Error: Invalid userId: must be a non-empty string
Firebase token generation error: Error: Invalid userId: must be a non-empty string
Error name: Error
Error message: Invalid userId: must be a non-empty string
Error stack: <stack trace>
```

## Mobile App Integration

The mobile app can now safely assume:

1. **Successful responses (200)** always contain a valid `customToken` string
2. **Error responses (4xx/5xx)** never contain a `data.customToken` field
3. **All responses** include a `success` boolean for easy checking

Example Flutter/Dart handling:

```dart
final response = await api.post('/api/auth/firebase');

if (response.data['success'] == true) {
  // Safe to cast - guaranteed to be non-null string
  final customToken = response.data['data']['customToken'] as String;
  await firebaseAuth.signInWithCustomToken(customToken);
} else {
  // Handle error with message
  final errorMessage = response.data['message'] ?? 'Unknown error';
  showError(errorMessage);
}
```

## Configuration

Firebase must be configured with these environment variables:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

If not configured, the service will:
- Log detailed warning messages on startup
- Return 503 errors for all token generation requests
- Provide clear instructions for configuration

## Summary

The Firebase token generation endpoint now provides strong guarantees:

1. ✅ Never returns `customToken: null`
2. ✅ Always returns proper error messages with status codes
3. ✅ Validates all inputs and outputs at multiple layers
4. ✅ Provides comprehensive logging for debugging
5. ✅ Includes all required fields in responses
6. ✅ Has comprehensive test coverage

These improvements ensure the mobile app will never encounter null pointer exceptions when processing Firebase token responses.

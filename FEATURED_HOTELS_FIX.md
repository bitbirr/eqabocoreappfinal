# Featured Hotels API Fix - hotelId Addition

## Problem Statement

The mobile app receives only `id` (UUID) from `/api/hotels/featured` endpoint, but `/api/v1/hotels/:hotelId` requires an integer `hotelId`. This created a compatibility issue where featured hotels couldn't be queried for details using the v1 API.

## Solution

Added the `hotelId` field to the featured hotels response to ensure compatibility between the featured hotels endpoint and the v1 hotels API.

## Changes Made

### 1. Updated `HotelController.getFeaturedHotels` Method

**File**: `src/controllers/HotelController.ts`

Added `hotelId` as the first field in the response object:

```typescript
const featuredHotels = hotels.map(hotel => ({
  hotelId: hotel.hotelId,  // <- Added this line
  id: hotel.id,
  name: hotel.name,
  location: hotel.location,
  description: hotel.description,
  status: hotel.status,
  created_at: hotel.created_at,
  room_count: hotel.rooms?.length || 0,
  price_range: hotel.rooms?.length > 0 ? {
    min: Math.min(...hotel.rooms.map(room => Number(room.price_per_night))),
    max: Math.max(...hotel.rooms.map(room => Number(room.price_per_night)))
  } : null
}));
```

### 2. Updated Swagger Documentation

**File**: `src/routes/hotelRoutes.ts`

Added `hotelId` property to the OpenAPI schema:

```yaml
hotelId:
  type: integer
  example: 1
```

### 3. Added Test Coverage

**File**: `__tests__/hotel.test.ts`

Added comprehensive tests for the featured hotels endpoint:

```typescript
describe('GET /api/hotels/featured', () => {
  it('should retrieve featured hotels with both hotelId and id', async () => {
    // Verifies both hotelId (integer) and id (UUID) are present
  });

  it('should respect the limit parameter', async () => {
    // Verifies the limit query parameter works correctly
  });
});
```

### 4. Updated Documentation

**File**: `FIREBASE_FIX_SUMMARY.md`

Updated the response example to include the `hotelId` field.

## API Response Structure

### Before
```json
{
  "success": true,
  "data": {
    "hotels": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Skylight Hotel",
        ...
      }
    ],
    "total": 10
  }
}
```

### After
```json
{
  "success": true,
  "data": {
    "hotels": [
      {
        "hotelId": 1,
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Skylight Hotel",
        ...
      }
    ],
    "total": 10
  }
}
```

## Compatibility

This change is **backward compatible** and **non-breaking**:
- ✅ Existing clients using the `id` (UUID) field will continue to work
- ✅ New clients can use the `hotelId` (integer) field to query `/api/v1/hotels/:hotelId`
- ✅ The change is purely additive - no existing fields were removed or modified

## Testing

### Unit Tests
New tests added in `__tests__/hotel.test.ts` verify:
- Both `hotelId` and `id` fields are present in the response
- `hotelId` is a number (integer)
- `id` is a string (UUID)
- All other expected fields are present
- The `limit` parameter works correctly

### Manual Testing
To test manually:
```bash
# Start the server
npm run dev

# Query the endpoint
curl http://localhost:3000/api/hotels/featured?limit=5
```

Expected response will include both `hotelId` and `id` for each hotel.

## Impact

### Mobile App
The mobile app can now:
1. Fetch featured hotels from `/api/hotels/featured`
2. Use the `hotelId` field to query hotel details from `/api/v1/hotels/:hotelId`
3. Use the `id` (UUID) field for other operations that require the UUID

### Database Schema
No database changes required. The `hotelId` field already exists in the `hotels` table (added via migration `1700000000001-AddCitiesHotelsRoomsCRUD.ts`).

## Files Changed

1. `src/controllers/HotelController.ts` - Added `hotelId` to response mapping
2. `src/routes/hotelRoutes.ts` - Updated Swagger/OpenAPI documentation
3. `__tests__/hotel.test.ts` - Added test coverage
4. `FIREBASE_FIX_SUMMARY.md` - Updated documentation example

## Verification

- ✅ TypeScript compilation successful
- ✅ No breaking changes to existing API contracts
- ✅ Swagger documentation updated
- ✅ Test coverage added

---

**Status**: ✅ Complete  
**Date**: October 2025  
**Impact**: Low risk, backward compatible addition

# Authentication Fix for Area Maps API

## Problem
The application was showing 401 (Unauthorized) errors when trying to access the `/api/area-maps` endpoint:

```
127.0.0.1 - - [01/Sep/2025 13:21:05] "GET /api/area-maps HTTP/1.1" 401 -
127.0.0.1 - - [01/Sep/2025 13:21:05] "GET /api/area-maps HTTP/1.1" 401 -
```

## Root Cause
The `/api/area-maps` endpoint requires JWT authentication (`@jwt_required()` decorator), but the frontend was making requests without proper authentication headers.

## Solution

### 1. Updated API Service (`src/services/api.ts`)
- Added `areaMapAPI` object with proper authentication headers
- All area map functions now use `getAuthHeaders()` to include JWT token
- Functions include:
  - `getAreaMaps()` - Get list of area maps
  - `uploadAreaMap(file)` - Upload new area map
  - `deleteAreaMap(filename)` - Delete area map

### 2. Updated AreaMapSelector Component (`src/components/admin/AreaMapSelector.tsx`)
- Added authentication check using `useAuthStore`
- Replaced direct `fetch()` calls with proper API functions
- Added error handling for authentication failures
- Shows user-friendly error messages when not authenticated
- Added "Try Again" button for failed requests

### 3. Authentication Flow
1. User must be logged in before accessing area maps
2. JWT token is automatically included in API requests
3. If authentication fails, user sees clear error message
4. Component gracefully handles both authenticated and unauthenticated states

## Files Modified
- `src/services/api.ts` - Added area maps API functions
- `src/components/admin/AreaMapSelector.tsx` - Added authentication checks and error handling

## Testing
Created `test_auth_fix.py` to verify the fix:
- ✅ Backend returns 401 without authentication (expected behavior)
- ✅ Login works and returns JWT token
- ✅ Area maps API works with proper authentication
- ✅ Frontend now handles authentication properly

## Usage
1. User must log in first through the login page
2. Once authenticated, area maps will load automatically
3. If not authenticated, user sees error message with login prompt
4. Upload functionality also requires authentication

## Next Steps
- Ensure users are directed to login page if not authenticated
- Consider adding automatic token refresh for expired tokens
- Add loading states for better user experience
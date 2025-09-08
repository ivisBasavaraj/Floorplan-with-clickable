# IMTMA Flooring - Admin/User Workflow Testing Guide

## Overview
This guide explains how to test the admin/user workflow where:
- **Admins** can create floor plans and access the dashboard
- **Users** can only view published floor plans in 2D/3D viewer interface

## Prerequisites
1. Backend running on http://localhost:5000
2. Frontend running on http://localhost:5173
3. MongoDB running locally

## Test Setup

### 1. Create Test Data
Run the test script to create sample users and floor plans:
```bash
cd "d:/Knowvia/IMTMA Flooring"
python test_create_floorplan.py
```

This creates:
- Admin user: `admin@test.com` / `admin123`
- Regular user: `user@test.com` / `user123`
- Sample published floor plan

### 2. Test API Endpoints
Open the test page to verify API connectivity:
```
http://localhost:5173/test-api
```

## Testing Workflow

### Admin User Testing
1. Go to http://localhost:5173
2. Click "Login" 
3. Login with: `admin@test.com` / `admin123`
4. Should redirect to **Dashboard** (`/dashboard`)
5. Dashboard should show:
   - Floor plan statistics
   - List of created floor plans
   - "Create Floor Plan" button

#### Creating Floor Plans (Admin Only)
1. From dashboard, click "Create Floor Plan" or use menu
2. Should go to `/admin/floor-plans/new`
3. Use the floor plan editor to:
   - Add booths, text, shapes
   - Click "Save Floor Plan" 
   - Choose name and status:
     - **Draft**: Only admin can see
     - **Active**: Logged-in users can see
     - **Published**: Public access (recommended)
4. Save the floor plan

### Regular User Testing
1. Go to http://localhost:5173
2. Click "Login"
3. Login with: `user@test.com` / `user123`
4. Should redirect to **Floor Plan Viewer** (`/floor-plans`)
5. Should see:
   - List of published floor plans
   - 2D/3D view toggle
   - Interactive floor plan with booths
   - Booth details on click

#### User Interface Features
- **Floor Plan Selection**: Dropdown to switch between plans
- **View Modes**: Toggle between 2D and 3D views
- **Interactive Booths**: Click booths to see details
- **Company Information**: View exhibitor details
- **Navigation**: Zoom, pan, rotate (3D)

## Route Structure

### Admin Routes (Protected)
- `/dashboard` - Admin dashboard
- `/admin/floor-plans/new` - Create new floor plan
- `/admin/floor-plans/:id/edit` - Edit existing floor plan

### User Routes (Protected)
- `/floor-plans` - Floor plan viewer interface
- `/floor-plans/:id` - Specific floor plan view

### Public Routes
- `/` - Landing page
- `/login` - Login page
- `/viewer/:id` - Public floor plan viewer (no auth)

## API Endpoints

### Public API (No Authentication)
- `GET /api/public/floorplans` - Get published floor plans
- `GET /api/public/floorplans/:id` - Get specific published floor plan

### Protected API (Authentication Required)
- `GET /api/floorplans` - Get all floor plans (admin)
- `POST /api/floorplans` - Create floor plan (admin only)
- `PUT /api/floorplans/:id` - Update floor plan (admin only)

## Troubleshooting

### No Floor Plans Showing for Users
1. Check if floor plans exist: `curl http://localhost:5000/api/public/floorplans`
2. Verify floor plan status is "published" or "active"
3. Check browser console for errors
4. Test API connectivity at `/test-api`

### Admin Cannot Create Floor Plans
1. Verify user role is "admin"
2. Check authentication token
3. Verify backend permissions

### CORS Issues
1. Backend should allow `http://localhost:5173`
2. Check browser network tab for CORS errors

## Status Meanings
- **Draft**: Only visible to admins in dashboard
- **Active**: Visible to logged-in users
- **Published**: Publicly accessible, appears in user interface

## Expected Behavior Summary

| User Type | Login Redirect | Can Create | Can View | Interface |
|-----------|---------------|------------|----------|-----------|
| Admin | `/dashboard` | ✅ Yes | ✅ All plans | Dashboard + Editor |
| User | `/floor-plans` | ❌ No | ✅ Published only | Viewer Interface |
| Public | N/A | ❌ No | ✅ Published only | Public Viewer |

## Files Modified
- `src/App.tsx` - Route configuration and role-based redirects
- `src/pages/UserFloorPlanViewer.tsx` - New user interface component
- `src/components/navigation/MainMenu.tsx` - Role-based navigation
- `src/services/api.ts` - Public API endpoints
- Backend routes - Public floor plan endpoints

The system now properly separates admin and user experiences while ensuring published floor plans are visible to users in an intuitive 2D/3D viewer interface.
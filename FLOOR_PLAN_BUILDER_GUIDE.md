# Floor Plan Builder Implementation Guide

## Overview

The Floor Plan Builder is a comprehensive feature that allows administrators to create, design, and publish interactive floor plans with 2D and 3D viewing capabilities. This implementation provides a full-screen, responsive interface for floor plan creation and management.

## Features Implemented

### ✅ Full-Screen Layout
- **Route**: `http://localhost:5173/admin/floor-plans/new`
- **Responsive Design**: Automatically fits entire screen without scrollbars
- **Viewport Optimization**: Canvas and tool panels occupy full viewport width and height

### ✅ Area Map Selection
- **Upload Functionality**: Admins can upload new area maps (images)
- **Map Library**: Select from existing area maps
- **Background Integration**: Selected maps display on canvas as background
- **Navigation Controls**: Zoom, drag, and pan controls for map navigation

### ✅ Floor Plan Creation Tools
- **Drawing Tools**: 
  - Rectangles and polygons for rooms and zones
  - Lines for walls and pathways
  - Text labels and markers
- **Interactive Elements**:
  - Booths with status (available, reserved, sold)
  - Doors and entrances
  - Furniture and amenities
- **Editing Capabilities**:
  - Resize, move, delete, rename objects
  - Snap-to-grid for precise alignment
  - Layer management

### ✅ Save & Publish Floor Plan
- **Structured Data**: Floor plans saved in JSON format
- **Area Association**: Plans linked to specific Area IDs
- **Status Management**: Draft, Active, Published states
- **Version Control**: Automatic versioning on updates

### ✅ User Interface Rendering
- **2D View**: Clean, interactive floor plan display
- **3D View**: Three.js-powered 3D visualization with:
  - Extruded booth elements
  - Interactive camera controls
  - Booth status color coding
  - Click-to-select functionality
- **View Toggle**: Seamless switching between 2D and 3D modes

### ✅ Access Control
- **Admin Permissions**: Create, edit, and publish floor plans
- **User Permissions**: View-only access to published floor plans
- **Authentication**: JWT-based security with role validation

## File Structure

```
src/
├── components/
│   ├── admin/
│   │   ├── AreaMapSelector.tsx      # Area map selection component
│   │   └── FloorPlanBuilder.tsx     # Main builder interface
│   ├── viewer/
│   │   ├── FloorPlanViewer3D.tsx    # 3D visualization component
│   │   └── ViewToggle.tsx           # 2D/3D toggle control
│   └── canvas/
│       └── Canvas.tsx               # Enhanced canvas with tools
├── styles/
│   ├── FloorPlanBuilder.css         # Builder-specific styles
│   └── index.css                    # Global styles with 3D support
└── pages/
    ├── FloorPlanEditor.tsx          # Updated editor (re-exports builder)
    └── EnhancedUserFloorPlanViewer.tsx # Enhanced viewer with 3D

backend/
├── routes/
│   └── area_map_routes.py           # Area map management API
└── app.py                           # Updated with area map routes
```

## API Endpoints

### Area Map Management
- `POST /api/area-maps/upload` - Upload new area map (Admin only)
- `GET /api/area-maps` - List available area maps
- `DELETE /api/area-maps/<filename>` - Delete area map (Admin only)
- `GET /uploads/<filename>` - Serve area map files

### Floor Plan Management
- `POST /api/floorplans` - Create new floor plan (Admin only)
- `PUT /api/floorplans/<id>` - Update floor plan (Admin only)
- `PUT /api/floorplans/<id>/status` - Publish/unpublish floor plan
- `GET /api/floorplans` - List floor plans (role-based access)
- `GET /api/floorplans/<id>` - Get specific floor plan

## Usage Instructions

### For Administrators

1. **Access the Builder**
   ```
   Navigate to: http://localhost:5173/admin/floor-plans/new
   ```

2. **Select Area Map**
   - Click "Select Area Map" to open the map selector
   - Choose from existing maps or upload a new one
   - Supported formats: PNG, JPG, JPEG, GIF, BMP, WEBP

3. **Design Floor Plan**
   - Use the toolbar to select drawing tools
   - Click and drag to create elements
   - Use the properties panel to customize elements
   - Enable grid snap for precise alignment

4. **Save and Publish**
   - Click "Save" to store as draft
   - Click "Publish" to make available to users
   - Add name and description for better organization

### For Users

1. **View Floor Plans**
   ```
   Navigate to: http://localhost:5173/floor-plans
   ```

2. **Switch Views**
   - Use the 2D/3D toggle in the top-right corner
   - In 3D mode: Click and drag to rotate, scroll to zoom
   - Click booths for detailed information

3. **Search and Filter**
   - Use the sidebar to search companies
   - Filter by booth status or category
   - Click company entries to highlight booths

## Technical Implementation

### 3D Visualization
- **Engine**: Three.js for WebGL rendering
- **Features**:
  - Real-time 3D booth extrusion
  - Interactive camera controls
  - Dynamic lighting and shadows
  - Booth status color coding

### Responsive Design
- **CSS Grid**: Flexible layout system
- **Viewport Units**: Full-screen optimization
- **Media Queries**: Mobile and tablet support
- **Touch Support**: Mobile-friendly interactions

### State Management
- **Zustand Store**: Canvas state management
- **Persistent Storage**: LocalStorage for area maps
- **Real-time Updates**: Live canvas synchronization

### Performance Optimizations
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Efficient background rendering
- **Canvas Optimization**: Minimal re-renders
- **Memory Management**: Proper cleanup in 3D viewer

## Configuration

### Environment Variables
```bash
# Backend
MONGODB_URI=mongodb://localhost:27017/imtma_flooring
JWT_SECRET_KEY=your-secret-key
CORS_ORIGINS=http://localhost:5173

# Frontend (vite.config.ts)
VITE_API_URL=http://localhost:5000
```

### File Upload Limits
- **Max File Size**: 10MB (configurable)
- **Allowed Types**: Image files only
- **Storage**: Local filesystem (uploads/ directory)

## Browser Compatibility

### Supported Browsers
- **Chrome**: 80+ (recommended)
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+

### WebGL Requirements
- **3D View**: Requires WebGL support
- **Fallback**: 2D view for unsupported browsers
- **Performance**: Dedicated GPU recommended for large floor plans

## Deployment Considerations

### Production Setup
1. **File Storage**: Consider cloud storage (AWS S3, etc.)
2. **CDN**: Use CDN for area map delivery
3. **Database**: MongoDB with proper indexing
4. **Security**: HTTPS required for file uploads
5. **Backup**: Regular backup of area maps and floor plans

### Scaling
- **Load Balancing**: Multiple backend instances
- **Database Sharding**: For large datasets
- **Caching**: Redis for session management
- **Asset Optimization**: Image compression and resizing

## Troubleshooting

### Common Issues

1. **3D View Not Loading**
   - Check WebGL support: `chrome://gpu/`
   - Update graphics drivers
   - Try different browser

2. **File Upload Fails**
   - Check file size limits
   - Verify file format
   - Ensure backend is running

3. **Canvas Performance Issues**
   - Reduce element count
   - Disable grid if not needed
   - Close other browser tabs

### Debug Mode
```javascript
// Enable canvas debugging
localStorage.setItem('debug-canvas', 'true');

// Enable 3D debugging
localStorage.setItem('debug-3d', 'true');
```

## Future Enhancements

### Planned Features
- [ ] Collaborative editing (multiple admins)
- [ ] Floor plan templates
- [ ] Advanced 3D materials and textures
- [ ] VR/AR support
- [ ] Real-time booth availability updates
- [ ] Integration with booking systems
- [ ] Advanced analytics and reporting

### API Extensions
- [ ] Floor plan versioning API
- [ ] Bulk operations API
- [ ] Export/import functionality
- [ ] Webhook notifications
- [ ] Advanced search and filtering

## Support

For technical support or feature requests:
1. Check this documentation
2. Review the troubleshooting section
3. Check browser console for errors
4. Verify backend API connectivity

## License

This Floor Plan Builder implementation is part of the IMTMA Flooring project and follows the project's licensing terms.
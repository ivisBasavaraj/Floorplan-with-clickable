# Floor Plan Map Implementations

This project now includes multiple implementations of a React-based floor plan mapping system similar to ExpoFP. Each implementation addresses different requirements and dependency constraints.

## Available Implementations

### 1. FloorPlanMap.jsx (Full Leaflet Integration)
**Route:** `/map-demo`
**Dependencies:** Leaflet, React-Leaflet

**Features:**
- Full OpenStreetMap integration with Leaflet.js
- Custom canvas layer overlay
- Real map tiles and georeferencing
- Professional mapping capabilities
- Pan, zoom, and standard map controls

**Use Case:** Production applications requiring real map data and professional mapping features.

**Note:** May have dependency conflicts with React 18. Use `npm install --legacy-peer-deps` if needed.

### 2. SimpleFloorPlanMap.jsx (No External Dependencies)
**Route:** `/simple-map`
**Dependencies:** None (Pure React)

**Features:**
- Canvas-based rendering
- Simulated coordinate system
- Click interactions on booths
- Popup information display
- Grid background pattern
- No external library dependencies

**Use Case:** Quick prototyping, avoiding dependency conflicts, or when external libraries are not allowed.

### 3. MapLibreFloorPlan.jsx (Interactive Canvas)
**Route:** `/interactive-map`
**Dependencies:** None (Pure React)

**Features:**
- Interactive pan and zoom functionality
- Mouse wheel zoom control
- Click and drag panning
- Zoom control buttons
- Tile-like background pattern
- Booth click interactions
- Real-time coordinate updates

**Use Case:** Interactive applications requiring pan/zoom without external mapping libraries.

## Quick Start

### Running the Application

1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

2. Start the development server:
```bash
npm run dev
```

3. Visit the demo routes:
- `/map-demo` - Full Leaflet implementation
- `/simple-map` - Simple canvas implementation  
- `/interactive-map` - Interactive canvas implementation

## Implementation Comparison

| Feature | FloorPlanMap | SimpleFloorPlanMap | MapLibreFloorPlan |
|---------|--------------|-------------------|-------------------|
| Real Map Tiles | ✅ | ❌ | ❌ |
| External Dependencies | ✅ Leaflet | ❌ None | ❌ None |
| Pan/Zoom | ✅ Full | ❌ Static | ✅ Custom |
| Georeferencing | ✅ Real | ❌ Simulated | ❌ Simulated |
| Booth Interactions | ✅ | ✅ | ✅ |
| Performance | Good | Excellent | Good |
| Bundle Size | Large | Small | Small |

## Booth Data Format

All implementations use the same booth data structure:

```json
[
  {
    "boothId": "B12",
    "name": "Company X",
    "description": "Company description",
    "coords": [
      [77.5946, 12.9716],
      [77.5948, 12.9716], 
      [77.5948, 12.9718],
      [77.5946, 12.9718]
    ]
  }
]
```

**Coordinate Format:** `[longitude, latitude]`

## API Integration

### Mock API Service
Located in `src/services/boothApi.js`:

```javascript
import { fetchBoothData, fetchBoothById } from '../services/boothApi';

// Fetch all booths
const booths = await fetchBoothData();

// Fetch specific booth
const booth = await fetchBoothById('B12');
```

### Real API Integration
To connect to a real API, modify the `fetchBoothData` function:

```javascript
export const fetchBoothData = async () => {
  const response = await fetch('/api/booths');
  return response.json();
};
```

## Customization Guide

### Styling Booths
Modify the drawing functions in each component:

```javascript
// Change booth colors
ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'; // Red fill
ctx.strokeStyle = '#ff0000'; // Red border
ctx.lineWidth = 2;
```

### Adding New Features

1. **Search Functionality:**
   - Add search input component
   - Filter booths array
   - Highlight matching booths

2. **Booth Categories:**
   - Add category field to booth data
   - Use different colors per category
   - Add category legend

3. **Floor Levels:**
   - Add floor field to booth data
   - Implement floor selector
   - Filter booths by floor

## Troubleshooting

### Common Issues

1. **404 Errors on Resources:**
   - Use SimpleFloorPlanMap or MapLibreFloorPlan
   - These don't require external resources

2. **Dependency Conflicts:**
   - Install with `--legacy-peer-deps`
   - Or use implementations without external dependencies

3. **Canvas Not Rendering:**
   - Check browser console for errors
   - Ensure canvas dimensions are set
   - Verify booth coordinate format

4. **Click Detection Not Working:**
   - Check polygon coordinate order
   - Verify coordinate transformation
   - Test with console logging

### Debug Mode
Add logging to track issues:

```javascript
console.log('Booth data:', booths);
console.log('Canvas dimensions:', canvas.width, canvas.height);
console.log('Click coordinates:', x, y);
```

## Performance Optimization

### For Large Datasets
- Implement viewport culling
- Use canvas layers for different elements
- Add booth clustering at low zoom levels
- Implement lazy loading

### Memory Management
- Clear canvas properly on redraws
- Remove event listeners on unmount
- Optimize coordinate calculations

## Browser Support

- **Modern Browsers:** Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile:** iOS Safari 12+, Chrome Mobile 60+
- **Canvas Support:** Required for all implementations
- **Touch Events:** Supported in interactive version

## Future Enhancements

1. **3D Floor Plans:** Three.js integration
2. **Real-time Updates:** WebSocket support
3. **Offline Support:** Service worker caching
4. **Export Features:** PDF/PNG export
5. **Accessibility:** Screen reader support
6. **Multi-language:** i18n support

## Contributing

When adding new features:
1. Maintain compatibility with existing booth data format
2. Add proper error handling
3. Include TypeScript definitions if applicable
4. Update documentation
5. Test across all implementations
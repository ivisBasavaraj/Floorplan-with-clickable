import React, { useEffect, useRef, useState } from 'react';

// Mock booth data
const mockBooths = [
  {
    boothId: "B12",
    name: "Company X",
    description: "Leading technology solutions provider",
    coords: [[77.5946, 12.9716], [77.5948, 12.9716], [77.5948, 12.9718], [77.5946, 12.9718]]
  },
  {
    boothId: "B13", 
    name: "Company Y",
    description: "Innovative software development",
    coords: [[77.5950, 12.9716], [77.5952, 12.9716], [77.5952, 12.9718], [77.5950, 12.9718]]
  },
  {
    boothId: "B14",
    name: "Company Z", 
    description: "Digital transformation experts",
    coords: [[77.5946, 12.9720], [77.5948, 12.9720], [77.5948, 12.9722], [77.5946, 12.9722]]
  },
  {
    boothId: "B15",
    name: "Tech Corp",
    description: "Cloud computing solutions",
    coords: [[77.5950, 12.9720], [77.5952, 12.9720], [77.5952, 12.9722], [77.5950, 12.9722]]
  }
];

const MapLibreFloorPlan = () => {
  const mapContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const [booths, setBooths] = useState([]);
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapState, setMapState] = useState({
    center: { lng: 77.5946, lat: 12.9716 },
    zoom: 18,
    bearing: 0,
    pitch: 0
  });

  // Load booth data
  useEffect(() => {
    const loadBooths = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setBooths(mockBooths);
      } catch (error) {
        console.error('Error loading booths:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBooths();
  }, []);

  // Initialize map-like interface
  useEffect(() => {
    if (!mapContainerRef.current || booths.length === 0) return;

    const container = mapContainerRef.current;
    const canvas = canvasRef.current;
    
    // Set up canvas
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      drawMap();
    };

    const drawMap = () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw tile-like background
      drawTileBackground(ctx);
      
      // Draw booths
      drawBooths(ctx);
    };

    const drawTileBackground = (ctx) => {
      // Create a tile-like pattern
      const tileSize = 256;
      const pattern = ctx.createPattern(createTilePattern(), 'repeat');
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const createTilePattern = () => {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = 256;
      patternCanvas.height = 256;
      const pCtx = patternCanvas.getContext('2d');
      
      // Light gray background
      pCtx.fillStyle = '#f8f8f8';
      pCtx.fillRect(0, 0, 256, 256);
      
      // Grid lines
      pCtx.strokeStyle = '#e0e0e0';
      pCtx.lineWidth = 1;
      for (let i = 0; i <= 256; i += 32) {
        pCtx.beginPath();
        pCtx.moveTo(i, 0);
        pCtx.lineTo(i, 256);
        pCtx.stroke();
        
        pCtx.beginPath();
        pCtx.moveTo(0, i);
        pCtx.lineTo(256, i);
        pCtx.stroke();
      }
      
      return patternCanvas;
    };

    const drawBooths = (ctx) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scale = Math.pow(2, mapState.zoom - 10) * 100000; // Adjust scale for visibility

      booths.forEach(booth => {
        const pixelCoords = booth.coords.map(coord => {
          const x = centerX + (coord[0] - mapState.center.lng) * scale;
          const y = centerY - (coord[1] - mapState.center.lat) * scale;
          return [x, y];
        });

        // Draw booth polygon
        ctx.beginPath();
        ctx.moveTo(pixelCoords[0][0], pixelCoords[0][1]);
        for (let i = 1; i < pixelCoords.length; i++) {
          ctx.lineTo(pixelCoords[i][0], pixelCoords[i][1]);
        }
        ctx.closePath();

        // Fill and stroke
        ctx.fillStyle = 'rgba(0, 123, 255, 0.4)';
        ctx.fill();
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw booth label
        const centerBoothX = pixelCoords.reduce((sum, coord) => sum + coord[0], 0) / pixelCoords.length;
        const centerBoothY = pixelCoords.reduce((sum, coord) => sum + coord[1], 0) / pixelCoords.length;
        
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(booth.boothId, centerBoothX, centerBoothY);
      });
    };

    // Handle canvas click
    const handleCanvasClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scale = Math.pow(2, mapState.zoom - 10) * 100000;

      booths.forEach(booth => {
        const pixelCoords = booth.coords.map(coord => {
          const px = centerX + (coord[0] - mapState.center.lng) * scale;
          const py = centerY - (coord[1] - mapState.center.lat) * scale;
          return [px, py];
        });

        if (isPointInPolygon([x, y], pixelCoords)) {
          setSelectedBooth(booth);
          setPopupPosition({ x: event.clientX, y: event.clientY });
        }
      });
    };

    // Pan functionality
    let isDragging = false;
    let lastMousePos = { x: 0, y: 0 };

    const handleMouseDown = (event) => {
      isDragging = true;
      lastMousePos = { x: event.clientX, y: event.clientY };
      canvas.style.cursor = 'grabbing';
    };

    const handleMouseMove = (event) => {
      if (!isDragging) return;

      const deltaX = event.clientX - lastMousePos.x;
      const deltaY = event.clientY - lastMousePos.y;
      
      const scale = Math.pow(2, mapState.zoom - 10) * 100000;
      const newCenter = {
        lng: mapState.center.lng - deltaX / scale,
        lat: mapState.center.lat + deltaY / scale
      };

      setMapState(prev => ({ ...prev, center: newCenter }));
      lastMousePos = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
      canvas.style.cursor = 'grab';
    };

    // Zoom functionality
    const handleWheel = (event) => {
      event.preventDefault();
      const zoomDelta = event.deltaY > 0 ? -0.5 : 0.5;
      const newZoom = Math.max(10, Math.min(20, mapState.zoom + zoomDelta));
      setMapState(prev => ({ ...prev, zoom: newZoom }));
    };

    // Event listeners
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);
    window.addEventListener('resize', resizeCanvas);

    // Initial setup
    resizeCanvas();
    canvas.style.cursor = 'grab';

    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [booths, mapState]);

  // Point in polygon test
  const isPointInPolygon = (point, polygon) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (((polygon[i][1] > point[1]) !== (polygon[j][1] > point[1])) &&
          (point[0] < (polygon[j][0] - polygon[i][0]) * (point[1] - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0])) {
        inside = !inside;
      }
    }
    return inside;
  };

  // Close popup
  const closePopup = () => {
    setSelectedBooth(null);
    setPopupPosition(null);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectedBooth && !event.target.closest('.booth-popup')) {
        closePopup();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [selectedBooth]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading interactive floor plan...
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative', overflow: 'hidden' }}>
      <div 
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%', position: 'relative' }}
      >
        <canvas
          ref={canvasRef}
          style={{ 
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
      </div>
      
      {/* Popup */}
      {selectedBooth && popupPosition && (
        <div 
          className="booth-popup"
          style={{
            position: 'fixed',
            left: popupPosition.x + 10,
            top: popupPosition.y - 10,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '15px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '250px',
            maxWidth: '300px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>Booth {selectedBooth.boothId}</h3>
            <button 
              onClick={closePopup}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '20px', 
                cursor: 'pointer',
                padding: '0',
                width: '24px',
                height: '24px',
                color: '#666'
              }}
            >
              ×
            </button>
          </div>
          <p style={{ margin: '8px 0', fontSize: '16px', fontWeight: 'bold', color: '#007bff' }}>
            {selectedBooth.name}
          </p>
          {selectedBooth.description && (
            <p style={{ margin: '8px 0', fontSize: '14px', color: '#555', lineHeight: '1.4' }}>
              {selectedBooth.description}
            </p>
          )}
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#888' }}>
            Coordinates: {selectedBooth.coords.length} points
          </p>
        </div>
      )}
      
      {/* Controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000
      }}>
        <div style={{ fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>
          Interactive Floor Plan
        </div>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
          Booths: {booths.length} | Zoom: {mapState.zoom.toFixed(1)}
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          Pan: Click & drag | Zoom: Mouse wheel
        </div>
      </div>

      {/* Zoom Controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <button
          onClick={() => setMapState(prev => ({ ...prev, zoom: Math.min(20, prev.zoom + 1) }))}
          style={{
            padding: '10px 15px',
            border: 'none',
            background: 'white',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            borderBottom: '1px solid #eee'
          }}
        >
          +
        </button>
        <button
          onClick={() => setMapState(prev => ({ ...prev, zoom: Math.max(10, prev.zoom - 1) }))}
          style={{
            padding: '10px 15px',
            border: 'none',
            background: 'white',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold'
          }}
        >
          −
        </button>
      </div>
    </div>
  );
};

export default MapLibreFloorPlan;
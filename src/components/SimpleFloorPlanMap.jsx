import React, { useEffect, useRef, useState } from 'react';

// Simple mock booth data
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
  }
];

// Simple coordinate conversion utilities
const latToY = (lat, zoom) => {
  const latRad = lat * Math.PI / 180;
  return (1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2 * Math.pow(2, zoom) * 256;
};

const lngToX = (lng, zoom) => {
  return (lng + 180) / 360 * Math.pow(2, zoom) * 256;
};

const SimpleFloorPlanMap = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [booths, setBooths] = useState([]);
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);
  const [mapCenter] = useState({ lat: 12.9716, lng: 77.5946 });
  const [zoom] = useState(18);
  const [loading, setLoading] = useState(true);

  // Load booth data
  useEffect(() => {
    const loadBooths = async () => {
      try {
        // Simulate API call
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

  // Draw map and booths
  useEffect(() => {
    if (!canvasRef.current || booths.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Set canvas size
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw simple grid background
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Calculate center offset
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const centerPixelX = lngToX(mapCenter.lng, zoom);
    const centerPixelY = latToY(mapCenter.lat, zoom);

    // Draw booths
    booths.forEach(booth => {
      const pixelCoords = booth.coords.map(coord => {
        const x = lngToX(coord[0], zoom) - centerPixelX + centerX;
        const y = latToY(coord[1], zoom) - centerPixelY + centerY;
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
      ctx.fillStyle = 'rgba(0, 123, 255, 0.3)';
      ctx.fill();
      ctx.strokeStyle = '#007bff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw booth label
      const centerX = pixelCoords.reduce((sum, coord) => sum + coord[0], 0) / pixelCoords.length;
      const centerY = pixelCoords.reduce((sum, coord) => sum + coord[1], 0) / pixelCoords.length;
      
      ctx.fillStyle = '#000';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(booth.boothId, centerX, centerY);
    });
  }, [booths, mapCenter, zoom]);

  // Handle canvas click
  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if click is inside any booth
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const centerPixelX = lngToX(mapCenter.lng, zoom);
    const centerPixelY = latToY(mapCenter.lat, zoom);

    booths.forEach(booth => {
      const pixelCoords = booth.coords.map(coord => {
        const px = lngToX(coord[0], zoom) - centerPixelX + centerX;
        const py = latToY(coord[1], zoom) - centerPixelY + centerY;
        return [px, py];
      });

      if (isPointInPolygon([x, y], pixelCoords)) {
        setSelectedBooth(booth);
        setPopupPosition({ x: event.clientX, y: event.clientY });
      }
    });
  };

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
        Loading floor plan...
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ height: '100vh', width: '100%', position: 'relative', background: '#f5f5f5' }}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{ 
          width: '100%', 
          height: '100%', 
          cursor: 'pointer',
          display: 'block'
        }}
      />
      
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
            Area: {selectedBooth.coords.length} corner points
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
          Simple Floor Plan Map
        </div>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
          Booths loaded: {booths.length}
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Click on booths for details
        </div>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000
      }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
          Legend
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ 
            width: '20px', 
            height: '15px', 
            background: 'rgba(0, 123, 255, 0.3)', 
            border: '2px solid #007bff',
            marginRight: '8px'
          }}></div>
          <span style={{ fontSize: '12px' }}>Exhibition Booths</span>
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          Simulated map coordinates
        </div>
      </div>
    </div>
  );
};

export default SimpleFloorPlanMap;
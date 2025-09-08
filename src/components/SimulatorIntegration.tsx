import React, { useEffect, useState } from 'react';

interface Rect {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  score: number;
}

interface Wall {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  length: number;
  angle: number;
}

interface DetectionData {
  rects: Rect[];
  walls: Wall[];
  imageWidth: number;
  imageHeight: number;
  overlay: string | null;
}

/**
 * Example Simulator component that listens for detection events
 * Integrate this pattern into your existing Simulator component
 */
export const SimulatorIntegration: React.FC = () => {
  const [booths, setBooths] = useState<Rect[]>([]);
  const [walls, setWalls] = useState<Wall[]>([]);
  const [overlayUrl, setOverlayUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    // Listen for detection results
    const handleDetections = (e: CustomEvent<DetectionData>) => {
      const { rects, walls, imageWidth, imageHeight, overlay } = e.detail || {};
      
      if (rects) {
        console.log('Received booth detections:', rects);
        setBooths(rects);
      }
      
      if (walls) {
        console.log('Received wall detections:', walls);
        setWalls(walls);
      }
      
      if (overlay) {
        const fullOverlayUrl = `http://localhost:5000${overlay}`;
        console.log('Received overlay:', fullOverlayUrl);
        setOverlayUrl(fullOverlayUrl);
      }
      
      if (imageWidth && imageHeight) {
        setImageSize({ w: imageWidth, h: imageHeight });
      }
    };

    // Listen for detection errors
    const handleDetectionError = (e: CustomEvent<{ error: string }>) => {
      console.error('Detection error:', e.detail.error);
      // Handle error (show notification, etc.)
    };

    window.addEventListener('simulator:detections', handleDetections as EventListener);
    window.addEventListener('simulator:detection-error', handleDetectionError as EventListener);

    return () => {
      window.removeEventListener('simulator:detections', handleDetections as EventListener);
      window.removeEventListener('simulator:detection-error', handleDetectionError as EventListener);
    };
  }, []);

  // Convert image coordinates to display coordinates if needed
  const scaleCoordinates = (rect: Rect, displayWidth: number, displayHeight: number) => {
    if (imageSize.w === 0 || imageSize.h === 0) return rect;
    
    return {
      ...rect,
      x: (rect.x * displayWidth) / imageSize.w,
      y: (rect.y * displayHeight) / imageSize.h,
      w: (rect.w * displayWidth) / imageSize.w,
      h: (rect.h * displayHeight) / imageSize.h,
    };
  };

  return (
    <div className="simulator-container">
      <div className="detection-info">
        <p>Detected Booths: {booths.length}</p>
        <p>Detected Walls: {walls.length}</p>
        <p>Image Size: {imageSize.w} x {imageSize.h}</p>
        {overlayUrl && (
          <div>
            <p>Overlay Available:</p>
            <img src={overlayUrl} alt="Detection Overlay" style={{ maxWidth: '200px' }} />
          </div>
        )}
      </div>
      
      {/* Your existing simulator rendering logic here */}
      <div className="simulator-canvas">
        {/* Render booths as draggable/resizable elements */}
        {booths.map((booth) => (
          <div
            key={booth.id}
            className="booth-element"
            style={{
              position: 'absolute',
              left: booth.x,
              top: booth.y,
              width: booth.w,
              height: booth.h,
              border: '2px solid green',
              backgroundColor: 'rgba(0, 255, 0, 0.2)',
            }}
          >
            Booth {booth.id}
          </div>
        ))}
        
        {/* Render walls */}
        {walls.map((wall) => (
          <svg
            key={wall.id}
            style={{
              position: 'absolute',
              left: Math.min(wall.x1, wall.x2),
              top: Math.min(wall.y1, wall.y2),
              width: Math.abs(wall.x2 - wall.x1) + 10,
              height: Math.abs(wall.y2 - wall.y1) + 10,
              pointerEvents: 'none',
            }}
          >
            <line
              x1={wall.x1 - Math.min(wall.x1, wall.x2)}
              y1={wall.y1 - Math.min(wall.y1, wall.y2)}
              x2={wall.x2 - Math.min(wall.x1, wall.x2)}
              y2={wall.y2 - Math.min(wall.y1, wall.y2)}
              stroke="red"
              strokeWidth="3"
            />
          </svg>
        ))}
      </div>
    </div>
  );
};
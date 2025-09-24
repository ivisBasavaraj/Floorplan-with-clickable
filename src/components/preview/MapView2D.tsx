import React, { useCallback } from 'react';
// import FloorPlanMap from '../../components/FloorPlanMap';
import PlainLeafletMap from '../../components/PlainLeafletMap';
import { useCanvasStore } from '../../store/canvasStore';
import type { AnyCanvasElement, BoothElement } from '../../types/canvas';

// Default georeferencing bounds near Bengaluru (SW -> NE)
const DEFAULT_IMAGE_BOUNDS: [[number, number], [number, number]] = (
  [[12.9712, 77.5939], [12.9720, 77.5951]]
);

// Compute rectangle corners with rotation around center
function getRotatedRectPoints(x: number, y: number, w: number, h: number, rotationDeg: number) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const corners = [
    { x: x,     y: y     }, // top-left
    { x: x + w, y: y     }, // top-right
    { x: x + w, y: y + h }, // bottom-right
    { x: x,     y: y + h }, // bottom-left
  ];

  return corners.map((p) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    return {
      x: cx + dx * cos - dy * sin,
      y: cy + dx * sin + dy * cos,
    };
  });
}

export interface MapView2DProps {
  // Optional override for real-world bounds (SW -> NE)
  imageBounds?: [[number, number], [number, number]];
  // Optional map center and zoom
  center?: [number, number];
  zoom?: number;
  halls?: { id: string; name: string; polygon: [number, number][]; color?: string }[];
  onHallClick?: (hall: { id: string; name: string; polygon: [number, number][]; color?: string }) => void;
  enableDrawPolygon?: boolean;
  onPolygonComplete?: (polygon: [number, number][]) => void;
}

export const MapView2D: React.FC<MapView2DProps> = ({ imageBounds = DEFAULT_IMAGE_BOUNDS, center, zoom, halls, onHallClick, enableDrawPolygon, onPolygonComplete }) => {
  const { elements, canvasSize } = useCanvasStore();

  const drawBooths = useCallback((ctx: CanvasRenderingContext2D, transform: any) => {
    const { overlay, overlayBounds } = transform;
    if (!overlayBounds) {
      // Warn if no georeferencing provided
      ctx.fillStyle = 'rgba(255,0,0,0.7)';
      ctx.font = '14px Arial';
      ctx.fillText('imageBounds not set', 12, 24);
      return;
    }

    // Draw booths from canvas store
    const booths = elements.filter((el: AnyCanvasElement) => el.type === 'booth') as BoothElement[];

    booths.forEach((b) => {
      const poly = getRotatedRectPoints(b.x, b.y, b.width, b.height, b.rotation);
      const screenPts = poly
        .map((p) => overlay.xyToContainerPoint(p.x, p.y, canvasSize.width, canvasSize.height))
        .filter(Boolean);
      if (screenPts.length < 4) return;

      // Draw polygon
      ctx.beginPath();
      ctx.moveTo(screenPts[0].x, screenPts[0].y);
      for (let i = 1; i < screenPts.length; i++) {
        ctx.lineTo(screenPts[i].x, screenPts[i].y);
      }
      ctx.closePath();

      // Fill and stroke similar to expofp style
      ctx.fillStyle = b.status === 'sold' ? 'rgba(0,123,255,0.35)'
        : b.status === 'reserved' ? 'rgba(40,167,69,0.35)'
        : 'rgba(108,117,125,0.25)';
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#34495e';
      ctx.stroke();

      // Label: booth number at centroid
      const cx = screenPts.reduce((acc, p) => acc + p.x, 0) / screenPts.length;
      const cy = screenPts.reduce((acc, p) => acc + p.y, 0) / screenPts.length;
      ctx.fillStyle = '#111';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.number || '', cx, cy);
    });
  }, [elements, canvasSize]);

  return (
    <PlainLeafletMap
      drawBooths={drawBooths}
      imageBounds={imageBounds}
      center={center}
      zoom={zoom}
      halls={halls}
      onHallClick={onHallClick}
      enableDrawPolygon={enableDrawPolygon}
      onPolygonComplete={onPolygonComplete}
    />
  );
};

export default MapView2D;
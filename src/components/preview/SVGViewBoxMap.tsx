import React, { useMemo } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import type { AnyCanvasElement, BoothElement } from '../../types/canvas';

interface SVGViewBoxMapProps {
  onBoothClick?: (boothId: string) => void;
  selectedBoothId?: string;
}

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

function polygonCenter(points: {x:number;y:number}[]) {
  const cx = points.reduce((acc, p) => acc + p.x, 0) / points.length;
  const cy = points.reduce((acc, p) => acc + p.y, 0) / points.length;
  return { cx, cy };
}

export const SVGViewBoxMap: React.FC<SVGViewBoxMapProps> = ({ onBoothClick, selectedBoothId }) => {
  const { elements } = useCanvasStore();

  // Compute content bounding box from elements to define viewBox
  const bbox = useMemo(() => {
    if (!elements || elements.length === 0) {
      return { minX: 0, minY: 0, width: 1000, height: 600 };
    }
    const minX = Math.min(...elements.map((e) => e.x));
    const minY = Math.min(...elements.map((e) => e.y));
    const maxX = Math.max(...elements.map((e) => e.x + e.width));
    const maxY = Math.max(...elements.map((e) => e.y + e.height));
    const padding = 40;
    return {
      minX: minX - padding,
      minY: minY - padding,
      width: (maxX - minX) + padding * 2,
      height: (maxY - minY) + padding * 2,
    };
  }, [elements]);

  const booths = useMemo(() => {
    return (elements || []).filter((el: AnyCanvasElement) => el.type === 'booth') as BoothElement[];
  }, [elements]);

  return (
    <div className="w-full h-full" style={{ background: '#ffffff' }}>
      <svg
        viewBox={`${bbox.minX} ${bbox.minY} ${bbox.width} ${bbox.height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        {/* Optional: background floor outline or image could be drawn here using image elements */}

        {/* Draw booths similar to ExpoFP styling using SVG paths/polygons */}
        {booths.map((b) => {
          const pts = getRotatedRectPoints(b.x, b.y, b.width, b.height, b.rotation || 0);
          const pointsAttr = pts.map((p) => `${p.x},${p.y}`).join(' ');

          // Colors akin to ExpoFP theme
          const fill = b.status === 'sold'
            ? 'rgba(0,123,255,0.35)'
            : b.status === 'reserved'
              ? 'rgba(40,167,69,0.35)'
              : 'rgba(108,117,125,0.25)';
          const stroke = '#34495e';
          const strokeWidth = 2;

          const { cx, cy } = polygonCenter(pts);
          const isSelected = selectedBoothId === b.id;

          return (
            <g key={b.id} style={{ cursor: 'pointer' }} onClick={() => onBoothClick && onBoothClick(b.id)}>
              <polygon
                points={pointsAttr}
                fill={fill}
                stroke={isSelected ? '#e11d48' : stroke}
                strokeWidth={isSelected ? strokeWidth * 1.5 : strokeWidth}
              />
              {/* Label */}
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#111"
                fontSize={Math.max(10, Math.min(16, Math.min(b.width, b.height) / 2))}
                fontWeight="bold"
                style={{ userSelect: 'none' }}
              >
                {b.number || ''}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default SVGViewBoxMap;
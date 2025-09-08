import React from 'react';
import { Line, Group } from 'react-konva';

interface CanvasGridProps {
  enabled: boolean;
  size: number;
  width: number;
  height: number;
  opacity?: number;
}

export const CanvasGrid: React.FC<CanvasGridProps> = ({ 
  enabled, 
  size, 
  width, 
  height,
  opacity = 0.2
}) => {
  if (!enabled) return null;
  
  const horizontalLines = [];
  const verticalLines = [];
  
  // Generate horizontal grid lines
  for (let i = 0; i <= height; i += size) {
    horizontalLines.push(
      <Line
        key={`h-${i}`}
        points={[0, Math.round(i), width, Math.round(i)]} // Round for pixel-perfect alignment
        stroke="#D3D3D3"
        strokeWidth={i % (size * 5) === 0 ? 1 : 0.5}
        opacity={opacity}
        perfectDrawEnabled={true} // Enable perfect drawing for crisp lines
        shadowForStrokeEnabled={false} // Disable shadow for better performance
        listening={false} // Disable event listening for better performance
      />
    );
  }
  
  // Generate vertical grid lines
  for (let i = 0; i <= width; i += size) {
    verticalLines.push(
      <Line
        key={`v-${i}`}
        points={[Math.round(i), 0, Math.round(i), height]} // Round for pixel-perfect alignment
        stroke="#D3D3D3"
        strokeWidth={i % (size * 5) === 0 ? 1 : 0.5}
        opacity={opacity}
        perfectDrawEnabled={true} // Enable perfect drawing for crisp lines
        shadowForStrokeEnabled={false} // Disable shadow for better performance
        listening={false} // Disable event listening for better performance
      />
    );
  }
  
  return (
    <Group>
      {horizontalLines}
      {verticalLines}
    </Group>
  );
};
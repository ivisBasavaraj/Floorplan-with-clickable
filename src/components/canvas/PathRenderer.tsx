import React from 'react';
import { Line } from 'react-konva';

interface PathRendererProps {
  pathPoints: number[];
}

export const PathRenderer: React.FC<PathRendererProps> = ({ pathPoints }) => {
  // Only render the path if we have points
  if (pathPoints.length < 4) return null;

  return (
    <Line
      points={pathPoints}
      stroke="#FF0000"
      strokeWidth={2}
      tension={0.3}
      lineCap="round"
      lineJoin="round"
      dash={[5, 2]}
    />
  );
};
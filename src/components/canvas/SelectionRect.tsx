import React from 'react';
import { Rect } from 'react-konva';
import { Point } from '../../types/canvas';

interface SelectionRectProps {
  start: Point;
  end: Point;
}

export const SelectionRect: React.FC<SelectionRectProps> = ({ start, end }) => {
  const topLeft = {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y)
  };
  
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  
  return (
    <Rect
      x={topLeft.x}
      y={topLeft.y}
      width={width}
      height={height}
      fill="rgba(0, 161, 255, 0.1)"
      stroke="rgba(0, 161, 255, 0.7)"
      strokeWidth={1}
      dash={[5, 5]}
    />
  );
};
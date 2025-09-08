import React from 'react';
import { Group, Rect, Circle, Line } from 'react-konva';
import { useCanvasStore } from '../../store/canvasStore';
import type { ShapeElement } from '../../types/canvas';

interface FlooringLayerProps {
  opacity: number;
  elements: ShapeElement[];
}

export const FlooringLayer: React.FC<FlooringLayerProps> = ({ opacity, elements }) => {
  const { updateFlooringElement, deleteFlooringElement } = useCanvasStore();
  
  const renderShape = (element: ShapeElement) => {
    switch (element.shapeType) {
      case 'rectangle':
        return (
          <Rect
            key={element.id}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            opacity={opacity}
            rotation={element.rotation}
            draggable={true}
            onDragEnd={(e) => {
              updateFlooringElement(element.id, {
                x: e.target.x(),
                y: e.target.y()
              });
            }}
          />
        );
        
      case 'circle':
        return (
          <Circle
            key={element.id}
            x={element.x + element.width / 2}
            y={element.y + element.height / 2}
            radius={Math.min(element.width, element.height) / 2}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            opacity={opacity}
            draggable={true}
            onDragEnd={(e) => {
              updateFlooringElement(element.id, {
                x: e.target.x() - element.width / 2,
                y: e.target.y() - element.height / 2
              });
            }}
          />
        );
        
      case 'polygon':
      case 'line':
        return (
          <Line
            key={element.id}
            points={element.points || []}
            x={element.x}
            y={element.y}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            closed={element.shapeType === 'polygon'}
            opacity={opacity}
            draggable={true}
            onDragEnd={(e) => {
              updateFlooringElement(element.id, {
                x: e.target.x(),
                y: e.target.y()
              });
            }}
          />
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Group>
      {elements.map(renderShape)}
    </Group>
  );
};
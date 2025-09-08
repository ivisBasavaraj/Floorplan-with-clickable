import React from 'react';
import { Rect, Line, Group, Text, Circle, Path } from 'react-konva';
import { Point } from '../../types/canvas';
import { IconPaths, IconColors } from '../icons/IconPaths';

interface PreviewShapeProps {
  tool: string;
  start: Point;
  end: Point;
}

export const PreviewShape: React.FC<PreviewShapeProps> = ({ tool, start, end }) => {
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);

  // Enhanced icon data retrieval with all tool types
  const getIconData = (toolType: string) => {
    let iconPath = '';
    let iconColor = '#333333';
    let needsBackground = true;

    // Map all tools to their corresponding icons
    switch (toolType) {
      case 'booth':
        iconPath = IconPaths.booth;
        iconColor = IconColors.booth;
        break;
      case 'line':
        iconPath = IconPaths.line;
        iconColor = IconColors.line;
        needsBackground = false;
        break;
      case 'wall':
        iconPath = IconPaths.wall;
        iconColor = IconColors.wall;
        break;
      case 'door':
        iconPath = IconPaths.door;
        iconColor = IconColors.door;
        break;
      case 'furniture':
      case 'meeting-room':
        iconPath = IconPaths.meeting;
        iconColor = IconColors.meeting;
        break;
      case 'restaurant':
        iconPath = IconPaths.restaurant;
        iconColor = IconColors.restaurant;
        break;
      case 'cafeteria':
        iconPath = IconPaths.cafeteria;
        iconColor = IconColors.cafeteria;
        break;
      case 'restroom':
      case 'mens-restroom':
      case 'womens-restroom':
        iconPath = IconPaths.restroom;
        iconColor = IconColors.restroom;
        break;
      case 'medical':
      case 'first-aid':
        iconPath = IconPaths.medical;
        iconColor = IconColors.medical;
        break;
      case 'information':
      case 'info-point':
        iconPath = IconPaths.info;
        iconColor = IconColors.info;
        break;
      case 'elevator':
        iconPath = IconPaths.elevator;
        iconColor = IconColors.elevator;
        break;
      case 'emergency-exit':
        iconPath = IconPaths.emergency;
        iconColor = IconColors.emergency;
        break;
      case 'wheelchair-accessible':
        iconPath = IconPaths.accessible;
        iconColor = IconColors.accessible;
        break;
      case 'childcare':
      case 'nursing-room':
        iconPath = IconPaths.childcare;
        iconColor = IconColors.childcare;
        break;
      case 'atm':
        iconPath = IconPaths.atm;
        iconColor = IconColors.atm;
        break;
      case 'transportation':
        iconPath = IconPaths.transportation;
        iconColor = IconColors.transportation;
        break;
      case 'no-smoking':
        iconPath = IconPaths["no-smoking"];
        iconColor = IconColors["no-smoking"];
        break;
      case 'baggage':
        iconPath = IconPaths.baggage;
        iconColor = IconColors.baggage;
        break;
      case 'plant':
        iconPath = IconPaths.plant;
        iconColor = IconColors.plant;
        break;
      case 'text':
        iconPath = IconPaths.text;
        iconColor = IconColors.text;
        break;
      case 'emergency':
        iconPath = IconPaths.emergency;
        iconColor = IconColors.emergency;
        break;
      default:
        iconPath = IconPaths.booth;
        iconColor = IconColors.booth;
    }

    return { iconPath, iconColor, needsBackground };
  };

  // Enhanced icon rendering with perfect scaling
  const renderIcon = (iconPath: string, iconColor: string, elementWidth: number, elementHeight: number, elementX: number, elementY: number) => {
    // Calculate optimal icon size
    const minSize = Math.min(elementWidth, elementHeight);
    let iconSize: number;

    if (minSize <= 20) {
      iconSize = minSize * 0.9;
    } else if (minSize <= 40) {
      iconSize = minSize * 0.8;
    } else if (minSize <= 80) {
      iconSize = minSize * 0.7;
    } else {
      iconSize = Math.min(minSize * 0.6, 60); // Cap for preview
    }

    iconSize = Math.max(iconSize, 12); // Minimum for visibility

    const scale = iconSize / 40; // 40 is base viewBox
    const iconX = elementX + (elementWidth - iconSize) / 2;
    const iconY = elementY + (elementHeight - iconSize) / 2;

    return (
      <Path
        x={iconX}
        y={iconY}
        data={iconPath}
        fill={iconColor}
        scaleX={scale}
        scaleY={scale}
        opacity={0.8} // Slightly transparent for preview
        listening={false}
      />
    );
  };

  // Render the shape with its icon
  const renderShapeWithIcon = () => {
    try {
      // Get icon data
      const { iconPath, iconColor, needsBackground } = getIconData(tool);
      
      // Create the background shape
      let backgroundShape;
      
      if (tool === 'line') {
        backgroundShape = (
          <Line
            points={[start.x, start.y, end.x, end.y]}
            stroke={iconColor}
            strokeWidth={2}
            dash={[8, 4]}
            opacity={0.7}
          />
        );
      } else {
        const rectWidth = Math.max(width, 20); // Minimum preview size
        const rectHeight = Math.max(height, 20);
        
        backgroundShape = (
          <Rect
            x={x}
            y={y}
            width={rectWidth}
            height={rectHeight}
            stroke={iconColor}
            strokeWidth={2}
            dash={[8, 4]}
            fill={`${iconColor}20`} // Light transparent fill
            cornerRadius={tool === 'plant' ? Math.min(rectWidth, rectHeight) / 2 : 4}
            opacity={0.8}
          />
        );
      }

      return (
        <Group>
          {backgroundShape}
          {/* Render icon if it's not a line */}
          {tool !== 'line' && iconPath && (
            renderIcon(iconPath, iconColor, Math.max(width, 20), Math.max(height, 20), x, y)
          )}
          
          {/* Add a helpful label for very small shapes */}
          {width > 50 && height > 30 && (
            <Text
              x={x + 4}
              y={y + Math.max(height, 20) - 16}
              text={tool.charAt(0).toUpperCase() + tool.slice(1)}
              fontSize={10}
              fill={iconColor}
              fontFamily="Arial"
              opacity={0.7}
            />
          )}
        </Group>
      );
    } catch (error) {
      console.error("Error rendering preview shape:", error);
      
      // Fallback to a simple rectangle if there's an error
      return (
        <Rect
          x={x}
          y={y}
          width={width || 40}
          height={height || 40}
          stroke="#333333"
          strokeWidth={1}
          dash={[5, 5]}
          fill="rgba(200, 200, 200, 0.5)"
        />
      );
    }
  };

  // If we're dragging (have both start and end points), render the shape with icon
  if (start && end) {
    return renderShapeWithIcon();
  }

  return null;
};
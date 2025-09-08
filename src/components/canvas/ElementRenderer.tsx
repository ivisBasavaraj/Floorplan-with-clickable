import React from 'react';
import { Group, Rect, Text, Circle, Line, Image, Transformer, Path, Shape } from 'react-konva';
import { useCanvasStore } from '../../store/canvasStore';
import { 
  AnyCanvasElement, 
  BoothElement, 
  TextElement, 
  ShapeElement, 
  ImageElement,
  DoorElement,
  FurnitureElement,
  PlantElement
} from '../../types/canvas';
import { IconPaths, IconColors } from '../icons/IconPaths';
import { FontAwesomeIconPaths, FontAwesomeIconColors, ToolToFontAwesome } from '../icons/FontAwesomeToSVG';

interface ElementRendererProps {
  element: AnyCanvasElement;
  isSelected: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({ 
  element, 
  isSelected, 
  snapToGrid, 
  gridSize 
}) => {
  const { updateElement, selectElements, deselectAll, deleteElements, viewerMode } = useCanvasStore();
  const shapeRef = React.useRef<any>(null);
  const transformerRef = React.useRef<any>(null);
  const deleteButtonRef = React.useRef<any>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  
  React.useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current && viewerMode === 'editor') {
      // Only attach transformer in editor mode
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected, viewerMode]);
  
  const getSnappedPosition = (pos: number) => {
    if (!snapToGrid) return pos;
    return Math.round(pos / gridSize) * gridSize;
  };
  
  const handleDragStart = (e: any) => {
    // Prevent dragging in viewer mode
    if (viewerMode !== 'editor') {
      e.cancelBubble = true;
      return;
    }
    
    console.log(`Starting drag for element ${element.id}`);
    setIsDragging(true);
    
    // Ensure the element is selected when starting to drag
    if (!useCanvasStore.getState().selectedIds.includes(element.id)) {
      selectElements([element.id]);
    }
    
    // Set z-index higher during drag for visual feedback
    if (shapeRef.current) {
      shapeRef.current.moveToTop();
    }
    
    // Prevent event from propagating to canvas
    e.cancelBubble = true;
  };
  
  const handleDragMove = (e: any) => {
    // Allow free movement during drag - don't snap in real-time
    // This prevents jerky movement and allows smooth dragging
    // We'll snap only on drag end
  };
  
  const handleDragEnd = (e: any) => {
    setIsDragging(false);
    
    let newX = e.target.x();
    let newY = e.target.y();
    
    // Only snap to grid if specifically enabled and user wants it
    // For now, let's allow free positioning
    if (snapToGrid && e.evt && e.evt.shiftKey) {
      // Only snap when holding Shift key during drag end
      newX = getSnappedPosition(newX);
      newY = getSnappedPosition(newY);
    }
    
    console.log(`Dragging element ${element.id} from (${element.x}, ${element.y}) to (${newX}, ${newY})`);
    
    updateElement(element.id, {
      x: newX,
      y: newY
    });
  };
  
  const handleTransformEnd = (e: any) => {
    // Get the updated dimensions and position
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale to 1 and apply scale to width/height
    node.scaleX(1);
    node.scaleY(1);
    
    let newWidth = Math.max(element.width * scaleX, 10);
    let newHeight = Math.max(element.height * scaleY, 10);
    let newX = node.x();
    let newY = node.y();
    
    if (snapToGrid) {
      newWidth = getSnappedPosition(newWidth);
      newHeight = getSnappedPosition(newHeight);
      newX = getSnappedPosition(newX);
      newY = getSnappedPosition(newY);
    }
    
    updateElement(element.id, {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      rotation: node.rotation()
    });
  };
  
  const handleClick = (e: any) => {
    // Prevent propagation to avoid deselection
    e.cancelBubble = true;
    
    console.log(`Clicked on element ${element.id} at (${element.x}, ${element.y})`);
    
    // Don't handle click if this was part of a drag operation
    if (isDragging) {
      return;
    }
    
    // Check for booth click to detect subsections
    if (element.type === 'booth' && !element.customProperties?.isSubsection) {
      window.dispatchEvent(new CustomEvent('booth-click', { detail: element }));
    }
    
    // In viewer mode, only allow booth clicks for information display
    if (viewerMode !== 'editor') {
      if (element.type === 'booth') {
        // Trigger booth click event for viewer mode
        window.dispatchEvent(new CustomEvent('booth-viewer-click', { detail: element.id }));
        return;
      } else {
        // For non-booth elements in viewer mode, do nothing
        return;
      }
    }
    
    // Editor mode: normal selection behavior
    // Check if shift is pressed for multi-select
    if (e.evt && e.evt.shiftKey) {
      const currentSelected = useCanvasStore.getState().selectedIds;
      if (currentSelected.includes(element.id)) {
        // Deselect if already selected
        selectElements(currentSelected.filter(id => id !== element.id));
      } else {
        // Add to selection
        selectElements([...currentSelected, element.id]);
      }
    } else {
      // Single select
      selectElements([element.id]);
    }
  };
  
  const renderElement = () => {
    switch (element.type) {
      case 'booth':
        return renderBooth(element as BoothElement);
      case 'text':
        return renderText(element as TextElement);
      case 'shape':
        return renderShape(element as ShapeElement);
      case 'image':
        return renderImage(element as ImageElement);
      case 'door':
        return renderDoor(element as DoorElement);
      case 'furniture':
        return renderFurniture(element as FurnitureElement);
      case 'plant':
        return renderPlant(element as PlantElement);
      default:
        return null;
    }
  };
  
  // Enhanced helper function to render a high-quality, auto-scaling icon
  const renderIcon = (element: AnyCanvasElement, iconPath: string, iconColor?: string): JSX.Element | null => {
    // Dynamic sizing based on element size - more responsive
    const minElementSize = Math.min(element.width, element.height);
    const maxElementSize = Math.max(element.width, element.height);
    
    // Enhanced adaptive icon sizing based on element dimensions
    let iconSize: number;
    const aspectRatio = maxElementSize / minElementSize;
    
    // Base calculation with improved scaling
    if (minElementSize <= 25) {
      // Tiny elements - icon fills most space
      iconSize = minElementSize * 0.95;
    } else if (minElementSize <= 40) {
      // Small elements - prominent icon
      iconSize = minElementSize * 0.85;
    } else if (minElementSize <= 80) {
      // Medium elements - balanced icon
      iconSize = minElementSize * 0.7;
    } else if (minElementSize <= 150) {
      // Large elements - proportional icon
      iconSize = minElementSize * 0.55;
    } else {
      // Very large elements - capped icon with slight increase for readability
      iconSize = Math.min(minElementSize * 0.35, 100);
    }
    
    // Adjust for extreme aspect ratios (very wide or tall elements)
    if (aspectRatio > 3) {
      iconSize = Math.min(iconSize, minElementSize * 0.9);
    }
    
    // Ensure visibility with better minimum sizes
    iconSize = Math.max(iconSize, 14);
    
    // Calculate scale factor from the 40x40 base viewBox
    const baseSize = 40;
    const scale = iconSize / baseSize;
    
    // Center the icon in the element
    const xPos = (element.width - iconSize) / 2;
    const yPos = (element.height - iconSize) / 2;
    
    // Enhanced color selection with better defaults
    const defaultColor = iconColor || element.stroke || "#333333";
    
    // Smart stroke detection - look for common SVG path patterns
    const hasClosedPaths = iconPath.includes('Z');
    const hasLineCommands = iconPath.includes('L') || iconPath.includes('Q') || iconPath.includes('C');
    const isStrokeBased = hasLineCommands && !hasClosedPaths;
    
    // Adaptive stroke width based on icon size
    const strokeWidth = Math.max(scale * 1.5, 1);
    
    try {
      return (
        <Path
          x={xPos}
          y={yPos}
          data={iconPath}
          fill={isStrokeBased ? 'transparent' : defaultColor}
          stroke={isStrokeBased ? defaultColor : undefined}
          strokeWidth={isStrokeBased ? strokeWidth : 0}
          scaleX={scale}
          scaleY={scale}
          perfectDrawEnabled={true} // Enable perfect drawing for crisp edges
          listening={false} // Optimize performance by disabling event listening on the icon
          shadowForStrokeEnabled={false} // Disable shadow for better performance
          hitStrokeWidth={0} // Optimize hit detection
          lineCap="round" // Smooth line endings
          lineJoin="round" // Smooth line joins
          tension={0.5} // Add slight curve tension for smoother appearance
          visible={true} // Force visibility
        />
      );
    } catch (error) {
      console.error("Error rendering icon:", error);
      // Fallback to a simple visible shape if there's an error
      return (
        <Rect
          x={xPos}
          y={yPos}
          width={baseSize * scale}
          height={baseSize * scale}
          fill={color}
          opacity={0.5}
          cornerRadius={5}
        />
      );
    }
  };

  const renderBooth = (booth: BoothElement) => {
    const pathData = `M0,0L${booth.width},0L${booth.width},${booth.height}L0,${booth.height}Z`;
    
    return (
      <>
        <Path
          data={pathData}
          fill="#4A90E2"
          stroke="#2E5BBA"
          strokeWidth={3}
          shadowColor="rgba(74, 144, 226, 0.4)"
          shadowBlur={8}
          shadowOffset={{ x: 2, y: 2 }}
          shadowOpacity={0.6}
        />
        
        {booth.width > 25 && booth.height > 15 && (
          <Text
            x={0}
            y={booth.height / 2 - (Math.min(booth.width * 0.3, booth.height * 0.3, 24) / 2)}
            text={booth.number}
            fontSize={Math.min(booth.width * 0.3, booth.height * 0.3, 24)}
            fontFamily="Arial, sans-serif"
            fontStyle="bold"
            fill="white"
            align="center"
            width={booth.width}
            shadowColor="rgba(0, 0, 0, 0.3)"
            shadowBlur={2}
            shadowOffset={{ x: 1, y: 1 }}
          />
        )}
      </>
    );
  };
  
  const renderText = (text: TextElement) => {
    return (
      <>
        <Text
          x={0}
          y={0}
          width={text.width}
          height={text.height}
          text={text.text}
          fontSize={text.fontSize}
          fontFamily={text.fontFamily}
          fill={text.fill}
          align={text.align}
          fontStyle={text.fontStyle}
        />
        {/* Text icon is optional since the text itself is visible */}
      </>
    );
  };
  
  const renderShape = (shape: ShapeElement) => {
    switch (shape.shapeType) {
      case 'rectangle':
        return (
          <>
            <Rect
              x={0}
              y={0}
              width={shape.width}
              height={shape.height}
              fill={shape.fill}
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
            />
            {renderIcon(shape, IconPaths.wall, IconColors.wall)}
          </>
        );
      case 'circle':
        const radius = Math.min(shape.width, shape.height) / 2;
        return (
          <>
            <Circle
              x={shape.width / 2}
              y={shape.height / 2}
              radius={radius}
              fill={shape.fill}
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
            />
          </>
        );
      case 'line':
      case 'arrow':
        return (
          <>
            <Line
              points={shape.points || [0, 0, shape.width, shape.height]}
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
              lineCap="round"
              lineJoin="round"
              dash={shape.shapeType === 'line' ? undefined : [10, 5]}
            />
            {/* For lines, we don't add an icon as it would interfere with the line itself */}
          </>
        );
      default:
        return null;
    }
  };
  
  const renderImage = (image: ImageElement) => {
    const [imageObj, setImageObj] = React.useState<HTMLImageElement | null>(null);
    const [imageLoaded, setImageLoaded] = React.useState(false);
    const [imageError, setImageError] = React.useState(false);
    
    React.useEffect(() => {
      if (image.src) {
        console.log('Loading image:', image.src);
        const img = new window.Image();
        img.crossOrigin = 'anonymous'; // Handle CORS issues
        
        img.onload = () => {
          console.log('Image loaded successfully:', image.src);
          setImageObj(img);
          setImageLoaded(true);
          setImageError(false);
        };
        
        img.onerror = (error) => {
          console.error('Failed to load image:', image.src, error);
          setImageError(true);
          setImageLoaded(false);
        };
        
        // Add timeout for loading
        const timeout = setTimeout(() => {
          if (!imageLoaded && !imageError) {
            console.warn('Image loading timeout:', image.src);
            setImageError(true);
            setImageLoaded(false);
          }
        }, 10000); // 10 second timeout
        
        img.src = image.src;
        
        return () => {
          clearTimeout(timeout);
          img.onload = null;
          img.onerror = null;
        };
      }
    }, [image.src, imageLoaded, imageError]);
    
    return (
      <>
        {/* Background placeholder */}
        <Rect
          x={0}
          y={0}
          width={image.width}
          height={image.height}
          fill={imageLoaded ? 'transparent' : (image.fill || '#f7fafc')}
          stroke={imageLoaded ? 'transparent' : '#e2e8f0'}
          strokeWidth={imageLoaded ? 0 : 1}
          cornerRadius={4}
        />
        
        {/* Actual image */}
        {imageLoaded && imageObj && (
          <Image
            x={0}
            y={0}
            width={image.width}
            height={image.height}
            image={imageObj}
            opacity={image.opacity || 1}
            cornerRadius={4}
          />
        )}
        
        {/* Loading indicator */}
        {!imageLoaded && !imageError && image.src && (
          <Group>
            <Text
              x={image.width / 2}
              y={image.height / 2 - 10}
              text="Loading..."
              fontSize={12}
              fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
              fill="#718096"
              align="center"
              width={image.width}
            />
            {renderIcon(image, FontAwesomeIconPaths['fas fa-image'], '#718096')}
          </Group>
        )}
        
        {/* Error indicator with better fallback */}
        {imageError && (
          <Group>
            <Rect
              x={4}
              y={4}
              width={image.width - 8}
              height={image.height - 8}
              fill="rgba(254, 226, 226, 0.8)"
              stroke="#f56565"
              strokeWidth={2}
              cornerRadius={6}
              dash={[5, 5]}
            />
            <Text
              x={image.width / 2}
              y={image.height / 2 - 15}
              text="Image Error"
              fontSize={Math.min(12, image.width * 0.1)}
              fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
              fontStyle="bold"
              fill="#e53e3e"
              align="center"
              width={image.width}
            />
            <Text
              x={image.width / 2}
              y={image.height / 2 + 5}
              text={image.src ? 'Failed to load' : 'No source'}
              fontSize={Math.min(10, image.width * 0.08)}
              fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
              fill="#a0aec0"
              align="center"
              width={image.width}
            />
            {renderIcon(image, FontAwesomeIconPaths['fas fa-image'], '#f56565')}
          </Group>
        )}
        
        {/* Fallback when no src */}
        {!image.src && (
          <Group>
            <Rect
              x={4}
              y={4}
              width={image.width - 8}
              height={image.height - 8}
              fill="rgba(247, 250, 252, 0.8)"
              stroke="#cbd5e0"
              strokeWidth={2}
              cornerRadius={6}
              dash={[8, 4]}
            />
            <Text
              x={image.width / 2}
              y={image.height / 2 - 10}
              text="No Image"
              fontSize={Math.min(12, image.width * 0.1)}
              fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
              fontStyle="bold"
              fill="#718096"
              align="center"
              width={image.width}
            />
            <Text
              x={image.width / 2}
              y={image.height / 2 + 5}
              text="Click to add"
              fontSize={Math.min(10, image.width * 0.08)}
              fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
              fill="#a0aec0"
              align="center"
              width={image.width}
            />
            {renderIcon(image, FontAwesomeIconPaths['fas fa-image'], '#cbd5e0')}
          </Group>
        )}
      </>
    );
  };
  
  const renderDoor = (door: DoorElement) => {
    // Check if it's an emergency exit
    const isEmergency = door.customProperties?.isEmergency || 
                       door.furnitureType === 'emergency';
    const iconToUse = isEmergency ? FontAwesomeIconPaths['fas fa-door-open'] : FontAwesomeIconPaths['fas fa-door-open'];
    const iconColor = isEmergency ? FontAwesomeIconColors['fas fa-door-open'] : FontAwesomeIconColors['fas fa-door-open'];
    
    return (
      <>
        {/* Subtle background with door-appropriate styling */}
        <Rect
          x={0}
          y={0}
          width={door.width}
          height={door.height}
          fill={isEmergency ? 'rgba(244, 67, 54, 0.1)' : 'rgba(211, 47, 47, 0.1)'}
          stroke={iconColor}
          strokeWidth={1}
          cornerRadius={isEmergency ? 4 : 2}
        />
        
        {/* Door icon with proper scaling */}
        {renderIcon(door, iconToUse, iconColor)}
      </>
    );
  };
  
  const renderFurniture = (furniture: FurnitureElement) => {
    // Determine which icon to use based on furniture type
    let iconToUse = FontAwesomeIconPaths['fas fa-couch']; // Default furniture icon
    let iconColor = furniture.stroke || FontAwesomeIconColors['fas fa-couch'];
    
    // Get the furniture type
    const furnitureType = furniture.furnitureType || 'sofa';
    
    // Check if we have a Font Awesome mapping for this furniture type
    if (furnitureType in ToolToFontAwesome) {
      const fontAwesomeIcon = ToolToFontAwesome[furnitureType];
      if (fontAwesomeIcon in FontAwesomeIconPaths) {
        iconToUse = FontAwesomeIconPaths[fontAwesomeIcon];
        iconColor = FontAwesomeIconColors[fontAwesomeIcon] || (furniture.stroke || FontAwesomeIconColors['fas fa-couch']);
      }
    } else {
      // Handle specific cases with Font Awesome icons
      switch (furnitureType) {
        case 'restroom':
          iconToUse = FontAwesomeIconPaths['fas fa-restroom'];
          iconColor = FontAwesomeIconColors['fas fa-restroom'];
          break;
        case 'meeting':
          iconToUse = FontAwesomeIconPaths['fas fa-users'];
          iconColor = FontAwesomeIconColors['fas fa-users'];
          break;
        case 'medical':
        case 'first-aid':
          iconToUse = FontAwesomeIconPaths['fas fa-stethoscope'];
          iconColor = FontAwesomeIconColors['fas fa-stethoscope'];
          break;
        case 'childcare':
        case 'nursing-room':
        case 'family-services':
          iconToUse = FontAwesomeIconPaths['fas fa-baby'];
          iconColor = FontAwesomeIconColors['fas fa-baby'];
          break;
        case 'accessible':
        case 'wheelchair-accessible':
        case 'senior-assistance':
          iconToUse = FontAwesomeIconPaths['fas fa-wheelchair'];
          iconColor = FontAwesomeIconColors['fas fa-wheelchair'];
          break;
        case 'info':
        case 'information':
        case 'info-point':
          iconToUse = FontAwesomeIconPaths['fas fa-info-circle'];
          iconColor = FontAwesomeIconColors['fas fa-info-circle'];
          break;
        case 'lost-found':
          iconToUse = FontAwesomeIconPaths['fas fa-search'];
          iconColor = FontAwesomeIconColors['fas fa-search'];
          break;
        case 'sofa':
        default:
          iconToUse = FontAwesomeIconPaths['fas fa-couch'];
          iconColor = FontAwesomeIconColors['fas fa-couch'];
      }
    }
    
    return (
      <>
        {/* Subtle background with furniture-appropriate styling */}
        <Rect
          x={0}
          y={0}
          width={furniture.width}
          height={furniture.height}
          fill='rgba(245, 245, 245, 0.8)' // Light gray background
          stroke={iconColor}
          strokeWidth={1}
          cornerRadius={4}
        />
        
        {/* Furniture icon with proper scaling */}
        {renderIcon(furniture, iconToUse, iconColor)}
      </>
    );
  };
  
  const renderPlant = (plant: PlantElement) => {
    return (
      <>
        {/* Plant pot/background with natural styling */}
        <Circle
          x={plant.width / 2}
          y={plant.height / 2}
          radius={Math.min(plant.width, plant.height) / 2.2}
          fill='rgba(76, 175, 80, 0.1)' // Light green background
          stroke={FontAwesomeIconColors['fas fa-seedling']}
          strokeWidth={1}
        />
        
        {/* Plant icon with proper scaling */}
        {renderIcon(plant, FontAwesomeIconPaths['fas fa-seedling'], FontAwesomeIconColors['fas fa-seedling'])}
      </>
    );
  };
  
  // Handle delete button click
  const handleDelete = (e: any) => {
    e.cancelBubble = true; // Stop event propagation
    deleteElements([element.id]);
  };

  // Render delete button for selected elements
  const renderDeleteButton = () => {
    if (!isSelected) return null;
    
    return (
      <Group
        x={element.width}
        y={0}
        onClick={handleDelete}
        onTap={handleDelete}
        ref={deleteButtonRef}
      >
        {/* Red circle background */}
        <Circle
          radius={10}
          fill="red"
          stroke="white"
          strokeWidth={1}
        />
        {/* X symbol */}
        <Text
          text="×"
          fontSize={16}
          fontFamily="Arial"
          fill="white"
          align="center"
          verticalAlign="middle"
          x={-5}
          y={-8}
        />
      </Group>
    );
  };

  return (
    <Group
      ref={shapeRef}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      draggable={viewerMode === 'editor'} // Only enable dragging in editor mode
      onClick={handleClick}
      onTap={handleClick}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
      opacity={isDragging ? 0.8 : 1} // Visual feedback during drag
      shadowColor={isDragging ? "blue" : (isSelected ? "rgba(0, 123, 255, 0.3)" : undefined)}
      shadowBlur={isDragging ? 15 : (isSelected ? 8 : 0)}
      shadowOpacity={isDragging ? 0.6 : (isSelected ? 0.4 : 0)}
      shadowOffset={isDragging ? { x: 5, y: 5 } : (isSelected ? { x: 2, y: 2 } : { x: 0, y: 0 })}
      // Add a subtle border when selected
      scaleX={isSelected && !isDragging ? 1.02 : 1}
      scaleY={isSelected && !isDragging ? 1.02 : 1}
      // Add cursor pointer for better UX
      listening={true}
      // Change cursor based on mode and element type
      style={{
        cursor: viewerMode !== 'editor' 
          ? (element.type === 'booth' ? 'pointer' : 'default')
          : 'move'
      }}
    >
      {renderElement()}
      {/* Only show delete button in editor mode */}
      {viewerMode === 'editor' && renderDeleteButton()}
      
      {/* Only show transformer in editor mode */}
      {isSelected && viewerMode === 'editor' && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Ensure minimum size
            if (newBox.width < 10 || newBox.height < 10) {
              return oldBox;
            }
            return newBox;
          }}
          rotateEnabled={true}
          enabledAnchors={[
            'top-left', 'top-center', 'top-right', 
            'middle-right', 'middle-left',
            'bottom-left', 'bottom-center', 'bottom-right'
          ]}
          anchorSize={8}
          anchorCornerRadius={2}
          padding={1}
        />
      )}
    </Group>
  );
};
import React, { useEffect, useRef, useState } from 'react';
import { Group, Layer, Rect, Stage } from 'react-konva';
import { usePathFinding } from '../../hooks/usePathFinding';
import { useCanvasStore } from '../../store/canvasStore';
import { BackgroundImage } from '../canvas/BackgroundImage';
import { CanvasGrid } from '../canvas/CanvasGrid';
import { ElementRenderer } from '../canvas/ElementRenderer';
import { PathControls } from '../canvas/PathControls';
import { PathRenderer } from '../canvas/PathRenderer';
import MapView2D from './MapView2D';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';

interface ViewMode2DProps {
  onBoothClick: (boothId: string) => void;
  selectedBoothId?: string;
}

export const ViewMode2D: React.FC<ViewMode2DProps> = ({ onBoothClick, selectedBoothId }) => {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    elements,
    grid,
    zoom,
    offset,
    canvasSize,
    backgroundImage,
    setZoom,
    setOffset
  } = useCanvasStore();

  // Use the path finding hook
  const {
    startBoothId,
    endBoothId,
    pathMode,
    pathPoints,
    togglePathMode,
    clearPath,
    handleBoothSelect,
    selectStartBooth,
    selectEndBooth
  } = usePathFinding(grid.size);

  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  // Handle resize and auto-fit content initially
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  // Auto-center and fit elements once on mount
  useEffect(() => {
    if (!elements || elements.length === 0 || stageSize.width === 0 || stageSize.height === 0) return;

    // Compute bounding box of elements
    const minX = Math.min(...elements.map(e => e.x));
    const minY = Math.min(...elements.map(e => e.y));
    const maxX = Math.max(...elements.map(e => e.x + e.width));
    const maxY = Math.max(...elements.map(e => e.y + e.height));

    const contentWidth = Math.max(maxX - minX, 1);
    const contentHeight = Math.max(maxY - minY, 1);

    // Add padding
    const padding = 40;
    const fitScaleX = (stageSize.width - padding * 2) / contentWidth;
    const fitScaleY = (stageSize.height - padding * 2) / contentHeight;
    const newZoom = Math.max(0.1, Math.min(2, Math.min(fitScaleX, fitScaleY)));

    // Center the content
    const newOffsetX = padding + (stageSize.width - padding * 2 - contentWidth * newZoom) / 2 - minX * newZoom;
    const newOffsetY = padding + (stageSize.height - padding * 2 - contentHeight * newZoom) / 2 - minY * newZoom;

    setZoom(newZoom);
    setOffset(newOffsetX, newOffsetY);
  }, [elements, stageSize.width, stageSize.height, setZoom, setOffset]);
  // Handle booth clicks in viewer mode
  useEffect(() => {
    const handleBoothViewerClick = (e: CustomEvent) => {
      onBoothClick(e.detail);
    };
    
    window.addEventListener('booth-viewer-click', handleBoothViewerClick as EventListener);
    return () => {
      window.removeEventListener('booth-viewer-click', handleBoothViewerClick as EventListener);
    };
  }, [onBoothClick]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if the event target is an input, textarea, or contentEditable element
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable
      ) {
        return;
      }
      
      // Toggle path mode with 'P' key
      if (e.key === 'p' || e.key === 'P') {
        togglePathMode();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePathMode]);

  // Handle wheel for zooming
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    const pointerPos = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointerPos.x - offset.x) / zoom,
      y: (pointerPos.y - offset.y) / zoom
    };
    
    // Calculate new zoom
    const scaleBy = 1.1;
    const newZoom = e.evt.deltaY < 0 ? zoom * scaleBy : zoom / scaleBy;
    const limitedZoom = Math.max(0.1, Math.min(5, newZoom));
    
    // Calculate new offset to zoom into mouse position
    const newOffset = {
      x: pointerPos.x - mousePointTo.x * limitedZoom,
      y: pointerPos.y - mousePointTo.y * limitedZoom
    };
    
    setZoom(limitedZoom);
    setOffset(newOffset.x, newOffset.y);
  };

  // Handle element click
  const handleElementClick = (e: any) => {
    const id = e.target.id();
    const clickedElement = elements.find(element => element.id === id);
    
    if (clickedElement && clickedElement.type === 'booth') {
      // Add ExpofP-style visual feedback
      const boothElement = e.target;
      if (boothElement) {
        // Add pulse animation class
        boothElement.to({
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 0.1,
          yoyo: true,
          repeat: 1
        });
      }
      
      if (pathMode) {
        // In path mode, handle booth selection for pathfinding
        handleBoothSelect(id);
      } else {
        // Normal booth click behavior
        onBoothClick(id);
      }
    }
  };

  const handleZoomControl = (delta: number) => {
    const newZoom = Math.max(0.1, Math.min(5, zoom + delta));
    setZoom(newZoom);
  };

  const resetView = () => {
    setZoom(1);
    setOffset(0, 0);
  };

  // Handle drag for panning
  const handleDragStart = () => {
    // Just to enable dragging
  };

  const handleDragMove = (e: any) => {
    setOffset(e.target.x(), e.target.y());
  };

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden canvas-area" style={{ position: 'relative' }}>

      {stageSize.width > 0 && (
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          onWheel={handleWheel}
          onClick={handleElementClick}
          draggable
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          style={{ background: 'transparent' }}
        >
          {/* Background Layer with white canvas area */}
          <Layer>
            {/* White background covering only canvas area */}
            <Rect
              x={0}
              y={0}
              width={canvasSize.width}
              height={canvasSize.height}
              fill="#ffffff"
              stroke="#e2e8f0"
              strokeWidth={1}
            />

            {/* Background image (if any), drawn on top of white background */}
            {backgroundImage && (
              <BackgroundImage
                settings={backgroundImage}
              />
            )}
            
            {/* Grid */}
            {grid.enabled && (
              <CanvasGrid
                enabled={grid.enabled}
                size={grid.size}
                width={canvasSize.width}
                height={canvasSize.height}
                opacity={0.3}
              />
            )}
          </Layer>
            
          {/* Main Elements Layer */}
          <Layer>
            {/* Elements */}
            <Group
              x={offset.x}
              y={offset.y}
              scaleX={zoom}
              scaleY={zoom}
            >
              {elements
                .sort((a, b) => a.layer - b.layer)
                .map(element => {
                  // Debug logging for image elements
                  if (element.type === 'image') {
                    console.log('Rendering image element:', element);
                  }
                  return (
                    <ElementRenderer
                      key={element.id}
                      element={element}
                      isSelected={element.id === selectedBoothId}
                      snapToGrid={false}
                      gridSize={grid.size}
                    />
                  );
                })}
                
              {/* Path Renderer */}
              {pathMode && pathPoints.length > 0 && (
                <PathRenderer pathPoints={pathPoints} />
              )}
            </Group>
          </Layer>
        </Stage>
      )}
      
      {/* Zoom Controls */}
      <div className="absolute top-4 left-4 z-10">
        <div className="zoom-controls">
          <button onClick={() => handleZoomControl(0.1)} className="zoom-btn">
            <FontAwesomeIcon icon="fas fa-plus" />
          </button>
          <button onClick={() => handleZoomControl(-0.1)} className="zoom-btn">
            <FontAwesomeIcon icon="fas fa-minus" />
          </button>
          <button onClick={resetView} className="reset-btn">
            <FontAwesomeIcon icon="fas fa-expand-arrows-alt" />
          </button>
        </div>
      </div>
      
      {/* Path Controls */}
      {stageSize.width > 0 && (
        <div className="absolute bottom-6 right-6 z-10">
          <PathControls
            pathMode={pathMode}
            startBoothId={startBoothId}
            endBoothId={endBoothId}
            togglePathMode={togglePathMode}
            clearPath={clearPath}
            selectStartBooth={selectStartBooth}
            selectEndBooth={selectEndBooth}
          />
        </div>
      )}
    </div>
  );
};
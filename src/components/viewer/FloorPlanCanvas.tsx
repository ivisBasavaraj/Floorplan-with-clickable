import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';
import { useFloorPlanViewerStore } from '../../store/floorPlanViewerStore';
import { ViewMode2D } from '../preview/ViewMode2D';
import { ViewMode3D } from '../preview/ViewMode3D';

interface FloorPlanCanvasProps {
  floorPlanId: string;
  viewMode: '2d' | '3d';
}

export const FloorPlanCanvas: React.FC<FloorPlanCanvasProps> = ({
  floorPlanId,
  viewMode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const {
    getCurrentFloorCompanies,
    setSelectedBooth,
    setHoveredBooth,
    selectedBoothId,
    hoveredBoothId
  } = useFloorPlanViewerStore();

  // Handle container resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  }, []);

  const handleFitToScreen = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.05;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const clampedScale = Math.max(0.1, Math.min(3, newScale));

    setZoom(clampedScale);
    setPosition({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  }, []);

  // Expose zoom controls to parent
  useEffect(() => {
    const store = useFloorPlanViewerStore.getState();
    (store as any).zoomControls = {
      zoomIn: handleZoomIn,
      zoomOut: handleZoomOut,
      fitToScreen: handleFitToScreen,
      currentZoom: zoom,
      minZoom: 0.1,
      maxZoom: 3
    };
  }, [handleZoomIn, handleZoomOut, handleFitToScreen, zoom]);

  if (viewMode === '3d') {
    return (
      <div ref={containerRef} className="w-full h-full">
        <ViewMode3D 
          width={dimensions.width}
          height={dimensions.height}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full bg-gray-100">
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={zoom}
        scaleY={zoom}
        x={position.x}
        y={position.y}
        onWheel={handleWheel}
        draggable
        onDragEnd={(e) => {
          setPosition({
            x: e.target.x(),
            y: e.target.y()
          });
        }}
      >
        <Layer>
          {/* Background Grid */}
          <GridBackground 
            width={dimensions.width / zoom}
            height={dimensions.height / zoom}
          />
          
          {/* Floor Plan Elements */}
          <FloorPlanElements />
        </Layer>
      </Stage>
    </div>
  );
};

// Grid Background Component
const GridBackground: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const gridSize = 50;
  const lines = [];

  // Vertical lines
  for (let i = 0; i <= width; i += gridSize) {
    lines.push(
      <Rect
        key={`v-${i}`}
        x={i}
        y={0}
        width={1}
        height={height}
        fill="#e5e7eb"
        opacity={0.5}
      />
    );
  }

  // Horizontal lines
  for (let i = 0; i <= height; i += gridSize) {
    lines.push(
      <Rect
        key={`h-${i}`}
        x={0}
        y={i}
        width={width}
        height={1}
        fill="#e5e7eb"
        opacity={0.5}
      />
    );
  }

  return <>{lines}</>;
};

// Floor Plan Elements Component
const FloorPlanElements: React.FC = () => {
  const {
    getCurrentFloorCompanies,
    setSelectedBooth,
    setHoveredBooth,
    selectedBoothId,
    hoveredBoothId
  } = useFloorPlanViewerStore();

  const companies = getCurrentFloorCompanies();

  // Sample booth positions (in a real app, this would come from the floor plan data)
  const boothPositions = [
    { id: '1', x: 100, y: 100, width: 120, height: 80 },
    { id: '2', x: 250, y: 100, width: 120, height: 80 },
    { id: '3', x: 400, y: 100, width: 120, height: 80 },
    { id: '4', x: 100, y: 220, width: 120, height: 80 },
    { id: '5', x: 250, y: 220, width: 120, height: 80 },
  ];

  const getBoothColor = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (!company) return '#6b7280'; // Gray for unassigned
    if (company.featured) return '#7c3aed'; // Purple for featured
    return '#059669'; // Green for regular
  };

  const getBoothStroke = (companyId: string) => {
    if (selectedBoothId === companyId) return '#2563eb';
    if (hoveredBoothId === companyId) return '#3b82f6';
    return '#374151';
  };

  return (
    <>
      {boothPositions.map((booth) => {
        const company = companies.find(c => c.id === booth.id);
        return (
          <Group key={booth.id}>
            {/* Booth Rectangle */}
            <Rect
              x={booth.x}
              y={booth.y}
              width={booth.width}
              height={booth.height}
              fill={getBoothColor(booth.id)}
              stroke={getBoothStroke(booth.id)}
              strokeWidth={selectedBoothId === booth.id ? 3 : 2}
              cornerRadius={4}
              opacity={hoveredBoothId === booth.id ? 0.8 : 0.7}
              onClick={() => setSelectedBooth(booth.id)}
              onMouseEnter={() => setHoveredBooth(booth.id)}
              onMouseLeave={() => setHoveredBooth(undefined)}
              onTap={() => setSelectedBooth(booth.id)}
            />
            
            {/* Booth Number */}
            <Text
              x={booth.x + 5}
              y={booth.y + 5}
              text={company?.boothNumber || `Booth ${booth.id}`}
              fontSize={12}
              fontFamily="Arial"
              fill="white"
              fontStyle="bold"
            />
            
            {/* Company Name */}
            {company && (
              <Text
                x={booth.x + 5}
                y={booth.y + 25}
                text={company.name}
                fontSize={10}
                fontFamily="Arial"
                fill="white"
                width={booth.width - 10}
                ellipsis={true}
              />
            )}
            
            {/* Featured Badge */}
            {company?.featured && (
              <Rect
                x={booth.x + booth.width - 25}
                y={booth.y + 5}
                width={20}
                height={15}
                fill="#fbbf24"
                cornerRadius={2}
              />
            )}
          </Group>
        );
      })}
      
      {/* Walkways */}
      <Rect
        x={50}
        y={50}
        width={500}
        height={30}
        fill="#f3f4f6"
        stroke="#d1d5db"
        strokeWidth={1}
      />
      
      <Rect
        x={50}
        y={320}
        width={500}
        height={30}
        fill="#f3f4f6"
        stroke="#d1d5db"
        strokeWidth={1}
      />
    </>
  );
};
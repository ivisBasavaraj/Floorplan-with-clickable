import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Layer, Rect, Stage } from 'react-konva';
import { usePathFinding } from '../../hooks/usePathFinding';
import { useCanvasStore } from '../../store/canvasStore';
import type { BoothElement, DoorElement, FurnitureElement, PlantElement, ShapeElement } from '../../types/canvas';
import { IconColors } from '../icons/IconPaths';
import { BackgroundImage } from './BackgroundImage';
import { BoothDetailsModal } from './BoothDetailsModal';
import { CanvasControls } from './CanvasControls';
import { CanvasGrid } from './CanvasGrid';
import { ElementRenderer } from './ElementRenderer';
import { FlooringLayer } from './FlooringLayer';
import { PathRenderer } from './PathRenderer';
import { PreviewShape } from './PreviewShape';
import { SelectionRect } from './SelectionRect';

interface DetectionData {
  rects: Array<{id: number, x: number, y: number, w: number, h: number, score: number}>;
  walls: Array<{id: number, x1: number, y1: number, x2: number, y2: number, length: number, angle: number}>;
  imageWidth: number;
  imageHeight: number;
  overlay: string | null;
}

interface HierarchyData {
  rects: Array<{id: number, x: number, y: number, w: number, h: number, score: number, parent_id: number | null}>;
  groups: Record<string, number[]>;
  imageWidth: number;
  imageHeight: number;
  overlay: string | null;
}

interface SubsectionData {
  walls: Array<{id: string, coordinates: number[][]}>;
  booths: Array<{
    id: string;
    polygon: number[][];
    sub_booths: Array<{id: string, polygon: number[][]}>;
  }>;
  imageWidth: number;
  imageHeight: number;
}

interface BoothSubsection {
  id: string;
  parentId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const Canvas: React.FC = () => {
  console.log("Canvas component rendering");
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number, y: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 800 });

  const {
    elements,
    selectedIds,
    grid,
    zoom,
    offset,
    canvasSize,
    activeTool,
    backgroundImage,
    flooring,
    addElement,
    selectElements,
    deselectAll,
    setZoom,
    setOffset,
    setActiveTool,
    deleteElements
  } = useCanvasStore();
  
  const [boothSubsections, setBoothSubsections] = useState<Record<string, BoothSubsection[]>>({});
  const [boothData, setBoothData] = useState<Record<string, any>>({});
  const [selectedBoothDetails, setSelectedBoothDetails] = useState<any>(null);

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

  const [selectionStart, setSelectionStart] = useState<{ x: number, y: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ x: number, y: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  
  // Handle keyboard events for delete and path mode toggle
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip if the event target is an input, textarea, or contentEditable element
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.isContentEditable
    ) {
      return;
    }
    
    // Delete or Backspace key
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
      deleteElements(selectedIds);
    }
    
    // Toggle path mode with 'P' key
    if (e.key === 'p' || e.key === 'P') {
      togglePathMode();
    }
  }, [selectedIds, deleteElements, togglePathMode]);
  
  // Add and remove keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Log when Canvas mounts and when elements change
  useEffect(() => {
    console.log("Canvas mounted or elements changed:", elements);
  }, [elements]);

  // Handle container resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };

    // Initial size
    updateSize();

    // Create ResizeObserver to watch for container size changes
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Fallback for window resize
    window.addEventListener('resize', updateSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Listen for detection results
  useEffect(() => {
    const handleDetections = (e: CustomEvent<DetectionData>) => {
      const { rects, walls, imageWidth, imageHeight } = e.detail || {};

      // Map detection coordinates (image space) to canvas space where background is drawn
      const bg = useCanvasStore.getState().backgroundImage;
      const cs = useCanvasStore.getState().canvasSize;
      const imgW = Math.max(imageWidth || 1, 1);
      const imgH = Math.max(imageHeight || 1, 1);
      let scaleX = 1, scaleY = 1, offsetX = 0, offsetY = 0;

      if (bg) {
        const imgRatio = imgW / imgH;
        switch (bg.fitMode) {
          case 'stretch':
            scaleX = cs.width / imgW;
            scaleY = cs.height / imgH;
            offsetX = bg.position.x;
            offsetY = bg.position.y;
            break;
          case 'fit': {
            const canvasRatio = cs.width / cs.height;
            if (canvasRatio > imgRatio) {
              // Fit by height
              const dispH = cs.height;
              const dispW = cs.height * imgRatio;
              scaleX = dispW / imgW;
              scaleY = dispH / imgH;
              offsetX = bg.position.x; // top-left anchored
              offsetY = bg.position.y;
            } else {
              // Fit by width
              const dispW = cs.width;
              const dispH = cs.width / imgRatio;
              scaleX = dispW / imgW;
              scaleY = dispH / imgH;
              offsetX = bg.position.x;
              offsetY = bg.position.y;
            }
            break;
          }
          case 'center':
            scaleX = bg.scale;
            scaleY = bg.scale;
            offsetX = bg.position.x;
            offsetY = bg.position.y;
            break;
          case 'tile':
            scaleX = bg.scale;
            scaleY = bg.scale;
            offsetX = bg.position.x;
            offsetY = bg.position.y;
            break;
          default:
            offsetX = bg.position.x;
            offsetY = bg.position.y;
            break;
        }
      }
      
      if (rects && rects.length > 0) {
        console.log('Adding detected booths (mapped):', rects.length);
        rects.forEach(rect => {
          const mappedX = offsetX + rect.x * scaleX;
          const mappedY = offsetY + rect.y * scaleY;
          const mappedW = rect.w * scaleX;
          const mappedH = rect.h * scaleY;

          const boothElement: Omit<BoothElement, 'id' | 'selected'> = {
            type: 'booth',
            x: mappedX,
            y: mappedY,
            width: mappedW,
            height: mappedH,
            rotation: 0,
            draggable: true,
            fill: '#E8F5E8',
            stroke: '#4CAF50',
            strokeWidth: 2,
            layer: 1,
            number: `B-${rect.id}`,
            status: 'available',
            dimensions: {
              imperial: `${Math.round(mappedW / 12)}'x${Math.round(mappedH / 12)}'`,
              metric: `${Math.round(mappedW * 0.0254)}m x ${Math.round(mappedH * 0.0254)}m`
            },
            customProperties: { detectedScore: rect.score }
          };
          addElement(boothElement);
        });
      }
      
      if (walls && walls.length > 0) {
        console.log('Adding detected walls (mapped):', walls.length);
        walls.forEach(wall => {
          const x1 = offsetX + wall.x1 * scaleX;
          const y1 = offsetY + wall.y1 * scaleY;
          const x2 = offsetX + wall.x2 * scaleX;
          const y2 = offsetY + wall.y2 * scaleY;
          const minX = Math.min(x1, x2);
          const minY = Math.min(y1, y2);

          const wallElement: Omit<ShapeElement, 'id' | 'selected'> = {
            type: 'shape',
            shapeType: 'line',
            x: minX,
            y: minY,
            width: Math.abs(x2 - x1),
            height: Math.abs(y2 - y1),
            rotation: 0,
            draggable: true,
            fill: 'transparent',
            stroke: '#F44336',
            strokeWidth: 3,
            layer: 1,
            points: [x1 - minX, y1 - minY, x2 - minX, y2 - minY],
            customProperties: { detectedLength: wall.length, detectedAngle: wall.angle }
          };
          addElement(wallElement);
        });
      }
    };

    const handleManualDetection = async (e: CustomEvent<{ filename: string }>) => {
      try {
        const response = await fetch('http://localhost:5000/detect-from-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: e.detail.filename })
        });
        const data = await response.json();
        handleDetections(new CustomEvent('simulator:detections', { detail: data }));
      } catch (error) {
        console.error('Manual detection failed:', error);
      }
    };

    const handleHierarchyDetection = async (e: CustomEvent<{ filename: string }>) => {
      try {
        const response = await fetch('http://localhost:5000/detect-hierarchy-from-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: e.detail.filename })
        });
        const data: HierarchyData = await response.json();
        
        if (data.rects && data.rects.length > 0) {
          console.log('Adding hierarchical booths:', data.rects, 'Groups:', data.groups);
          
          data.rects.forEach(rect => {
            const isParent = Object.keys(data.groups).includes(rect.id.toString());
            const isChild = rect.parent_id !== null;
            
            const boothElement: Omit<BoothElement, 'id' | 'selected'> = {
              type: 'booth',
              x: rect.x,
              y: rect.y,
              width: rect.w,
              height: rect.h,
              rotation: 0,
              draggable: true,
              fill: rect.id === 'A' || rect.id === 'B' || rect.id === 'C' || rect.id === 'D' ? '#FFE0B2' : (isParent ? '#E8F5E8' : isChild ? '#E3F2FD' : '#F3E5F5'),
              stroke: rect.id === 'A' || rect.id === 'B' || rect.id === 'C' || rect.id === 'D' ? '#FF9800' : (isParent ? '#4CAF50' : isChild ? '#2196F3' : '#9C27B0'),
              strokeWidth: isParent ? 3 : 2,
              layer: 1,
              number: rect.id === 'A' || rect.id === 'B' || rect.id === 'C' || rect.id === 'D' ? rect.id : `B-${rect.id}`,
              status: 'available',
              dimensions: {
                imperial: `${Math.round(rect.w / 12)}'x${Math.round(rect.h / 12)}'`,
                metric: `${Math.round(rect.w * 0.0254)}m x ${Math.round(rect.h * 0.0254)}m`
              },
              customProperties: { 
                detectedScore: rect.score,
                parentId: rect.parent_id,
                isParent,
                isChild,
                isSubSection: rect.id === 'A' || rect.id === 'B' || rect.id === 'C' || rect.id === 'D'
              }
            };
            addElement(boothElement);
          });
        }
      } catch (error) {
        console.error('Hierarchy detection failed:', error);
      }
    };

    const handleSubsectionDetection = async (e: CustomEvent<{ filename: string }>) => {
      try {
        const response = await fetch('http://localhost:5000/detect-subsections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: e.detail.filename })
        });
        const data: SubsectionData = await response.json();
        
        console.log('Subsection detection result:', data);
        
        // Add walls
        if (data.walls) {
          data.walls.forEach(wall => {
            const coords = wall.coordinates;
            if (coords.length >= 2) {
              const wallElement: Omit<ShapeElement, 'id' | 'selected'> = {
                type: 'shape',
                shapeType: 'line',
                x: Math.min(coords[0][0], coords[1][0]),
                y: Math.min(coords[0][1], coords[1][1]),
                width: Math.abs(coords[1][0] - coords[0][0]),
                height: Math.abs(coords[1][1] - coords[0][1]),
                rotation: 0,
                draggable: true,
                fill: 'transparent',
                stroke: '#F44336',
                strokeWidth: 3,
                layer: 1,
                points: [0, 0, coords[1][0] - coords[0][0], coords[1][1] - coords[0][1]],
                customProperties: { detectedWall: true }
              };
              addElement(wallElement);
            }
          });
        }
        
        // Add booths and sub-booths
        if (data.booths) {
          data.booths.forEach(booth => {
            // Add main booth
            if (booth.polygon.length >= 3) {
              const bounds = booth.polygon.reduce((acc, point) => ({
                minX: Math.min(acc.minX, point[0]),
                minY: Math.min(acc.minY, point[1]),
                maxX: Math.max(acc.maxX, point[0]),
                maxY: Math.max(acc.maxY, point[1])
              }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
              
              const boothElement: Omit<BoothElement, 'id' | 'selected'> = {
                type: 'booth',
                x: bounds.minX,
                y: bounds.minY,
                width: bounds.maxX - bounds.minX,
                height: bounds.maxY - bounds.minY,
                rotation: 0,
                draggable: true,
                fill: booth.sub_booths.length > 0 ? '#FFF3E0' : '#E8F5E8',
                stroke: booth.sub_booths.length > 0 ? '#FF9800' : '#4CAF50',
                strokeWidth: 2,
                layer: 1,
                number: booth.id,
                status: 'available',
                dimensions: {
                  imperial: `${Math.round((bounds.maxX - bounds.minX) / 12)}'x${Math.round((bounds.maxY - bounds.minY) / 12)}'`,
                  metric: `${Math.round((bounds.maxX - bounds.minX) * 0.0254)}m x ${Math.round((bounds.maxY - bounds.minY) * 0.0254)}m`
                },
                customProperties: { 
                  hasSubBooths: booth.sub_booths.length > 0,
                  polygon: booth.polygon
                }
              };
              addElement(boothElement);
            }
            
            // Add sub-booths
            booth.sub_booths.forEach(subBooth => {
              if (subBooth.polygon.length >= 3) {
                const bounds = subBooth.polygon.reduce((acc, point) => ({
                  minX: Math.min(acc.minX, point[0]),
                  minY: Math.min(acc.minY, point[1]),
                  maxX: Math.max(acc.maxX, point[0]),
                  maxY: Math.max(acc.maxY, point[1])
                }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
                
                const subBoothElement: Omit<BoothElement, 'id' | 'selected'> = {
                  type: 'booth',
                  x: bounds.minX,
                  y: bounds.minY,
                  width: bounds.maxX - bounds.minX,
                  height: bounds.maxY - bounds.minY,
                  rotation: 0,
                  draggable: true,
                  fill: '#E3F2FD',
                  stroke: '#2196F3',
                  strokeWidth: 2,
                  layer: 2,
                  number: subBooth.id,
                  status: 'available',
                  dimensions: {
                    imperial: `${Math.round((bounds.maxX - bounds.minX) / 12)}'x${Math.round((bounds.maxY - bounds.minY) / 12)}'`,
                    metric: `${Math.round((bounds.maxX - bounds.minX) * 0.0254)}m x ${Math.round((bounds.maxY - bounds.minY) * 0.0254)}m`
                  },
                  customProperties: { 
                    isSubBooth: true,
                    parentBooth: booth.id,
                    polygon: subBooth.polygon
                  }
                };
                addElement(subBoothElement);
              }
            });
          });
        }
      } catch (error) {
        console.error('Subsection detection failed:', error);
      }
    };

    const handleBoothClick = async (boothElement: any) => {
      // Check for booth details first
      const boothNumber = boothElement.number || boothElement.id;
      const storedBoothData = localStorage.getItem('boothData');
      
      if (storedBoothData) {
        try {
          const parsedData = JSON.parse(storedBoothData);
          if (parsedData[boothNumber]) {
            setSelectedBoothDetails(parsedData[boothNumber]);
            return;
          }
        } catch (error) {
          console.error('Error parsing stored booth data:', error);
        }
      }
      
      // If no booth details found, try subsection detection
      const backgroundImage = useCanvasStore.getState().backgroundImage;
      if (!backgroundImage?.url || !backgroundImage.url.startsWith('http://localhost:5000/uploads/')) {
        return;
      }
      
      const filename = backgroundImage.url.split('/').pop();
      if (!filename) return;
      
      try {
        const response = await fetch('http://localhost:5000/detect-booth-subsections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename,
            boothBounds: {
              x: boothElement.x,
              y: boothElement.y,
              width: boothElement.width,
              height: boothElement.height
            },
            parentBoothId: boothElement.number || boothElement.id
          })
        });
        
        const data = await response.json();
        
        if (data.subsections && data.subsections.length > 0) {
          console.log('Creating subsections for booth:', boothElement.number, data.subsections);
          
          // Add subsections as booth elements
          data.subsections.forEach((subsection: BoothSubsection) => {
            const subsectionElement: Omit<BoothElement, 'id' | 'selected'> = {
              type: 'booth',
              x: subsection.x,
              y: subsection.y,
              width: subsection.width,
              height: subsection.height,
              rotation: 0,
              draggable: true,
              fill: '#F0F8FF',
              stroke: '#87CEEB',
              strokeWidth: 1,
              layer: 2,
              number: subsection.id,
              status: 'available',
              dimensions: {
                imperial: `${Math.round(subsection.width / 12)}'x${Math.round(subsection.height / 12)}'`,
                metric: `${Math.round(subsection.width * 0.0254)}m x ${Math.round(subsection.height * 0.0254)}m`
              },
              customProperties: {
                isSubsection: true,
                parentBoothId: subsection.parentId
              }
            };
            addElement(subsectionElement);
          });
          
          // Store subsections mapping
          setBoothSubsections(prev => ({
            ...prev,
            [boothElement.number || boothElement.id]: data.subsections
          }));
        }
      } catch (error) {
        console.error('Failed to detect booth subsections:', error);
      }
    };
    
    // Listen for booth data loaded event
    const handleBoothDataLoaded = (e: CustomEvent) => {
      setBoothData(e.detail);
    };

    window.addEventListener('simulator:detections', handleDetections as EventListener);
    window.addEventListener('manual-detection', handleManualDetection as EventListener);
    window.addEventListener('hierarchy-detection', handleHierarchyDetection as EventListener);
    window.addEventListener('subsection-detection', handleSubsectionDetection as EventListener);
    window.addEventListener('booth-click', ((e: CustomEvent) => handleBoothClick(e.detail)) as EventListener);
    window.addEventListener('booth-data-loaded', handleBoothDataLoaded as EventListener);
    
    return () => {
      window.removeEventListener('simulator:detections', handleDetections as EventListener);
      window.removeEventListener('manual-detection', handleManualDetection as EventListener);
      window.removeEventListener('hierarchy-detection', handleHierarchyDetection as EventListener);
      window.removeEventListener('subsection-detection', handleSubsectionDetection as EventListener);
      window.removeEventListener('booth-click', ((e: CustomEvent) => handleBoothClick(e.detail)) as EventListener);
      window.removeEventListener('booth-data-loaded', handleBoothDataLoaded as EventListener);
    };
  }, [addElement]);

  // Handle mouse down for selection, pan, or element creation
  const handleMouseDown = (e: any) => {
    if (e.evt.button === 2) {
      e.evt.preventDefault();
      return;
    }

    // If clicking on an element (not the stage background), don't interfere with element dragging
    if (e.target !== e.target.getStage()) {
      return; // Let the element handle its own dragging
    }

    const stage = stageRef.current;
    const pointerPos = stage.getPointerPosition();
    const canvasPos = {
      x: (pointerPos.x - offset.x) / zoom,
      y: (pointerPos.y - offset.y) / zoom
    };

    // Start panning with middle mouse or ctrl + left mouse
    if (e.evt.button === 1 || (e.evt.button === 0 && e.evt.ctrlKey)) {
      setIsPanning(true);
      return;
    }

    // Handle element creation tools (only when clicking on empty canvas)
    if (activeTool !== 'select' && e.evt.button === 0) {
      setIsDragging(true);
      setDragStartPos(canvasPos);
      return;
    }

    // Start selection rect if using select tool (only when clicking on empty canvas)
    if (activeTool === 'select' && e.evt.button === 0) {
      // Clear selection when clicking on empty canvas
      deselectAll();
      setSelectionStart(canvasPos);
      setSelectionEnd(canvasPos);
    }
  };

  // Handle mouse move for selection, pan, or element creation
  const handleMouseMove = (e: any) => {
    if (isPanning && stageRef.current) {
      const dx = e.evt.movementX;
      const dy = e.evt.movementY;
      setOffset(offset.x + dx, offset.y + dy);
      return;
    }

    // Don't interfere if an element is being dragged or if we're interacting with an element
    if (e.target && e.target !== e.target.getStage()) {
      // If it's an element or part of an element, don't handle the move
      return;
    }

    const stage = stageRef.current;
    const pointerPos = stage.getPointerPosition();
    const canvasPos = {
      x: (pointerPos.x - offset.x) / zoom,
      y: (pointerPos.y - offset.y) / zoom
    };

    // Update selection or preview shape (only during canvas operations)
    if (isDragging && dragStartPos) {
      setSelectionEnd(canvasPos);
    } else if (selectionStart) {
      setSelectionEnd(canvasPos);
    }
  };

  // Handle mouse up for selection, pan, or element creation
  const handleMouseUp = (e: any) => {
    try {
      if (isPanning) {
        setIsPanning(false);
        return;
      }
  
      // Create new element if dragging with a creation tool
      if (isDragging && dragStartPos && selectionEnd) {
        const width = Math.abs(selectionEnd.x - dragStartPos.x);
        const height = Math.abs(selectionEnd.y - dragStartPos.y);
        
        // Only create if there's a meaningful size
        if (width > 5 && height > 5) {
          const x = Math.min(dragStartPos.x, selectionEnd.x);
          const y = Math.min(dragStartPos.y, selectionEnd.y);

        // Create a function to handle all tool types
        const createElementForTool = () => {
          // Base properties for all elements
          const baseProps = {
            x,
            y,
            rotation: 0,
            draggable: true,
            customProperties: {}
          };

          // Handle different tool types
          switch (activeTool) {
            case 'booth':
              return {
                ...baseProps,
                type: 'booth',
                width,
                height,
                fill: '#FFFFFF',
                stroke: '#333333',
                strokeWidth: 1,
                layer: 1,
                number: `B-${Math.floor(Math.random() * 1000)}`,
                status: 'available',
                dimensions: {
                  imperial: `${Math.round(width / 12)}'x${Math.round(height / 12)}'`,
                  metric: `${Math.round(width * 0.0254)}m x ${Math.round(height * 0.0254)}m`
                }
              } as Omit<BoothElement, 'id' | 'selected'>;
              
            case 'line':
              return {
                ...baseProps,
                type: 'shape',
                shapeType: 'line',
                width,
                height,
                fill: 'transparent',
                stroke: '#333333',
                strokeWidth: 2,
                layer: 1,
                points: [0, 0, width, height]
              } as Omit<ShapeElement, 'id' | 'selected'>;
              
            case 'wall':
              return {
                ...baseProps,
                type: 'shape',
                shapeType: 'rectangle',
                width,
                height,
                fill: '#8B4513',
                stroke: '#654321',
                strokeWidth: 2,
                layer: 1
              } as Omit<ShapeElement, 'id' | 'selected'>;
              
            case 'door':
              return {
                ...baseProps,
                type: 'door',
                width: 30,
                height: 5,
                fill: '#A0522D',
                stroke: '#800000',
                strokeWidth: 1,
                layer: 2,
                direction: 'right'
              } as Omit<DoorElement, 'id' | 'selected'>;
              
            case 'furniture':
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: 'sofa',
                width: 60,
                height: 40,
                fill: '#C0C0C0',
                stroke: '#808080',
                strokeWidth: 1,
                layer: 2
              } as Omit<FurnitureElement, 'id' | 'selected'>;
              
            case 'meeting-room':
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: 'meeting',
                width: 80,
                height: 60,
                fill: '#E3F2FD',
                stroke: '#4285F4',
                strokeWidth: 1,
                layer: 2,
                customProperties: {
                  description: 'Meeting/Conference Area'
                }
              } as Omit<FurnitureElement, 'id' | 'selected'>;
              
            case 'restroom':
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: 'restroom',
                width: 50,
                height: 50,
                fill: '#E8EAF6',
                stroke: '#3F51B5',
                strokeWidth: 1,
                layer: 2,
                customProperties: {
                  description: 'Restroom Area'
                }
              } as Omit<FurnitureElement, 'id' | 'selected'>;
              
            case 'emergency-exit':
              return {
                ...baseProps,
                type: 'door',
                furnitureType: 'emergency',
                width: 40,
                height: 10,
                fill: '#FFEBEE',
                stroke: '#F44336',
                strokeWidth: 2,
                layer: 2,
                direction: 'out',
                customProperties: {
                  isEmergency: true,
                  description: 'Emergency Exit'
                }
              } as Omit<DoorElement, 'id' | 'selected'>;
              
            case 'plant':
              return {
                ...baseProps,
                type: 'plant',
                plantType: 'tree',
                width: 40,
                height: 40,
                fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
                stroke: IconColors.plant,
                strokeWidth: 1,
                layer: 0
              } as Omit<PlantElement, 'id' | 'selected'>;
              
            case 'restaurant':
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: 'restaurant',
                width: 60,
                height: 60,
                fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
                stroke: IconColors.restaurant,
                strokeWidth: 1,
                layer: 2,
                customProperties: {
                  description: 'Restaurant/Dining Area'
                }
              } as Omit<FurnitureElement, 'id' | 'selected'>;
              
            case 'information':
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: 'info',
                width: 40,
                height: 40,
                fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
                stroke: IconColors.info,
                strokeWidth: 1,
                layer: 2,
                customProperties: {
                  description: 'Information Desk'
                }
              } as Omit<FurnitureElement, 'id' | 'selected'>;
              
            case 'cafeteria':
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: 'cafeteria',
                width: 70,
                height: 50,
                fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
                stroke: IconColors.cafeteria,
                strokeWidth: 1,
                layer: 2,
                customProperties: {
                  description: 'Cafeteria/Food Service'
                }
              } as Omit<FurnitureElement, 'id' | 'selected'>;
              
            case 'atm':
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: 'atm',
                width: 30,
                height: 30,
                fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
                stroke: IconColors.atm,
                strokeWidth: 1,
                layer: 2,
                customProperties: {
                  description: 'ATM/Banking Services'
                }
              } as Omit<FurnitureElement, 'id' | 'selected'>;
              
            case 'elevator':
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: 'elevator',
                width: 40,
                height: 40,
                fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
                stroke: IconColors.elevator,
                strokeWidth: 1,
                layer: 2,
                customProperties: {
                  description: 'Elevator'
                }
              } as Omit<FurnitureElement, 'id' | 'selected'>;
              
            case 'medical':
            case 'first-aid':
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: 'medical',
                width: 50,
                height: 40,
                fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
                stroke: IconColors.medical,
                strokeWidth: 1,
                layer: 2,
                customProperties: {
                  description: 'Medical Services/First Aid'
                }
              } as Omit<FurnitureElement, 'id' | 'selected'>;
              
            case 'childcare':
            case 'nursing-room':
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: 'childcare',
                width: 50,
                height: 40,
                fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
                stroke: IconColors.childcare,
                strokeWidth: 1,
                layer: 2,
                customProperties: {
                  description: activeTool === 'childcare' ? 'Childcare Area' : 'Nursing Room'
                }
              } as Omit<FurnitureElement, 'id' | 'selected'>;
              
            case 'wheelchair-accessible':
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: 'accessible',
                width: 40,
                height: 40,
                fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
                stroke: IconColors.accessible,
                strokeWidth: 1,
                layer: 2,
                customProperties: {
                  description: 'Wheelchair Accessible'
                }
              } as Omit<FurnitureElement, 'id' | 'selected'>;
              
            case 'mens-restroom':
            case 'womens-restroom':
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: 'restroom', // Use the standard restroom icon for both
                width: 40,
                height: 40,
                fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
                stroke: IconColors.restroom,
                strokeWidth: 1,
                layer: 2,
                customProperties: {
                  description: activeTool === 'mens-restroom' ? "Men's Restroom" : "Women's Restroom"
                }
              } as Omit<FurnitureElement, 'id' | 'selected'>;
              
            // Add cases for all other tools from the ToolsPanel
            default:
              // For any other tool, create a generic furniture element
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: activeTool,
                width: 50,
                height: 40,
                fill: '#F5F5F5',
                stroke: '#9E9E9E',
                strokeWidth: 1,
                layer: 2,
                customProperties: {
                  description: activeTool.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                }
              } as Omit<FurnitureElement, 'id' | 'selected'>;
          }
        };
        
        // Add the element based on the active tool
        const elementToAdd = createElementForTool();
        if (elementToAdd) {
          addElement(elementToAdd);
        }
      }

      setIsDragging(false);
      setDragStartPos(null);
      setSelectionEnd(null);
      return;
    }

    // Handle selection rectangle
    if (selectionStart && selectionEnd && activeTool === 'select') {
      const left = Math.min(selectionStart.x, selectionEnd.x);
      const top = Math.min(selectionStart.y, selectionEnd.y);
      const right = Math.max(selectionStart.x, selectionEnd.x);
      const bottom = Math.max(selectionStart.y, selectionEnd.y);
      
      const hasSize = Math.abs(right - left) > 5 && Math.abs(bottom - top) > 5;
      
      if (hasSize) {
        const selectedElements = elements.filter(element => {
          const { x, y, width, height } = element;
          return (
            x < right &&
            x + width > left &&
            y < bottom &&
            y + height > top
          );
        });
        
        selectElements(selectedElements.map(el => el.id));
      }
    }
    
    setSelectionStart(null);
    setSelectionEnd(null);
    } catch (error) {
      console.error("Error in handleMouseUp:", error);
      // Reset state to prevent UI from getting stuck
      setIsDragging(false);
      setDragStartPos(null);
      setSelectionStart(null);
      setSelectionEnd(null);
      setIsPanning(false);
    }
  };

  // Handle wheel event for zooming
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    const oldScale = zoom;
    
    const newScale = e.evt.deltaY < 0 
      ? oldScale * 1.1 
      : oldScale / 1.1;
    
    const scale = Math.min(Math.max(newScale, 0.25), 4);
    
    const pointer = stage.getPointerPosition();
    
    const newOffset = {
      x: pointer.x - (pointer.x - offset.x) * (scale / oldScale),
      y: pointer.y - (pointer.y - offset.y) * (scale / oldScale)
    };
    
    setZoom(scale);
    setOffset(newOffset.x, newOffset.y);
  };
  
  // Handle context menu
  const handleContextMenu = (e: any) => {
    e.evt.preventDefault();
  };

  // Handle drag and drop from tools panel
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const toolId = e.dataTransfer.getData('text/plain');
    if (!toolId) return;
    
    // Get the drop position in canvas coordinates
    const stage = stageRef.current;
    if (!stage) return;
    
    const pointerPos = stage.getPointerPosition();
    const canvasPos = {
      x: (pointerPos.x - offset.x) / zoom,
      y: (pointerPos.y - offset.y) / zoom
    };
    
    // Set the active tool to the dropped tool
    setActiveTool(toolId);
    
    // Create a default size element at the drop position
    // Use different sizes based on the tool type for better icon display
    let width = 60;
    let height = 60;
    
    // Adjust sizes for specific tools
    if (toolId === 'door' || toolId === 'emergency-exit') {
      width = 60;
      height = 40;
    } else if (toolId === 'line' || toolId === 'wall') {
      width = 80;
      height = 10;
    } else if (toolId === 'meeting-room' || toolId === 'restaurant' || toolId === 'cafeteria') {
      width = 80;
      height = 80;
    }
    
    // Simulate drag start and end at the drop position
    setDragStartPos({
      x: canvasPos.x - width/2,
      y: canvasPos.y - height/2
    });
    
    // Create the element
    const createElementForTool = () => {
      // Base properties for all elements
      const baseProps = {
        x: canvasPos.x - width/2,
        y: canvasPos.y - height/2,
        width,
        height,
        rotation: 0,
        draggable: true, // Always enable dragging
        customProperties: {}
      };

      // Handle different tool types based on the dropped tool ID
      switch (toolId) {
        case 'booth':
          return {
            ...baseProps,
            type: 'booth',
            fill: '#FFFFFF',
            stroke: '#333333',
            strokeWidth: 1,
            layer: 1,
            number: `B-${Math.floor(Math.random() * 1000)}`,
            status: 'available',
            dimensions: {
              imperial: `${Math.round(width / 12)}'x${Math.round(height / 12)}'`,
              metric: `${Math.round(width * 0.0254)}m x ${Math.round(height * 0.0254)}m`
            }
          } as Omit<BoothElement, 'id' | 'selected'>;
          
        case 'line':
          return {
            ...baseProps,
            type: 'shape',
            shapeType: 'line',
            fill: 'transparent',
            stroke: '#333333',
            strokeWidth: 2,
            layer: 1,
            points: [0, 0, width, height]
          } as Omit<ShapeElement, 'id' | 'selected'>;
          
        case 'wall':
          return {
            ...baseProps,
            type: 'shape',
            shapeType: 'rectangle',
            fill: '#8B4513',
            stroke: '#654321',
            strokeWidth: 2,
            layer: 1
          } as Omit<ShapeElement, 'id' | 'selected'>;
          
        case 'door':
          return {
            ...baseProps,
            type: 'door',
            width: 30,
            height: 5,
            fill: '#A0522D',
            stroke: '#800000',
            strokeWidth: 1,
            layer: 2,
            direction: 'right'
          } as Omit<DoorElement, 'id' | 'selected'>;
          
        case 'furniture':
          return {
            ...baseProps,
            type: 'furniture',
            furnitureType: 'sofa',
            fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
            stroke: IconColors.furniture,
            strokeWidth: 1,
            layer: 2
          } as Omit<FurnitureElement, 'id' | 'selected'>;
          
        case 'meeting-room':
          return {
            ...baseProps,
            type: 'furniture',
            furnitureType: 'meeting',
            fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
            stroke: IconColors.meeting,
            strokeWidth: 1,
            layer: 2,
            customProperties: {
              description: 'Meeting/Conference Area'
            }
          } as Omit<FurnitureElement, 'id' | 'selected'>;
          
        case 'restroom':
          return {
            ...baseProps,
            type: 'furniture',
            furnitureType: 'restroom',
            fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
            stroke: IconColors.restroom,
            strokeWidth: 1,
            layer: 2,
            customProperties: {
              description: 'Restroom Area'
            }
          } as Omit<FurnitureElement, 'id' | 'selected'>;
          
        case 'emergency-exit':
          return {
            ...baseProps,
            type: 'door',
            furnitureType: 'emergency',
            width: 40,
            height: 30, // Taller to fit the icon better
            fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
            stroke: IconColors.emergency,
            strokeWidth: 1,
            layer: 2,
            direction: 'out',
            customProperties: {
              isEmergency: true,
              description: 'Emergency Exit'
            }
          } as Omit<DoorElement, 'id' | 'selected'>;
          
        case 'plant':
          return {
            ...baseProps,
            type: 'plant',
            plantType: 'tree',
            fill: '#228B22',
            stroke: '#006400',
            strokeWidth: 1,
            layer: 0
          } as Omit<PlantElement, 'id' | 'selected'>;
          
        // Medical services
        case 'medical':
        case 'first-aid':
          return {
            ...baseProps,
            type: 'furniture',
            furnitureType: 'medical',
            fill: '#FFEBEE',
            stroke: '#F44336',
            strokeWidth: 1,
            layer: 2,
            customProperties: {
              description: toolId === 'medical' ? 'Medical Services' : 'First Aid'
            }
          } as Omit<FurnitureElement, 'id' | 'selected'>;
          
        // Childcare related
        case 'childcare':
        case 'nursing-room':
        case 'family-services':
          return {
            ...baseProps,
            type: 'furniture',
            furnitureType: 'childcare',
            fill: '#F9FBE7',
            stroke: '#CDDC39',
            strokeWidth: 1,
            layer: 2,
            customProperties: {
              description: toolId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            }
          } as Omit<FurnitureElement, 'id' | 'selected'>;
          
        // Accessibility
        case 'wheelchair-accessible':
        case 'senior-assistance':
          return {
            ...baseProps,
            type: 'furniture',
            furnitureType: 'accessible',
            fill: '#E0F7FA',
            stroke: '#00BCD4',
            strokeWidth: 1,
            layer: 2,
            customProperties: {
              description: toolId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            }
          } as Omit<FurnitureElement, 'id' | 'selected'>;
          
        // Food related
        case 'restaurant':
        case 'cafeteria':
          return {
            ...baseProps,
            type: 'furniture',
            furnitureType: toolId,
            fill: '#FFF3E0',
            stroke: '#FF9800',
            strokeWidth: 1,
            layer: 2,
            customProperties: {
              description: toolId === 'restaurant' ? 'Restaurant/Dining Area' : 'Cafeteria/Food Service'
            }
          } as Omit<FurnitureElement, 'id' | 'selected'>;
          
        // Information related
        case 'information':
        case 'info-point':
        case 'lost-found':
          return {
            ...baseProps,
            type: 'furniture',
            furnitureType: 'info',
            fill: '#E1F5FE',
            stroke: '#03A9F4',
            strokeWidth: 1,
            layer: 2,
            customProperties: {
              description: toolId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            }
          } as Omit<FurnitureElement, 'id' | 'selected'>;
          
        // Restroom related
        case 'mens-restroom':
        case 'womens-restroom':
          return {
            ...baseProps,
            type: 'furniture',
            furnitureType: 'restroom',
            fill: '#E8EAF6',
            stroke: '#3F51B5',
            strokeWidth: 1,
            layer: 2,
            customProperties: {
              description: toolId === 'mens-restroom' ? "Men's Restroom" : "Women's Restroom"
            }
          } as Omit<FurnitureElement, 'id' | 'selected'>;
          
        // Transportation
        case 'transportation':
        case 'baggage':
          return {
            ...baseProps,
            type: 'furniture',
            furnitureType: toolId,
            fill: '#ECEFF1',
            stroke: '#607D8B',
            strokeWidth: 1,
            layer: 2,
            customProperties: {
              description: toolId === 'transportation' ? 'Transportation Area' : 'Baggage Services'
            }
          } as Omit<FurnitureElement, 'id' | 'selected'>;
          
        // Other facilities
        case 'elevator':
        case 'atm':
        case 'no-smoking':
          return {
            ...baseProps,
            type: 'furniture',
            furnitureType: toolId,
            fill: '#F5F5F5',
            stroke: '#9E9E9E',
            strokeWidth: 1,
            layer: 2,
            customProperties: {
              description: toolId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            }
          } as Omit<FurnitureElement, 'id' | 'selected'>;
          
        // Add cases for all other tools
        default:
          // For any other tool, create a generic furniture element
          return {
            ...baseProps,
            type: 'furniture',
            furnitureType: toolId,
            fill: '#F5F5F5',
            stroke: '#9E9E9E',
            strokeWidth: 1,
            layer: 2,
            customProperties: {
              description: toolId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            }
          } as Omit<FurnitureElement, 'id' | 'selected'>;
      }
    };
    
    // Add the element based on the dropped tool
    const elementToAdd = createElementForTool();
    if (elementToAdd) {
      addElement(elementToAdd);
    }
    
    // Reset active tool to select after dropping
    setActiveTool('select');
  };

  return (
    <div 
      ref={containerRef} 
      className={`absolute inset-0 overflow-hidden canvas-area ${isDragOver ? 'bg-blue-50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Stage
        ref={stageRef}
        width={Math.max(containerSize.width, 100)}
        height={Math.max(containerSize.height, 100)}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
        x={offset.x}
        y={offset.y}
        scale={{ x: zoom, y: zoom }}
        draggable={false}
        pixelRatio={window.devicePixelRatio || 2} // Use device pixel ratio for high-DPI displays
        imageSmoothingEnabled={true} // Enable image smoothing for better quality
        perfectDrawEnabled={true} // Enable perfect drawing for crisp edges
      >
        {/* ExpofP-style Background Layer */}
        <Layer
          imageSmoothingEnabled={true}
          perfectDrawEnabled={true}
          hitGraphEnabled={false} // Disable hit graph for better performance
        >
          {/* ExpofP-style Canvas Background */}
          <Rect
            x={0}
            y={0}
            width={canvasSize.width}
            height={canvasSize.height}
            fill="#f7fafc"
            stroke="#e2e8f0"
            strokeWidth={1}
          />
          
          {/* Background Image */}
          {backgroundImage && (
            <BackgroundImage settings={backgroundImage} />
          )}
        </Layer>
        
        {/* Flooring Layer */}
        <Layer
          imageSmoothingEnabled={true}
          perfectDrawEnabled={true}
          hitGraphEnabled={false}
          opacity={flooring?.enabled ? 1 : 0}
        >
          {flooring?.enabled && flooring.elements.length > 0 && (
            <FlooringLayer 
              opacity={flooring.opacity} 
              elements={flooring.elements} 
            />
          )}
        </Layer>
        
        {/* ExpofP-style Grid Layer */}
        <Layer
          imageSmoothingEnabled={true}
          perfectDrawEnabled={true}
          hitGraphEnabled={false}
        >
          <CanvasGrid
            enabled={grid.enabled}
            size={grid.size}
            width={canvasSize.width}
            height={canvasSize.height}
            opacity={0.2}
          />
        </Layer>
        
        {/* Main Content Layer */}
        <Layer
          imageSmoothingEnabled={true}
          perfectDrawEnabled={true}
          hitGraphEnabled={true} // Enable hit detection for better element interaction
        >
          
          {/* Preview shape while dragging */}
          {isDragging && dragStartPos && selectionEnd && (
            <PreviewShape
              tool={activeTool}
              start={dragStartPos}
              end={selectionEnd}
            />
          )}
          
          {/* Render all elements sorted by layer */}
          {console.log("Canvas rendering elements:", elements.length)}
          {[...elements]
            .filter(element => element.width > 0 && element.height > 0)
            .sort((a, b) => a.layer - b.layer)
            .slice(0, 50)
            .map(element => (
              <ElementRenderer
                key={element.id}
                element={element}
                isSelected={selectedIds.includes(element.id)}
                snapToGrid={grid.snap}
                gridSize={grid.size}
              />
            ))}
          
          {/* Selection rectangle */}
          {selectionStart && selectionEnd && activeTool === 'select' && (
            <SelectionRect
              start={selectionStart}
              end={selectionEnd}
            />
          )}
          
          {/* Path Renderer */}
          {pathMode && (
            <PathRenderer
              pathPoints={pathPoints}
            />
          )}
        </Layer>
      </Stage>
      

      
      {/* Controls positioned at top of viewport */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <CanvasControls />
      </div>
      

      
      {/* Booth Details Modal */}
      {selectedBoothDetails && (
        <BoothDetailsModal
          boothData={selectedBoothDetails}
          onClose={() => setSelectedBoothDetails(null)}
        />
      )}
    </div>
  );
};


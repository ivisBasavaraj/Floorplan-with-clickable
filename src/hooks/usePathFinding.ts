import { useState, useCallback } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { BoothElement } from '../types/canvas';
import PF from 'pathfinding';

export const usePathFinding = (gridSize: number) => {
  const [startBoothId, setStartBoothId] = useState<string | null>(null);
  const [endBoothId, setEndBoothId] = useState<string | null>(null);
  const [pathMode, setPathMode] = useState<boolean>(false);
  const [pathPoints, setPathPoints] = useState<number[]>([]);

  const { elements, canvasSize } = useCanvasStore();

  // Define calculatePath first since other functions depend on it
  const calculatePath = useCallback((startId: string, endId: string) => {
    // Find the booth elements
    const startBooth = elements.find(el => el.id === startId && el.type === 'booth') as BoothElement | undefined;
    const endBooth = elements.find(el => el.id === endId && el.type === 'booth') as BoothElement | undefined;

    if (!startBooth || !endBooth) {
      console.error('Start or end booth not found');
      return;
    }

    // Calculate grid dimensions based on canvas size
    const gridCols = Math.ceil(canvasSize.width / gridSize);
    const gridRows = Math.ceil(canvasSize.height / gridSize);

    // Create a grid representation
    const grid = new PF.Grid(gridCols, gridRows);

    // Mark all booth positions as obstacles in the grid
    elements.forEach(element => {
      if (element.type === 'booth' && element.id !== startId && element.id !== endId) {
        // Convert booth position to grid coordinates
        const startX = Math.floor(element.x / gridSize);
        const startY = Math.floor(element.y / gridSize);
        const endX = Math.ceil((element.x + element.width) / gridSize);
        const endY = Math.ceil((element.y + element.height) / gridSize);

        // Mark the booth area as non-walkable
        for (let x = startX; x < endX; x++) {
          for (let y = startY; y < endY; y++) {
            // Ensure coordinates are within grid bounds
            if (x >= 0 && x < gridCols && y >= 0 && y < gridRows) {
              grid.setWalkableAt(x, y, false);
            }
          }
        }
      }
    });

    // Calculate start and end positions in grid coordinates
    const startX = Math.floor(startBooth.x / gridSize) + Math.floor(startBooth.width / gridSize / 2);
    const startY = Math.floor(startBooth.y / gridSize) + Math.floor(startBooth.height / gridSize / 2);
    const endX = Math.floor(endBooth.x / gridSize) + Math.floor(endBooth.width / gridSize / 2);
    const endY = Math.floor(endBooth.y / gridSize) + Math.floor(endBooth.height / gridSize / 2);

    // Ensure coordinates are within grid bounds
    const clampedStartX = Math.max(0, Math.min(startX, gridCols - 1));
    const clampedStartY = Math.max(0, Math.min(startY, gridRows - 1));
    const clampedEndX = Math.max(0, Math.min(endX, gridCols - 1));
    const clampedEndY = Math.max(0, Math.min(endY, gridRows - 1));

    // Create a finder instance
    const finder = new PF.AStarFinder({
      diagonalMovement: PF.DiagonalMovement.OnlyWhenNoObstacles,
      weight: 1
    });

    try {
      // Clone the grid to avoid modifying the original during path calculation
      const gridBackup = grid.clone();
      
      // Find the path
      const path = finder.findPath(
        clampedStartX, 
        clampedStartY, 
        clampedEndX, 
        clampedEndY, 
        gridBackup
      );

      // Convert the path from grid coordinates to canvas coordinates
      const points: number[] = [];
      path.forEach(([x, y]) => {
        points.push(x * gridSize + gridSize / 2);
        points.push(y * gridSize + gridSize / 2);
      });

      setPathPoints(points);
    } catch (error) {
      console.error('Error calculating path:', error);
      setPathPoints([]);
    }
  }, [elements, canvasSize, gridSize]);

  const togglePathMode = useCallback(() => {
    setPathMode(prev => !prev);
    if (pathMode) {
      // Clear path selections when exiting path mode
      setStartBoothId(null);
      setEndBoothId(null);
      setPathPoints([]);
    }
  }, [pathMode]);

  const clearPath = useCallback(() => {
    setStartBoothId(null);
    setEndBoothId(null);
    setPathPoints([]);
  }, []);

  const handleBoothSelect = useCallback((boothId: string) => {
    if (!pathMode) return;
    
    if (!startBoothId) {
      setStartBoothId(boothId);
    } else if (!endBoothId) {
      setEndBoothId(boothId);
      // Calculate path when both booths are selected
      calculatePath(startBoothId, boothId);
    } else {
      // Reset and start new path
      setStartBoothId(boothId);
      setEndBoothId(null);
      setPathPoints([]);
    }
  }, [pathMode, startBoothId, endBoothId, calculatePath]);
  
  // Direct selection methods for dropdown selectors
  const selectStartBooth = useCallback((boothId: string) => {
    if (!pathMode) return;
    
    setStartBoothId(boothId);
    
    // If end booth is already selected, calculate the path
    if (endBoothId) {
      calculatePath(boothId, endBoothId);
    }
  }, [pathMode, endBoothId, calculatePath]);
  
  const selectEndBooth = useCallback((boothId: string) => {
    if (!pathMode) return;
    
    setEndBoothId(boothId);
    
    // If start booth is already selected, calculate the path
    if (startBoothId) {
      calculatePath(startBoothId, boothId);
    }
  }, [pathMode, startBoothId, calculatePath]);

  return {
    startBoothId,
    endBoothId,
    pathMode,
    pathPoints,
    togglePathMode,
    clearPath,
    handleBoothSelect,
    selectStartBooth,
    selectEndBooth
  };
};
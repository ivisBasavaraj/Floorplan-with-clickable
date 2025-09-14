import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { usePathFinding } from '../../hooks/usePathFinding';
import { useCanvasStore } from '../../store/canvasStore';
import { BoothElement, DoorElement, FurnitureElement, PlantElement, ShapeElement } from '../../types/canvas';
import { PathControls } from '../canvas/PathControls';

import { EnhancedMapView } from './EnhancedMapView';

interface ViewMode3DProps {
  onBoothClick: (boothId: string) => void;
  selectedBoothId?: string;
  useMapMode?: boolean;
}

export const ViewMode3D: React.FC<ViewMode3DProps> = ({ onBoothClick, selectedBoothId, useMapMode = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { elements, grid, canvasSize } = useCanvasStore();
  const [isLoading, setIsLoading] = useState(true);
  
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
  
  // Store booth data for click handling
  const [boothPositions, setBoothPositions] = useState<{[id: string]: {x: number, y: number, width: number, height: number}}>({});
  
  // Reference to the path line
  const pathLineRef = useRef<THREE.Line | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Basic Three.js setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    // ExpofP-style background color
    scene.background = new THREE.Color(0xf7fafc);
    
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(0, 600, 800); // Better overview angle
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
    containerRef.current.appendChild(renderer.domElement);

    // Handle resize to keep 3D view fitting the screen
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);
    let ro: ResizeObserver | null = null;
    if (typeof window !== 'undefined' && (window as any).ResizeObserver) {
      ro = new (window as any).ResizeObserver(() => handleResize());
      if (containerRef.current) ro.observe(containerRef.current);
    }
    handleResize();
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05; // Smoother controls
    controls.maxPolarAngle = Math.PI / 2.2; // Limit vertical rotation
    controls.minDistance = 200;
    controls.maxDistance = 1500;
    
    // ExpofP-style lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(300, 500, 400);
    directionalLight.castShadow = true;
    
    // High-quality shadows
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 2000;
    directionalLight.shadow.camera.left = -800;
    directionalLight.shadow.camera.right = 800;
    directionalLight.shadow.camera.top = 800;
    directionalLight.shadow.camera.bottom = -800;
    directionalLight.shadow.bias = -0.0001;
    
    scene.add(directionalLight);
    
    // Secondary lights for professional look
    const backLight = new THREE.DirectionalLight(0xffffff, 0.2);
    backLight.position.set(-300, 300, -400);
    scene.add(backLight);
    
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.25);
    fillLight.position.set(-300, 300, 400);
    scene.add(fillLight);
    
    // Floor sized to match canvas dimensions for correct alignment
    const floorWidth = Math.max(canvasSize?.width || 2000, 10);
    const floorHeight = Math.max(canvasSize?.height || 1500, 10);
    const floorGeometry = new THREE.PlaneGeometry(floorWidth, floorHeight);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf7fafc,
      roughness: 0.9,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Grid helper sized to canvas
    const gridHelper = new THREE.GridHelper(Math.max(floorWidth, 10), 120, 0xe2e8f0, 0xedf2f7);
    gridHelper.material.opacity = 0.3 as any;
    (gridHelper.material as any).transparent = true;
    scene.add(gridHelper);
    
    // Store positions for click handling
    const positions: {[id: string]: {x: number, y: number, width: number, height: number}} = {};
    
    // Sort elements by layer to ensure proper rendering
    const sortedElements = [...elements].sort((a, b) => a.layer - b.layer);
    
    // Helper function to convert CSS color to THREE.js color
    const getThreeColor = (cssColor: string) => {
      // Default color if parsing fails
      let color = new THREE.Color(0xe2e8f0);
      
      try {
        // Handle rgba colors
        if (cssColor.startsWith('rgba')) {
          const rgba = cssColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
          if (rgba) {
            color = new THREE.Color(
              parseInt(rgba[1]) / 255,
              parseInt(rgba[2]) / 255,
              parseInt(rgba[3]) / 255
            );
          }
        } 
        // Handle hex and other color formats
        else {
          color = new THREE.Color(cssColor);
        }
      } catch (e) {
        console.error('Error parsing color:', cssColor);
      }
      
      return color;
    };
    
    // Create 3D elements
    sortedElements.forEach((element) => {
      // Calculate base position relative to canvas center, using element center
      const posX = element.x - (canvasSize?.width || 2000) / 2 + element.width / 2;
      const posZ = element.y - (canvasSize?.height || 1500) / 2 + element.height / 2;
      
      // Store position for click detection
      positions[element.id] = {
        x: posX,
        y: posZ,
        width: element.width,
        height: element.height
      };
      
      let mesh: THREE.Mesh | null = null;
      
      // Handle different element types
      switch (element.type) {
        case 'booth': {
          const booth = element as BoothElement;
          // ExpofP-style booth mesh
          const boothGeometry = new THREE.BoxGeometry(booth.width, 35, booth.height);
          
          // ExpofP-style booth colors
          let color;
          let isSelected = selectedBoothId === booth.id;
          
          if (isSelected) {
            color = 0x667eea; // ExpofP blue for selected booth
          } else {
            switch (booth.status) {
              case 'available':
                color = 0x6c757d; // Gray
                break;
              case 'on hold':
                color = 0xffc107; // Light yellow
                break;
              case 'reserved':
                color = 0x28a745; // Green
                break;
              default:
                color = 0x6c757d; // Gray
            }
          }
          
          const boothMaterial = new THREE.MeshStandardMaterial({
            color,
            transparent: true,
            opacity: isSelected ? 1.0 : 0.9,
            roughness: 0.3,
            metalness: 0.1,
            emissive: isSelected ? 0x223344 : 0x000000,
          });
          
          mesh = new THREE.Mesh(boothGeometry, boothMaterial);
          mesh.position.set(posX, 17.5, posZ);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          
          // ExpofP-style booth label
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = 120;
          canvas.height = 60;
          
          if (context) {
            // ExpofP-style label background
            context.fillStyle = 'rgba(255, 255, 255, 0.95)';
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add subtle border
            context.strokeStyle = 'rgba(226, 232, 240, 0.8)';
            context.lineWidth = 2;
            context.strokeRect(0, 0, canvas.width, canvas.height);
            
            context.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
            context.fillStyle = '#2d3748';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(booth.number, canvas.width / 2, canvas.height / 2);
            
            const texture = new THREE.CanvasTexture(canvas);
            const labelMaterial = new THREE.MeshBasicMaterial({
              map: texture,
              transparent: true,
              side: THREE.DoubleSide
            });
            
            const labelGeometry = new THREE.PlaneGeometry(booth.width * 0.7, booth.width * 0.35);
            const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
            labelMesh.position.set(0, 18, 0);
            labelMesh.rotation.x = -Math.PI / 2;
            
            mesh.add(labelMesh);
          }
          break;
        }
        
        case 'shape': {
          const shape = element as ShapeElement;
          
          if (shape.shapeType === 'rectangle') {
            // ExpofP-style walls
            const wallGeometry = new THREE.BoxGeometry(shape.width, 50, shape.height);
            const wallMaterial = new THREE.MeshStandardMaterial({
              color: 0x4a5568, // ExpofP wall color
              roughness: 0.8,
              metalness: 0.2,
            });
            
            mesh = new THREE.Mesh(wallGeometry, wallMaterial);
            mesh.position.set(posX, 25, posZ);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          } else if (shape.shapeType === 'line') {
            // ExpofP-style lines
            const points = [];
            points.push(new THREE.Vector3(posX - shape.width/2, 1, posZ - shape.height/2));
            points.push(new THREE.Vector3(posX + shape.width/2, 1, posZ + shape.height/2));
            
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineMaterial = new THREE.LineBasicMaterial({ 
              color: 0x718096,
              linewidth: 3
            });
            
            const line = new THREE.Line(lineGeometry, lineMaterial);
            scene.add(line);
          }
          break;
        }
        
        case 'furniture': {
          const furniture = element as FurnitureElement;
          // ExpofP-style furniture
          const furnitureGeometry = new THREE.BoxGeometry(furniture.width, 25, furniture.height);
          const furnitureMaterial = new THREE.MeshStandardMaterial({
            color: 0xa0aec0,
            roughness: 0.6,
            metalness: 0.3,
          });
          
          mesh = new THREE.Mesh(furnitureGeometry, furnitureMaterial);
          mesh.position.set(posX, 12.5, posZ);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          
          // ExpofP-style furniture label
          if (furniture.furnitureType) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 80;
            canvas.height = 40;
            
            if (context) {
              context.fillStyle = 'rgba(255, 255, 255, 0.9)';
              context.fillRect(0, 0, canvas.width, canvas.height);
              context.font = 'bold 16px -apple-system, sans-serif';
              context.fillStyle = '#4a5568';
              context.textAlign = 'center';
              context.textBaseline = 'middle';
              context.fillText(furniture.furnitureType, canvas.width / 2, canvas.height / 2);
              
              const texture = new THREE.CanvasTexture(canvas);
              const labelMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide
              });
              
              const labelGeometry = new THREE.PlaneGeometry(furniture.width * 0.6, furniture.width * 0.3);
              const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
              labelMesh.position.set(0, 13, 0);
              labelMesh.rotation.x = -Math.PI / 2;
              
              mesh.add(labelMesh);
            }
          }
          break;
        }
        
        case 'door': {
          const door = element as DoorElement;
          // ExpofP-style door
          const doorGeometry = new THREE.BoxGeometry(door.width, 35, door.height);
          const doorMaterial = new THREE.MeshStandardMaterial({
            color: 0xed8936,
            roughness: 0.4,
            metalness: 0.6,
          });
          
          mesh = new THREE.Mesh(doorGeometry, doorMaterial);
          mesh.position.set(posX, 17.5, posZ);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          
          // ExpofP-style door indicator
          const arrowLength = door.width * 0.6;
          const arrowGeometry = new THREE.BoxGeometry(arrowLength, 3, 6);
          const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0x2d3748 });
          const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
          arrow.position.set(0, 18, 0);
          
          // Rotate arrow based on door direction
          if (door.direction === 'right') {
            arrow.rotation.y = 0;
          } else if (door.direction === 'left') {
            arrow.rotation.y = Math.PI;
          } else if (door.direction === 'up') {
            arrow.rotation.y = -Math.PI / 2;
          } else if (door.direction === 'down') {
            arrow.rotation.y = Math.PI / 2;
          }
          
          mesh.add(arrow);
          break;
        }
        
        case 'plant': {
          const plant = element as PlantElement;
          // ExpofP-style plant
          const potGeometry = new THREE.CylinderGeometry(plant.width/5, plant.width/4, 12, 16);
          const potMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8b4513,
            roughness: 0.8,
            metalness: 0.1
          });
          const pot = new THREE.Mesh(potGeometry, potMaterial);
          pot.castShadow = true;
          pot.receiveShadow = true;
          
          const foliageGeometry = new THREE.SphereGeometry(plant.width/2.5, 16, 16);
          const foliageMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x48bb78,
            roughness: 0.9,
            metalness: 0.1
          });
          const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
          foliage.position.set(0, 18, 0);
          foliage.castShadow = true;
          foliage.receiveShadow = true;
          
          // Create a group to hold both parts
          const plantGroup = new THREE.Group();
          plantGroup.add(pot);
          plantGroup.add(foliage);
          plantGroup.position.set(posX, 6, posZ);
          
          scene.add(plantGroup);
          break;
        }
      }
      
      // Add mesh to scene if created
      if (mesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
      }
    });
    
    // Store booth positions
    setBoothPositions(positions);
    
    // Handle click events
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      
      // Calculate mouse position in normalized device coordinates
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;
      
      // Update the picking ray with the camera and mouse position
      raycaster.setFromCamera(mouse, camera);
      
      // Calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(scene.children, true);
      
      if (intersects.length > 0) {
        // Find the closest element to the intersection point
        const point = intersects[0].point;
        
        // Check if the point is inside any element
        for (const [id, position] of Object.entries(positions)) {
          const halfWidth = position.width / 2;
          const halfHeight = position.height / 2;
          
          if (
            point.x >= position.x - halfWidth &&
            point.x <= position.x + halfWidth &&
            point.z >= position.y - halfHeight &&
            point.z <= position.y + halfHeight
          ) {
            const clickedElement = elements.find(element => element.id === id);
            
            if (clickedElement) {
              if (pathMode && clickedElement.type === 'booth') {
                // In path mode, handle booth selection for pathfinding
                handleBoothSelect(id);
                
                // Update the 3D path visualization
                updatePathVisualization();
              } else {
                // Normal click behavior - only show info for booths
                if (clickedElement.type === 'booth') {
                  const booth = clickedElement as BoothElement;
                  onBoothClick(booth.number || id);
                }
              }
            }
            break;
          }
        }
      }
    };
    
    // Function to update the path visualization in 3D
    const updatePathVisualization = () => {
      // Remove existing path line if it exists
      if (pathLineRef.current && sceneRef.current) {
        sceneRef.current.remove(pathLineRef.current);
        pathLineRef.current = null;
      }
      
      // If we don't have enough path points, don't render anything
      if (pathPoints.length < 4) return;
      
      // Create a new path line
      const points = [];
      
      // Convert 2D path points to 3D points
      for (let i = 0; i < pathPoints.length; i += 2) {
        const x = pathPoints[i] - 500;
        const z = pathPoints[i + 1] - 500;
        points.push(new THREE.Vector3(x, 30, z)); // ExpofP-style path height
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color: 0x667eea, // ExpofP path color
        linewidth: 4
      });
      
      pathLineRef.current = new THREE.Line(geometry, material);
      sceneRef.current?.add(pathLineRef.current);
    };
    
    containerRef.current.addEventListener('click', handleClick);
    
    // Add keyboard shortcut for path mode
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
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    setIsLoading(false);
    
    // Update path visualization when path points change
    if (pathPoints.length > 0) {
      updatePathVisualization();
    }
    
    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('click', handleClick);
        try { containerRef.current.removeChild(renderer.domElement); } catch {}
      }
      
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      
      // Dispose resources
      renderer.dispose();
    };
  }, [elements, onBoothClick, pathMode, handleBoothSelect, selectedBoothId]);
  
  // Effect to update path visualization when path points change
  useEffect(() => {
    // This effect will run outside the main Three.js setup
    // We need to make sure we have a scene and path points
    if (sceneRef.current && pathPoints.length > 0) {
      // Remove existing path line if it exists
      if (pathLineRef.current) {
        sceneRef.current.remove(pathLineRef.current);
        pathLineRef.current = null;
      }
      
      // Create a new path line
      const points = [];
      
      // Convert 2D path points to 3D points
      for (let i = 0; i < pathPoints.length; i += 2) {
        const x = pathPoints[i] - 500;
        const z = pathPoints[i + 1] - 500;
        points.push(new THREE.Vector3(x, 30, z)); // ExpofP-style path height
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color: 0x667eea,
        linewidth: 4
      });
      
      pathLineRef.current = new THREE.Line(geometry, material);
      sceneRef.current.add(pathLineRef.current);
    }
  }, [pathPoints]);
  


  // If using map mode, render enhanced Leaflet map like /enhanced-map
  if (useMapMode) {
    return <EnhancedMapView 
      elements={elements} 
      onBoothClick={onBoothClick} 
      selectedBoothId={selectedBoothId} 
      startIn3D={true}
    />;
  }
  
  return (
    <div ref={containerRef} className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center glass-panel">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto"></div>
            <p className="mt-6 text-gray-700 font-medium">Loading 3D Exhibition View...</p>
          </div>
        </div>
      )}
      
      {/* ExpofP-style Legend */}
      {!isLoading && (
        <div className="absolute top-6 left-6 bg-white border border-gray-300 rounded-xl p-5 z-10 text-sm shadow-lg">
          <h3 className="font-bold mb-4 text-lg text-gray-800">Exhibition Legend</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <div className="flex items-center">
              <div className="w-5 h-5 mr-3 rounded-md shadow-sm" style={{ backgroundColor: '#6c757d' }}></div>
              <span className="font-semibold text-gray-700">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 mr-3 rounded-md shadow-sm" style={{ backgroundColor: '#ffc107' }}></div>
              <span className="font-semibold text-gray-700">On Hold</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 mr-3 rounded-md shadow-sm" style={{ backgroundColor: '#28a745' }}></div>
              <span className="font-semibold text-gray-700">Reserved</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 mr-3 rounded-md shadow-sm" style={{ backgroundColor: '#6c757d' }}></div>
              <span className="font-semibold text-gray-700">Infrastructure</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Path Controls */}
      {!isLoading && (
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
      
      {/* ExpofP-style Camera Controls Help */}
      {!isLoading && (
        <div className="absolute bottom-6 left-6 bg-white border border-gray-300 rounded-xl p-5 z-10 text-sm shadow-lg">
          <h3 className="font-bold mb-4 text-lg text-gray-800">3D Controls</h3>
          <ul className="space-y-1">
            <li className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
              <span className="font-medium text-gray-700">Drag to rotate view</span>
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
              <span className="font-medium text-gray-700">Scroll to zoom</span>
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
              <span className="font-medium text-gray-700">Click booth for details</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
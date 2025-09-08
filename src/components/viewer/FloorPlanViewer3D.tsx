import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useCanvasStore } from '../../store/canvasStore';
import { AnyCanvasElement, BoothElement } from '../../types/canvas';

interface FloorPlanViewer3DProps {
  onBoothClick?: (boothId: string) => void;
  selectedBoothId?: string;
}

export const FloorPlanViewer3D: React.FC<FloorPlanViewer3DProps> = ({
  onBoothClick,
  selectedBoothId
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<any>();
  const controlsTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const frameRef = useRef<number>();
  const resizeObserverRef = useRef<ResizeObserver>();
  const resizeHandlerRef = useRef<() => void>();
  const [isLoading, setIsLoading] = useState(true);

  const { elements, backgroundImage, canvasSize } = useCanvasStore();

  useEffect(() => {
    if (!mountRef.current) return;

    initThreeJS();
    createScene();
    animate();

    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (sceneRef.current) {
      updateScene();
    }
  }, [elements, selectedBoothId, canvasSize]);

  const initThreeJS = () => {
    if (!mountRef.current) return;

    // Ensure dimensions are valid; fallback to viewport if container hasn't sized yet
    let width = mountRef.current.clientWidth || window.innerWidth;
    let height = mountRef.current.clientHeight || window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    // Add subtle fog for depth perception
    scene.fog = new THREE.Fog(0xf0f0f0, 100, 1200);
    sceneRef.current = scene;

    // Camera - start farther for clear visibility
    const camera = new THREE.PerspectiveCamera(60, Math.max(width, 1) / Math.max(height, 1), 0.1, 2000);
    camera.position.set(120, 160, 160);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Improve color/lighting realism
    renderer.outputColorSpace = THREE.SRGBColorSpace as any;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
    directionalLight.position.set(150, 220, 140);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 2000;
    scene.add(directionalLight);

    // Controls (basic orbit controls simulation)
    setupControls();

    // Handle resize - keep a stable reference and observe container
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      const w = mountRef.current.clientWidth || window.innerWidth;
      const h = mountRef.current.clientHeight || window.innerHeight;
      camera.aspect = Math.max(w, 1) / Math.max(h, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    resizeHandlerRef.current = handleResize;
    window.addEventListener('resize', handleResize);

    if ('ResizeObserver' in window && mountRef.current) {
      const ro = new ResizeObserver(() => handleResize());
      ro.observe(mountRef.current);
      resizeObserverRef.current = ro;
    }

    // Perform an initial fit/resize shortly after mount for clarity
    setTimeout(() => {
      try { fitCameraToContent(); } catch {}
      if (resizeHandlerRef.current) resizeHandlerRef.current();
      requestAnimationFrame(() => setIsLoading(false));
    }, 0);
  };

  const setupControls = () => {
    if (!rendererRef.current || !cameraRef.current) return;

    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseDown = (event: MouseEvent) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isMouseDown || !cameraRef.current) return;

      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;

      targetX += deltaX * 0.01;
      targetY += deltaY * 0.01;

      // Limit vertical rotation
      targetY = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetY));

      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const onWheel = (event: WheelEvent) => {
      if (!cameraRef.current) return;
      
      const camera = cameraRef.current;
      const distance = camera.position.length();
      const newDistance = Math.max(30, Math.min(1000, distance + event.deltaY * 0.5));
      
      camera.position.normalize().multiplyScalar(newDistance);
    };

    const canvas = rendererRef.current.domElement;
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('wheel', onWheel);

    controlsRef.current = {
      update: () => {
        if (!cameraRef.current) return;
        
        const camera = cameraRef.current;
        const distance = camera.position.length();
        
        camera.position.x = Math.cos(targetX) * Math.cos(targetY) * distance;
        camera.position.y = Math.sin(targetY) * distance;
        camera.position.z = Math.sin(targetX) * Math.cos(targetY) * distance;
        
        camera.lookAt(0, 0, 0);
      }
    };
  };

  const createScene = () => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;

    // Create floor
    // Floor sized to canvas, scaled down
    const baseScale = 0.1;
    const floorGeometry = new THREE.PlaneGeometry(
      Math.max((canvasSize?.width || 2000) * baseScale, 10),
      Math.max((canvasSize?.height || 1500) * baseScale, 10)
    );
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      metalness: 0.0,
      roughness: 1.0,
      transparent: true,
      opacity: 0.95
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Add grid helper for spatial reference
    const grid = new THREE.GridHelper(Math.max((canvasSize?.width || 2000) * baseScale, 10), 20, 0x888888, 0xcccccc);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.25 as any;
    scene.add(grid);

    // Add background image as floor texture if available
    if (backgroundImage?.url) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(backgroundImage.url, (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(1, 1);
        floorMaterial.map = texture;
        floorMaterial.needsUpdate = true;
      });
    }

    updateScene();
  };

  const updateScene = () => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;

    // Remove existing booth meshes
    const boothsToRemove = scene.children.filter(child => 
      child.userData.type === 'booth' || child.userData.type === 'element'
    );
    boothsToRemove.forEach(booth => scene.remove(booth));

    // Add 3D elements
    elements.forEach((element) => {
      const mesh = createElement3D(element);
      if (mesh) {
        scene.add(mesh);
      }
    });

    // After updating, fit camera to content to ensure visibility
    fitCameraToContent();
  };

  const fitCameraToContent = () => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    // Compute bounding box of visible content
    const box = new THREE.Box3();
    sceneRef.current.traverse((obj) => {
      const m = obj as THREE.Mesh;
      if ((m as any).isMesh) {
        const objBox = new THREE.Box3().setFromObject(m);
        box.union(objBox);
      }
    });

    if (!box.isEmpty()) {
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = (cameraRef.current.fov * Math.PI) / 180;
      let cameraZ = (maxDim / 2) / Math.tan(fov / 2);
      cameraZ *= 1.4; // add some padding

      // Limit distances
      cameraZ = Math.min(Math.max(cameraZ, 50), 800);

      cameraRef.current.position.set(center.x + cameraZ, center.y + cameraZ * 0.8, center.z + cameraZ);
      cameraRef.current.lookAt(center);

      if (resizeHandlerRef.current) resizeHandlerRef.current();
    }
  };

  const createElement3D = (element: AnyCanvasElement): THREE.Object3D | null => {
    const { x, y, width, height, type } = element;

    // Convert 2D coordinates (top-left origin) to 3D centered coordinates
    // Use element center to align positions with 2D view
    const scale = 0.1;
    const centerX = (canvasSize?.width || 2000) / 2;
    const centerY = (canvasSize?.height || 1500) / 2;
    const posX = ((x + width / 2) - centerX) * scale; // center-aligned X
    const posZ = ((y + height / 2) - centerY) * scale; // center-aligned Y -> Z

    switch (type) {
      case 'booth': {
        const booth = element as BoothElement;
        
        // Create booth geometry
        const geometry = new THREE.BoxGeometry(
          width * scale,
          Math.max(10, Math.min(20, height * scale * 0.6)), // Taller booths for 3D perception
          height * scale
        );

        // Booth color based on status
        let color = 0x90EE90; // Light green for available
        if (booth.status === 'reserved') color = 0xFFD700; // Gold
        if (booth.status === 'sold') color = 0xFF6B6B; // Light red
        if (booth.status === 'on-hold') color = 0x87CEEB; // Sky blue

        // Highlight selected booth
        if (selectedBoothId === booth.id) {
          color = 0x4169E1; // Royal blue for selected
        }

        const material = new THREE.MeshStandardMaterial({ 
          color,
          metalness: 0.1,
          roughness: 0.6,
          transparent: true,
          opacity: 0.9
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(posX, 2.5, posZ);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Add booth number as text (simplified)
        const textGeometry = new THREE.PlaneGeometry(width * scale * 0.8, 2);
        const textMaterial = new THREE.MeshBasicMaterial({ 
          color: 0x000000,
          transparent: true,
          opacity: 0.8
        });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.userData = { ...(textMesh.userData || {}), label: true };
        textMesh.position.set(posX, 6, posZ);

        // Group booth and text
        const group = new THREE.Group();
        group.add(mesh);
        group.add(textMesh);
        group.userData = { 
          type: 'booth', 
          id: booth.id,
          element: booth
        };

        // Add click handler
        mesh.userData = group.userData;

        return group;
      }

      case 'wall':
      case 'shape': {
        const geometry = new THREE.BoxGeometry(
          width * scale,
          Math.max(12, Math.min(24, height * scale * 0.8)),
          Math.max(height * scale, 1)
        );

        const material = new THREE.MeshStandardMaterial({ 
          color: 0x8B4513, // Brown for walls
          metalness: 0.05,
          roughness: 0.8,
          transparent: true,
          opacity: 0.95
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(posX, 4, posZ);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { 
          type: 'element', 
          id: element.id,
          element
        };

        return mesh;
      }

      case 'furniture': {
        const geometry = new THREE.BoxGeometry(
          width * scale,
          Math.max(4, Math.min(10, height * scale * 0.4)),
          height * scale
        );

        const material = new THREE.MeshStandardMaterial({ 
          color: 0x8A2BE2, // Blue violet for furniture
          metalness: 0.2,
          roughness: 0.5,
          transparent: true,
          opacity: 0.85
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(posX, 1.5, posZ);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { 
          type: 'element', 
          id: element.id,
          element
        };

        return mesh;
      }

      default:
        return null;
    }
  };

  const animate = () => {
    frameRef.current = requestAnimationFrame(animate);

    if (controlsRef.current) {
      controlsRef.current.update();
    }

    // Keep labels facing the camera (simple billboarding)
    if (sceneRef.current && cameraRef.current) {
      sceneRef.current.traverse((obj) => {
        if ((obj as any).userData && (obj as any).userData.label && cameraRef.current) {
          (obj as THREE.Object3D).lookAt(cameraRef.current.position);
        }
      });
    }

    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  const cleanup = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    if (resizeObserverRef.current) {
      try { resizeObserverRef.current.disconnect(); } catch {}
      resizeObserverRef.current = undefined as any;
    }

    if (resizeHandlerRef.current) {
      window.removeEventListener('resize', resizeHandlerRef.current);
      resizeHandlerRef.current = undefined;
    }

    if (rendererRef.current && mountRef.current) {
      try { mountRef.current.removeChild(rendererRef.current.domElement); } catch {}
      rendererRef.current.dispose();
    }
  };

  // Handle click events
  useEffect(() => {
    if (!rendererRef.current || !onBoothClick) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

      const rect = rendererRef.current.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

      if (intersects.length > 0) {
        let object: THREE.Object3D | null = intersects[0].object;
        // Traverse up to find the booth group if a child (e.g., label) was clicked
        while (object && !(object.userData && object.userData.type === 'booth' && object.userData.id)) {
          object = object.parent as THREE.Object3D | null;
        }
        if (object && object.userData && object.userData.type === 'booth' && object.userData.id) {
          onBoothClick(object.userData.id);
        }
      }
    };

    const canvas = rendererRef.current.domElement;
    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [onBoothClick]);

  return (
    <div className="relative w-full h-full min-h-[300px]">
      <div ref={mountRef} className="w-full h-full" />

      {/* Loading overlay so the canvas still mounts */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading 3D View...</p>
          </div>
        </div>
      )}
      
      {/* 3D Controls Info */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white text-xs p-3 rounded-lg">
        <div className="space-y-1">
          <div>🖱️ Click & drag to rotate</div>
          <div>🎯 Scroll to zoom</div>
          <div>📦 Click booths for details</div>
        </div>
      </div>

      {/* View Info */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-90 text-gray-800 text-sm p-3 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-400 rounded"></div>
          <span>Reserved</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-400 rounded"></div>
          <span>Sold</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
};
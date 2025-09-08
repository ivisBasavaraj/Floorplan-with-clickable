import React, { useEffect, useState } from 'react';
import { Image, Transformer, Group } from 'react-konva';
import { useCanvasStore } from '../../store/canvasStore';
import type { BackgroundImageSettings } from '../../types/canvas';

interface BackgroundImageProps {
  settings: BackgroundImageSettings;
}

export const BackgroundImage: React.FC<BackgroundImageProps> = ({ settings }) => {
  const { updateBackgroundImage, canvasSize } = useCanvasStore();
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const imageRef = React.useRef<any>(null);
  const transformerRef = React.useRef<any>(null);
  
  // Load the image or create map
  useEffect(() => {
    console.log('Loading background:', settings.url);
    setIsLoading(true);
    setError(null);
    
    if (settings.url === 'MAP_BACKGROUND') {
      // Create a realistic map-like background
      const canvas = document.createElement('canvas');
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // ExpoFP style map background
        ctx.fillStyle = '#f5f5dc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Street network like ExpoFP
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        
        // Main avenue (horizontal)
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * 0.35);
        ctx.lineTo(canvas.width, canvas.height * 0.35);
        ctx.stroke();
        
        // Main street (vertical)
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.45, 0);
        ctx.lineTo(canvas.width * 0.45, canvas.height);
        ctx.stroke();
        
        // Secondary streets
        ctx.lineWidth = 3;
        const streets = [
          [0, canvas.height * 0.15, canvas.width, canvas.height * 0.15],
          [0, canvas.height * 0.55, canvas.width, canvas.height * 0.55],
          [0, canvas.height * 0.75, canvas.width, canvas.height * 0.75],
          [canvas.width * 0.2, 0, canvas.width * 0.2, canvas.height],
          [canvas.width * 0.7, 0, canvas.width * 0.7, canvas.height]
        ];
        
        streets.forEach(([x1, y1, x2, y2]) => {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        });
        
        // Buildings with realistic colors
        ctx.fillStyle = '#e8e8e8';
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 1;
        
        // City blocks between streets
        const buildings = [
          [10, 10, 180, 120],
          [210, 10, 180, 120],
          [470, 10, 200, 120],
          [10, 150, 180, 150],
          [210, 150, 180, 150],
          [470, 150, 200, 150],
          [10, 380, 180, 120],
          [210, 380, 180, 120],
          [470, 380, 200, 120]
        ];
        
        buildings.forEach(([x, y, w, h]) => {
          ctx.fillRect(x, y, w, h);
          ctx.strokeRect(x, y, w, h);
        });
        
        // Green spaces
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(690, 10, 80, 120);
        ctx.fillRect(690, 150, 80, 150);
        
        // Water feature
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(690, 320, 80, 180);
        
        // Street names like ExpoFP
        ctx.fillStyle = '#333333';
        ctx.font = '10px Arial';
        ctx.fillText('Main Avenue', 10, canvas.height * 0.35 - 8);
        ctx.fillText('Exhibition Blvd', canvas.width * 0.45 + 5, 20);
        ctx.fillText('Convention St', 10, canvas.height * 0.15 - 8);
        
        // Area labels
        ctx.font = '12px Arial';
        ctx.fillStyle = '#666666';
        ctx.fillText('North Hall', 50, 80);
        ctx.fillText('South Hall', 50, 450);
        ctx.fillText('East Wing', 500, 220);
        ctx.fillText('Park', 700, 80);
      }
      
      const img = new window.Image();
      img.onload = () => {
        console.log('ExpoFP style map background created');
        setImage(img);
        setIsLoading(false);
      };
      img.src = canvas.toDataURL();
    } else {
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
        console.log('Background image loaded successfully:', settings.url);
        setImage(img);
        setIsLoading(false);
      };
      
      img.onerror = (error) => {
        console.error('Failed to load background image:', settings.url, error);
        setError('Failed to load image');
        setIsLoading(false);
      };
      
      img.src = settings.url;
      
      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }
  }, [settings.url, canvasSize.width, canvasSize.height]);
  
  // Attach transformer if not locked
  useEffect(() => {
    if (imageRef.current && transformerRef.current && !settings.locked) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [settings.locked]);
  
  // Calculate dimensions based on fit mode
  const getDimensions = () => {
    if (!image) return { width: 0, height: 0 };
    
    const { fitMode, scale } = settings;
    const imgRatio = image.width / image.height;
    
    switch (fitMode) {
      case 'stretch':
        return {
          width: canvasSize.width,
          height: canvasSize.height
        };
      
      case 'fit':
        if (canvasSize.width / canvasSize.height > imgRatio) {
          // Canvas is wider than image
          return {
            width: canvasSize.height * imgRatio,
            height: canvasSize.height
          };
        } else {
          // Canvas is taller than image
          return {
            width: canvasSize.width,
            height: canvasSize.width / imgRatio
          };
        }
      
      case 'center':
        return {
          width: image.width * scale,
          height: image.height * scale
        };
      
      case 'tile':
        // Tiling is handled differently - we'll use a pattern fill
        return {
          width: canvasSize.width,
          height: canvasSize.height
        };
      
      default:
        return {
          width: image.width * scale,
          height: image.height * scale
        };
    }
  };
  
  const handleDragEnd = (e: any) => {
    if (settings.locked) return;
    
    updateBackgroundImage({
      position: {
        x: e.target.x(),
        y: e.target.y()
      }
    });
  };
  
  const handleTransformEnd = (e: any) => {
    if (settings.locked) return;
    
    const node = imageRef.current;
    if (!node) return;
    
    // Get the new scale
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale to 1 (we'll apply it to width/height)
    node.scaleX(1);
    node.scaleY(1);
    
    updateBackgroundImage({
      position: {
        x: node.x(),
        y: node.y()
      },
      scale: scaleX, // Assuming uniform scaling
      rotation: node.rotation()
    });
  };
  
  if (isLoading) return null;
  if (error) return null;
  if (!image) return null;
  
  const dimensions = getDimensions();
  
  // For tiling, we use a different approach
  if (settings.fitMode === 'tile') {
    return (
      <Group>
        {/* Create a grid of images to cover the canvas */}
        {Array.from({ length: Math.ceil(dimensions.width / (image.width * settings.scale)) }).map((_, colIndex) =>
          Array.from({ length: Math.ceil(dimensions.height / (image.height * settings.scale)) }).map((_, rowIndex) => (
            <Image
              key={`tile-${colIndex}-${rowIndex}`}
              image={image}
              x={colIndex * image.width * settings.scale + settings.position.x}
              y={rowIndex * image.height * settings.scale + settings.position.y}
              width={image.width * settings.scale}
              height={image.height * settings.scale}
              opacity={settings.opacity}
              listening={!settings.locked}
            />
          ))
        )}
      </Group>
    );
  }
  
  return (
    <>
      <Image
        ref={imageRef}
        image={image}
        x={settings.position.x}
        y={settings.position.y}
        width={dimensions.width}
        height={dimensions.height}
        rotation={settings.rotation}
        opacity={settings.opacity}
        draggable={!settings.locked}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
      
      {!settings.locked && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          rotateEnabled={true}
        />
      )}
    </>
  );
};
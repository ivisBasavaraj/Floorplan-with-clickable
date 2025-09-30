import React, { useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';

interface DetectedHall {
  id: string;
  name: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  area: number;
  confidence: number;
  detection_method: string;
  color?: string;
}

interface HallDetectionPreviewProps {
  imageUrl: string;
  detectedHalls: DetectedHall[];
  onHallSelect?: (hall: DetectedHall) => void;
  selectedHallId?: string;
}

export const HallDetectionPreview: React.FC<HallDetectionPreviewProps> = ({
  imageUrl,
  detectedHalls,
  onHallSelect,
  selectedHallId
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imageUrl) {
      loadImageAndDraw();
    }
  }, [imageUrl, detectedHalls, selectedHallId]);

  const loadImageAndDraw = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the image
      ctx.drawImage(img, 0, 0);
      
      // Draw detected halls
      drawDetectedHalls(ctx, detectedHalls);
    };
    
    img.onerror = () => {
      console.error('Failed to load image for hall detection preview');
    };
    
    img.src = imageUrl;
  };

  const drawDetectedHalls = (ctx: CanvasRenderingContext2D, halls: DetectedHall[]) => {
    halls.forEach((hall, index) => {
      const { x, y, width, height } = hall.bounds;
      const isSelected = selectedHallId === hall.id;
      
      // Get color based on detection method and hall color
      let strokeColor = '#3b82f6'; // Default blue
      let fillColor = 'rgba(59, 130, 246, 0.2)';
      
      // First check if hall has a specific color
      if (hall.color) {
        switch (hall.color) {
          case 'blue':
          case 'light_blue':
            strokeColor = '#3b82f6';
            fillColor = 'rgba(59, 130, 246, 0.3)';
            break;
          case 'green':
          case 'light_green':
            strokeColor = '#10b981';
            fillColor = 'rgba(16, 185, 129, 0.3)';
            break;
          case 'red':
          case 'light_red':
            strokeColor = '#ef4444';
            fillColor = 'rgba(239, 68, 68, 0.3)';
            break;
          case 'orange':
          case 'yellow':
          case 'light_orange':
            strokeColor = '#f59e0b';
            fillColor = 'rgba(245, 158, 11, 0.3)';
            break;
          case 'purple':
          case 'light_purple':
            strokeColor = '#8b5cf6';
            fillColor = 'rgba(139, 92, 246, 0.3)';
            break;
        }
      } else {
        // Fallback to detection method colors
        switch (hall.detection_method) {
        case 'color_blue':
          strokeColor = '#3b82f6';
          fillColor = 'rgba(59, 130, 246, 0.2)';
          break;
        case 'color_green':
          strokeColor = '#10b981';
          fillColor = 'rgba(16, 185, 129, 0.2)';
          break;
        case 'color_red':
          strokeColor = '#ef4444';
          fillColor = 'rgba(239, 68, 68, 0.2)';
          break;
        case 'color_yellow':
        case 'color_orange':
          strokeColor = '#f59e0b';
          fillColor = 'rgba(245, 158, 11, 0.2)';
          break;
        case 'color_purple':
          strokeColor = '#8b5cf6';
          fillColor = 'rgba(139, 92, 246, 0.2)';
          break;
        case 'merged':
          strokeColor = '#8b5cf6';
          fillColor = 'rgba(139, 92, 246, 0.2)';
          break;
        case 'template_matching':
          strokeColor = '#06b6d4';
          fillColor = 'rgba(6, 182, 212, 0.2)';
          break;
        default:
          strokeColor = '#6b7280';
          fillColor = 'rgba(107, 114, 128, 0.2)';
        }
      }
      
      if (isSelected) {
        strokeColor = '#dc2626';
        fillColor = 'rgba(220, 38, 38, 0.3)';
      }
      
      // Draw hall rectangle with enhanced styling
      ctx.fillStyle = fillColor;
      ctx.fillRect(x, y, width, height);
      
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = isSelected ? 5 : 3;
      ctx.strokeRect(x, y, width, height);
      
      // Draw enhanced hall label with better visibility
      const labelX = x + width / 2;
      const labelY = y + height / 2;
      
      // Label background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 16px Arial';
      const textMetrics = ctx.measureText(hall.name);
      const labelWidth = textMetrics.width + 20;
      const labelHeight = 30;
      
      ctx.fillRect(
        labelX - labelWidth / 2,
        labelY - labelHeight / 2,
        labelWidth,
        labelHeight
      );
      
      // Label border
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(
        labelX - labelWidth / 2,
        labelY - labelHeight / 2,
        labelWidth,
        labelHeight
      );
      
      // Label text
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(hall.name, labelX, labelY);
      
      // Enhanced confidence and area indicator
      const confidenceText = `${(hall.confidence * 100).toFixed(0)}% • ${(hall.area / 1000).toFixed(0)}k px²`;
      ctx.fillStyle = strokeColor;
      ctx.font = 'bold 12px Arial';
      ctx.fillText(confidenceText, labelX, labelY + 18);
      
      // Draw corner indicators for interactive feedback
      if (isSelected) {
        const cornerSize = 8;
        ctx.fillStyle = strokeColor;
        // Top-left corner
        ctx.fillRect(x - cornerSize/2, y - cornerSize/2, cornerSize, cornerSize);
        // Top-right corner
        ctx.fillRect(x + width - cornerSize/2, y - cornerSize/2, cornerSize, cornerSize);
        // Bottom-left corner
        ctx.fillRect(x - cornerSize/2, y + height - cornerSize/2, cornerSize, cornerSize);
        // Bottom-right corner
        ctx.fillRect(x + width - cornerSize/2, y + height - cornerSize/2, cornerSize, cornerSize);
      }
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !onHallSelect) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check which hall was clicked
    for (const hall of detectedHalls) {
      const { x: hx, y: hy, width, height } = hall.bounds;
      
      if (x >= hx && x <= hx + width && y >= hy && y <= hy + height) {
        onHallSelect(hall);
        break;
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">Hall Detection Preview</h4>
        <div className="text-sm text-gray-600">
          {detectedHalls.length} halls detected
        </div>
      </div>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="relative">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="max-w-full h-auto cursor-pointer"
            style={{ maxHeight: '500px' }}
          />
          
          {detectedHalls.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90">
              <div className="text-center">
                <FontAwesomeIcon icon="fas fa-search" size={32} className="text-gray-400 mb-2" />
                <p className="text-gray-600">No halls detected</p>
                <p className="text-sm text-gray-500">Try adjusting the image or detection settings</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Detection Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h5 className="font-medium text-gray-900 mb-3">Detection Methods</h5>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span>Contour Analysis</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span>Color Detection</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
            <span>Merged Regions</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span>Selected Hall</span>
          </div>
        </div>
      </div>
      
      {/* Hall List */}
      {detectedHalls.length > 0 && (
        <div className="space-y-2">
          <h5 className="font-medium text-gray-900">Detected Halls</h5>
          {detectedHalls.map((hall) => (
            <div
              key={hall.id}
              onClick={() => onHallSelect?.(hall)}
              className={`cursor-pointer border rounded-lg p-3 transition-all ${
                selectedHallId === hall.id
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h6 className="font-medium text-gray-900">{hall.name}</h6>
                  <p className="text-sm text-gray-600">
                    {hall.bounds.width} × {hall.bounds.height} px
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {(hall.confidence * 100).toFixed(1)}%
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${getDetectionMethodColor(hall.detection_method)}`}>
                    {hall.detection_method.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const getDetectionMethodColor = (method: string) => {
  switch (method) {
    case 'contour_analysis':
      return 'bg-blue-100 text-blue-800';
    case 'color_blue':
      return 'bg-blue-100 text-blue-800';
    case 'color_green':
      return 'bg-green-100 text-green-800';
    case 'color_red':
      return 'bg-red-100 text-red-800';
    case 'color_yellow':
      return 'bg-yellow-100 text-yellow-800';
    case 'merged':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
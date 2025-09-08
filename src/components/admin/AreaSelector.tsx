import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';

interface AreaSelectorProps {
  imageUrl: string;
  onAreaSelected: (area: { x: number; y: number; width: number; height: number }) => void;
  onClose: () => void;
}

export const AreaSelector: React.FC<AreaSelectorProps> = ({
  imageUrl,
  onAreaSelected,
  onClose
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setStartPos({ x, y });
    setCurrentPos({ x, y });
    setIsSelecting(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentPos({ x, y });
  };

  const handleMouseUp = () => {
    if (!isSelecting || !startPos || !currentPos || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = imageRef.current.naturalWidth / rect.width;
    const scaleY = imageRef.current.naturalHeight / rect.height;
    
    const area = {
      x: Math.min(startPos.x, currentPos.x) * scaleX,
      y: Math.min(startPos.y, currentPos.y) * scaleY,
      width: Math.abs(currentPos.x - startPos.x) * scaleX,
      height: Math.abs(currentPos.y - startPos.y) * scaleY
    };
    
    if (area.width > 50 && area.height > 50) {
      onAreaSelected(area);
    }
    
    setIsSelecting(false);
    setStartPos(null);
    setCurrentPos(null);
  };

  const getSelectionStyle = () => {
    if (!startPos || !currentPos) return {};
    
    return {
      left: Math.min(startPos.x, currentPos.x),
      top: Math.min(startPos.y, currentPos.y),
      width: Math.abs(currentPos.x - startPos.x),
      height: Math.abs(currentPos.y - startPos.y)
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Select Design Area</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FontAwesomeIcon icon="fas fa-times" size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Click and drag to select the area you want to design on this map.
          </p>
          
          <div className="relative inline-block max-w-full max-h-[70vh] overflow-auto">
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Area Map"
              className="max-w-full h-auto cursor-crosshair select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => {
                setIsSelecting(false);
                setStartPos(null);
                setCurrentPos(null);
              }}
              draggable={false}
            />
            
            {isSelecting && startPos && currentPos && (
              <div
                className="absolute border-2 border-blue-500 bg-blue-200 bg-opacity-30 pointer-events-none"
                style={getSelectionStyle()}
              />
            )}
          </div>
          
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { ViewMode2D } from './ViewMode2D';
import { ViewMode3D } from './ViewMode3D';
import { BoothInfoPopup } from './BoothInfoPopup';
import { BoothElement } from '../../types/canvas';

interface FloorPlanPreviewProps {
  onClose: () => void;
}

export const FloorPlanPreview: React.FC<FloorPlanPreviewProps> = ({ onClose }) => {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [selectedBooth, setSelectedBooth] = useState<BoothElement | null>(null);
  const { elements, setViewerMode } = useCanvasStore();

  // Set viewer mode when component mounts and reset when unmounting
  useEffect(() => {
    setViewerMode(viewMode);
    return () => setViewerMode('editor');
  }, [viewMode, setViewerMode]);

  // Handle booth click
  const handleBoothClick = (boothId: string) => {
    const booth = elements.find(
      (element) => element.id === boothId && element.type === 'booth'
    ) as BoothElement | undefined;
    
    if (booth) {
      setSelectedBooth(booth);
    }
  };

  // Close booth info popup
  const closeBoothInfo = () => {
    setSelectedBooth(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 max-w-6xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Floor Plan Preview</h2>
          <div className="flex items-center space-x-4">
            {/* View mode toggle */}
            <div className="bg-gray-100 rounded-md p-1 flex">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  viewMode === '2d'
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setViewMode('2d')}
              >
                2D View
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  viewMode === '3d'
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setViewMode('3d')}
              >
                3D View
              </button>
            </div>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Preview content */}
        <div className="flex-1 overflow-hidden relative">
          {viewMode === '2d' ? (
            <ViewMode2D onBoothClick={handleBoothClick} />
          ) : (
            <ViewMode3D onBoothClick={handleBoothClick} />
          )}
          
          {/* Booth info popup */}
          {selectedBooth && (
            <BoothInfoPopup booth={selectedBooth} onClose={closeBoothInfo} />
          )}
        </div>
        
        {/* Footer with instructions */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          <p>
            {viewMode === '2d' 
              ? 'Click on any booth to view details. Use mouse wheel to zoom and drag to pan. Use the Path Mode to find routes between booths.' 
              : 'Click on any booth to view details. Use mouse to rotate the view and scroll to zoom. Use the Path Mode to find routes between booths.'}
          </p>
        </div>
      </div>
    </div>
  );
};
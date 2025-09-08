import React from 'react';
import { useFloorPlanViewerStore } from '../../store/floorPlanViewerStore';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';

export const ViewerControls: React.FC = () => {
  const { viewMode, setViewMode } = useFloorPlanViewerStore();
  
  // Get zoom controls from the canvas (set by FloorPlanCanvas)
  const zoomControls = (useFloorPlanViewerStore.getState() as any).zoomControls;

  const handleToggleView = () => {
    setViewMode(viewMode === '2d' ? '3d' : '2d');
  };

  const handleZoomIn = () => {
    zoomControls?.zoomIn();
  };

  const handleZoomOut = () => {
    zoomControls?.zoomOut();
  };

  const handleFitToScreen = () => {
    zoomControls?.fitToScreen();
  };

  return (
    <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-50">
      {/* View Mode Toggle */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <button
          onClick={handleToggleView}
          className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2
            ${viewMode === '3d' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          title={viewMode === '2d' ? 'Switch to 3D View' : 'Switch to 2D View'}
        >
          <FontAwesomeIcon 
            icon={viewMode === '2d' ? 'cube' : 'square'} 
            className="w-4 h-4" 
          />
          <span className="font-semibold">
            {viewMode === '2d' ? '3D' : '2D'}
          </span>
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
        <div className="flex flex-col gap-1">
          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 
              flex items-center justify-center transition-colors duration-200
              border border-gray-200 hover:border-gray-300"
            title="Zoom In"
          >
            <FontAwesomeIcon icon="plus" className="w-4 h-4 text-gray-600" />
          </button>
          
          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 
              flex items-center justify-center transition-colors duration-200
              border border-gray-200 hover:border-gray-300"
            title="Zoom Out"
          >
            <FontAwesomeIcon icon="minus" className="w-4 h-4 text-gray-600" />
          </button>
          
          {/* Fit to Screen */}
          <button
            onClick={handleFitToScreen}
            className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 
              flex items-center justify-center transition-colors duration-200
              border border-gray-200 hover:border-gray-300"
            title="Fit to Screen"
          >
            <FontAwesomeIcon icon="expand" className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Zoom Level Indicator */}
      {zoomControls?.currentZoom && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2">
          <div className="text-xs text-gray-500 text-center">
            {Math.round(zoomControls.currentZoom * 100)}%
          </div>
        </div>
      )}
    </div>
  );
};
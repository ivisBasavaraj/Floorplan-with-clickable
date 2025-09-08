import React from 'react';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';
import { useCanvasStore } from '../../store/canvasStore';

export const CanvasControls: React.FC = () => {
  const { zoom, grid, setZoom, setGrid } = useCanvasStore();
  
  const handleZoomIn = () => {
    setZoom(Math.min(zoom * 1.2, 4));
  };
  
  const handleZoomOut = () => {
    setZoom(Math.max(zoom / 1.2, 0.25));
  };
  
  const handleResetZoom = () => {
    setZoom(1);
  };
  
  const handleToggleGrid = () => {
    setGrid(!grid.enabled, grid.size, grid.snap);
  };
  
  const handleToggleSnap = () => {
    setGrid(grid.enabled, grid.size, !grid.snap);
  };
  
  const handleSave = () => {
    // Implementation for saving would go here
    console.log('Save floor plan');
  };
  
  const handleExport = () => {
    // Implementation for exporting would go here
    console.log('Export floor plan');
  };

  return (
    <div className="bg-white border border-gray-300 rounded-2xl p-4 flex items-center space-x-4 shadow-lg">
      <button
        onClick={handleZoomOut}
        className="w-12 h-12 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center text-gray-700 hover:text-gray-900 font-bold text-lg"
        title="Zoom Out"
      >
        –
      </button>
      
      <div className="px-4 min-w-20 text-center font-bold text-gray-800 text-lg">
        {Math.round(zoom * 100)}%
      </div>
      
      <button
        onClick={handleZoomIn}
        className="w-12 h-12 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center text-gray-700 hover:text-gray-900 font-bold text-lg"
        title="Zoom In"
      >
        +
      </button>
      
      <button
        onClick={handleResetZoom}
        className="w-12 h-12 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center text-gray-700 hover:text-gray-900"
        title="Reset Zoom"
      >
        <FontAwesomeIcon icon="fas fa-expand" size={20} />
      </button>
      
      <div className="w-px h-8 bg-gray-300 mx-2"></div>
      
      <button
        onClick={handleToggleGrid}
        className={`w-12 h-12 border border-gray-200 rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center ${
          grid.enabled ? 'bg-blue-100 text-blue-600 border-blue-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900'
        }`}
        title="Toggle Grid"
      >
        <FontAwesomeIcon icon="fas fa-th" size={20} />
      </button>
      
      <button
        onClick={handleToggleSnap}
        className={`w-12 h-12 border border-gray-200 rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center ${
          grid.snap ? 'bg-blue-100 text-blue-600 border-blue-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900'
        }`}
        title="Toggle Snap to Grid"
      >
        <FontAwesomeIcon icon="fas fa-magnet" size={20} />
      </button>
      
      <div className="w-px h-8 bg-gray-300 mx-2"></div>
      
      <button
        onClick={handleSave}
        className="w-12 h-12 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center text-gray-700 hover:text-gray-900"
        title="Save Floor Plan"
      >
        <FontAwesomeIcon icon="fas fa-save" size={20} />
      </button>
      
      <button
        onClick={handleExport}
        className="w-12 h-12 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center text-gray-700 hover:text-gray-900"
        title="Export Floor Plan"
      >
        <FontAwesomeIcon icon="fas fa-download" size={20} />
      </button>
    </div>
  );
};
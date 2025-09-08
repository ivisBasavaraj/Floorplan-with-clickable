import React from 'react';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';

interface ViewToggleProps {
  currentView: '2d' | '3d';
  onViewChange: (view: '2d' | '3d') => void;
  className?: string;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  currentView,
  onViewChange,
  className = ''
}) => {
  return (
    <div className={`flex bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      <button
        onClick={() => onViewChange('2d')}
        className={`flex items-center space-x-2 px-4 py-3 transition-all duration-200 ${
          currentView === '2d'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
        title="2D Floor Plan View"
      >
        <FontAwesomeIcon 
          icon="fas fa-map" 
          size={16} 
          className={currentView === '2d' ? 'text-white' : 'text-gray-500'} 
        />
        <span className="font-medium">2D View</span>
      </button>
      
      <div className="w-px bg-gray-200"></div>
      
      <button
        onClick={() => onViewChange('3d')}
        className={`flex items-center space-x-2 px-4 py-3 transition-all duration-200 ${
          currentView === '3d'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
        title="3D Interactive View"
      >
        <FontAwesomeIcon 
          icon="fas fa-cube" 
          size={16} 
          className={currentView === '3d' ? 'text-white' : 'text-gray-500'} 
        />
        <span className="font-medium">3D View</span>
      </button>
    </div>
  );
};
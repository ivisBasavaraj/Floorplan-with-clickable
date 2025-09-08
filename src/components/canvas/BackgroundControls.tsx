import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';
import { useCanvasStore } from '../../store/canvasStore';
import type { BackgroundFitMode } from '../../types/canvas';

export const BackgroundControls: React.FC = () => {
  const { 
    backgroundImage, 
    setBackgroundImage, 
    updateBackgroundImage, 
    removeBackgroundImage,
    flooring,
    setFlooringEnabled,
    setFlooringOpacity,
    grid
  } = useCanvasStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, SVG, PDF)');
      return;
    }
    
    // Create a URL for the file
    const url = URL.createObjectURL(file);
    
    // Set the background image
    setBackgroundImage({
      url,
      opacity: 1,
      fitMode: 'fit',
      locked: false,
      position: { x: 0, y: 0 },
      scale: 1,
      rotation: 0
    });
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const opacity = parseFloat(e.target.value);
    if (backgroundImage) {
      updateBackgroundImage({ opacity });
    }
  };
  
  const handleFitModeChange = (fitMode: BackgroundFitMode) => {
    if (backgroundImage) {
      updateBackgroundImage({ fitMode });
    }
  };
  
  const handleToggleLock = () => {
    if (backgroundImage) {
      updateBackgroundImage({ locked: !backgroundImage.locked });
    }
  };
  
  const handleRemoveBackground = () => {
    removeBackgroundImage();
  };
  
  const handleToggleFlooring = () => {
    setFlooringEnabled(!flooring?.enabled);
  };
  
  const handleFlooringOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const opacity = parseFloat(e.target.value);
    setFlooringOpacity(opacity);
  };
  
  return (
    <div className="absolute top-6 right-6 bg-white rounded-lg shadow-lg">
      <div className="p-2 flex items-center justify-between border-b">
        <h3 className="text-sm font-medium">Background & Flooring</h3>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-gray-100 rounded-md"
        >
          {isOpen ? '−' : '+'}
        </button>
      </div>
      
      {isOpen && (
        <div className="p-3 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Background</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1 hover:bg-gray-100 rounded-md text-blue-600"
                  title="Upload Background Image"
                >
                  <FontAwesomeIcon icon="fas fa-image" size={16} />
                </button>
                
                <button
                  onClick={() => {
                    setBackgroundImage({
                      url: 'MAP_BACKGROUND',
                      opacity: 1,
                      fitMode: 'stretch',
                      locked: false,
                      position: { x: 0, y: 0 },
                      scale: 1,
                      rotation: 0
                    });
                  }}
                  className="p-1 hover:bg-gray-100 rounded-md text-green-600"
                  title="Use Map as Background"
                >
                  <FontAwesomeIcon icon="fas fa-map" size={16} />
                </button>
                
                {backgroundImage && (
                  <>
                    <button
                      onClick={handleToggleLock}
                      className={`p-1 hover:bg-gray-100 rounded-md ${
                        backgroundImage.locked ? 'text-red-600' : 'text-green-600'
                      }`}
                      title={backgroundImage.locked ? 'Unlock Background' : 'Lock Background'}
                    >
                      {backgroundImage.locked ? <FontAwesomeIcon icon="fas fa-lock" size={16} /> : <FontAwesomeIcon icon="fas fa-unlock" size={16} />}
                    </button>
                    
                    <button
                      onClick={handleRemoveBackground}
                      className="p-1 hover:bg-gray-100 rounded-md text-red-600"
                      title="Remove Background"
                    >
                      <FontAwesomeIcon icon="fas fa-trash" size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/jpeg,image/png,image/svg+xml,application/pdf"
              className="hidden"
            />
            
            {backgroundImage && (
              <>
                {backgroundImage.url === 'MAP_BACKGROUND' && (
                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                    📍 Map background active
                  </div>
                )}
                
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Opacity</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={backgroundImage.opacity}
                    onChange={handleOpacityChange}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Fit Mode</label>
                  <div className="grid grid-cols-4 gap-1">
                    <button
                      onClick={() => handleFitModeChange('stretch')}
                      className={`p-1 text-xs rounded ${
                        backgroundImage.fitMode === 'stretch' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                      }`}
                    >
                      Stretch
                    </button>
                    <button
                      onClick={() => handleFitModeChange('fit')}
                      className={`p-1 text-xs rounded ${
                        backgroundImage.fitMode === 'fit' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                      }`}
                    >
                      Fit
                    </button>
                    <button
                      onClick={() => handleFitModeChange('tile')}
                      className={`p-1 text-xs rounded ${
                        backgroundImage.fitMode === 'tile' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                      }`}
                    >
                      Tile
                    </button>
                    <button
                      onClick={() => handleFitModeChange('center')}
                      className={`p-1 text-xs rounded ${
                        backgroundImage.fitMode === 'center' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                      }`}
                    >
                      Center
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Flooring Layer</span>
              <button
                onClick={handleToggleFlooring}
                className={`p-1 rounded-md ${
                  flooring?.enabled ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
                title={flooring?.enabled ? 'Hide Flooring' : 'Show Flooring'}
              >
                <FontAwesomeIcon icon="fas fa-layer-group" size={16} />
              </button>
            </div>
            
            {flooring?.enabled && (
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Opacity</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={flooring.opacity}
                  onChange={handleFlooringOpacityChange}
                  className="w-full"
                />
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Grid</span>
              <div className="flex space-x-1">
                <button
                  className={`p-1 rounded-md ${
                    grid.enabled ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                  }`}
                  title={grid.enabled ? 'Hide Grid' : 'Show Grid'}
                >
                  <FontAwesomeIcon icon="fas fa-th" size={16} />
                </button>
              </div>
            </div>
            
            {grid.enabled && (
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Opacity</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={grid.opacity}
                  onChange={(e) => useCanvasStore.getState().setGrid(
                    grid.enabled, 
                    grid.size, 
                    grid.snap, 
                    parseFloat(e.target.value)
                  )}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
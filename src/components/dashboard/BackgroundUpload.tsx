import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';
import { useCanvasStore } from '../../store/canvasStore';
import { uploadAndDetect } from '../detectionGlue.js';
import { CSVUpload } from './CSVUpload';
import type { BackgroundFitMode } from '../../types/canvas';

interface BoothData {
  boothNo: string;
  boothName: string;
  owner: string;
  size: string;
  otherDetails: string;
}

interface BackgroundUploadProps {
  onClose?: () => void;
}

export const BackgroundUpload: React.FC<BackgroundUploadProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { 
    backgroundImage, 
    setBackgroundImage, 
    updateBackgroundImage, 
    removeBackgroundImage,
    resetCanvas
  } = useCanvasStore();
  
  const [localBackgroundImage, setLocalBackgroundImage] = useState(backgroundImage);
  const [isUploading, setIsUploading] = useState(false);
  const [boothData, setBoothData] = useState<Record<string, BoothData>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleCSVDataParsed = (data: Record<string, BoothData>) => {
    setBoothData(data);
    // Store in global state or localStorage for access across components
    localStorage.setItem('boothData', JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('booth-data-loaded', { detail: data }));
  };
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, SVG, PDF)');
      return;
    }
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload to server and run detection
      const serverFilename = await uploadAndDetect(file);
      
      // Create server URL for the uploaded file
      const serverUrl = `http://localhost:5000/uploads/${serverFilename}`;
      
      // Set the local background image state with server URL
      const newBackgroundImage = {
        url: serverUrl,
        opacity: 1,
        fitMode: 'fit' as BackgroundFitMode,
        locked: false,
        position: { x: 0, y: 0 },
        scale: 1,
        rotation: 0
      };
      
      setLocalBackgroundImage(newBackgroundImage);
    } catch (error) {
      console.error('Error uploading background image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleSave = () => {
    if (localBackgroundImage) {
      // Set the background image in the canvas store
      setBackgroundImage(localBackgroundImage);
      
      // Reset the canvas to ensure it's clean for the new floor plan
      resetCanvas();
      
      // Navigate to the admin floor plan editor
      navigate('/admin/floor-plans/new');
    } else {
      // If no background image, just close the modal
      onClose?.();
    }
  };
  
  const handleCancel = () => {
    setLocalBackgroundImage(backgroundImage);
    onClose?.();
  };
  
  const handleRemoveBackground = () => {
    setLocalBackgroundImage(undefined);
  };
  
  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const opacity = parseFloat(e.target.value);
    if (localBackgroundImage) {
      setLocalBackgroundImage({ ...localBackgroundImage, opacity });
    }
  };
  
  const handleFitModeChange = (fitMode: BackgroundFitMode) => {
    if (localBackgroundImage) {
      setLocalBackgroundImage({ ...localBackgroundImage, fitMode });
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <FontAwesomeIcon icon="fas fa-image" className="text-blue-600 mr-2" size={20} />
          <h3 className="text-lg font-semibold">Default Background Image</h3>
        </div>
        {onClose && (
          <button 
            onClick={handleCancel}
            className="p-1 hover:bg-gray-100 rounded-md text-gray-500"
          >
            <FontAwesomeIcon icon="fas fa-times" size={20} />
          </button>
        )}
      </div>
      
      <div className="p-4 space-y-4">
        <p className="text-sm text-gray-600">
          Upload a background image and automatically navigate to create a new floor plan with this background applied.
        </p>
        
        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {localBackgroundImage ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center">
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src={localBackgroundImage.url} 
                    alt="Background preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600">Background image uploaded</p>
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
                >
                  Change Image
                </button>
                <button
                  onClick={handleRemoveBackground}
                  className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <FontAwesomeIcon icon="fas fa-upload" className="mx-auto text-gray-400" size={48} />
              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 flex items-center mx-auto"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon="fas fa-upload" size={16} className="mr-2" />
                      Upload Background Image
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Supports JPG, PNG, SVG, PDF (max 10MB)
                </p>
              </div>
            </div>
          )}
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/jpeg,image/png,image/svg+xml,application/pdf"
          className="hidden"
        />
        
        {/* Settings Section */}
        {localBackgroundImage && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon="fas fa-cog" size={16} className="text-gray-600 mr-2" />
              <h4 className="text-sm font-medium">Background Settings</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Opacity</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={localBackgroundImage.opacity}
                  onChange={handleOpacityChange}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 text-center">
                  {Math.round(localBackgroundImage.opacity * 100)}%
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Fit Mode</label>
                <div className="grid grid-cols-2 gap-1">
                  {(['stretch', 'fit', 'tile', 'center'] as BackgroundFitMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleFitModeChange(mode)}
                      className={`px-2 py-1 text-xs rounded capitalize ${
                        localBackgroundImage.fitMode === mode 
                          ? 'bg-blue-100 text-blue-600 border border-blue-300' 
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* CSV Upload Section */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <CSVUpload onDataParsed={handleCSVDataParsed} />
          {Object.keys(boothData).length > 0 && (
            <div className="mt-2 text-sm text-green-600">
              ✓ {Object.keys(boothData).length} booth records loaded
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        {onClose && (
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
            >
              <FontAwesomeIcon icon="fas fa-check" size={16} className="mr-2" />
              {localBackgroundImage ? 'Set Background & Create Floor Plan' : 'Continue'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
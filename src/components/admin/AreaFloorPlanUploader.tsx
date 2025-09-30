import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';
import { hierarchicalAPI } from '../../services/api';
import { HallDetectionPreview } from './HallDetectionPreview';

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

interface AreaPlan {
  id: string;
  name: string;
  description: string;
  image_url: string;
  detected_halls: DetectedHall[];
  created_at: string;
  status: string;
}

interface AreaFloorPlanUploaderProps {
  onAreaPlanCreated?: (areaPlan: AreaPlan) => void;
  onClose?: () => void;
}

export const AreaFloorPlanUploader: React.FC<AreaFloorPlanUploaderProps> = ({
  onAreaPlanCreated,
  onClose
}) => {
  const [uploading, setUploading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [uploadedAreaPlan, setUploadedAreaPlan] = useState<AreaPlan | null>(null);
  const [selectedHall, setSelectedHall] = useState<DetectedHall | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, PNG, GIF, BMP, WEBP)');
      return;
    }

    // Validate file size (max 50MB for large floor plans)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setUploading(true);
    setDetecting(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', `BIEC Area Plan ${new Date().toLocaleDateString()}`);
      formData.append('description', 'BIEC Exhibition Center area floor plan with automatic hall detection');

      const result = await hierarchicalAPI.uploadAreaPlan(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        const areaPlan = result.data.area_plan;
        setUploadedAreaPlan(areaPlan);
        onAreaPlanCreated?.(areaPlan);
        
        // Show success message
        setTimeout(() => {
          setDetecting(false);
        }, 1000);
      } else {
        setError(result.data.message || 'Upload and detection failed');
        setDetecting(false);
      }
    } catch (error) {
      setError('Upload failed. Please check your connection and try again.');
      setDetecting(false);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleHallSelect = (hall: DetectedHall) => {
    setSelectedHall(hall);
  };

  const handleHallUpload = async (hallId: string, file: File) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', `${selectedHall?.name || 'Hall'} Floor Plan`);
      formData.append('description', `Detailed floor plan for ${selectedHall?.name || 'hall'}`);
      if (uploadedAreaPlan) {
        formData.append('area_plan_id', uploadedAreaPlan.id);
      }

      const result = await hierarchicalAPI.uploadHallPlan(hallId, formData);

      if (result.success) {
        // Success feedback
        alert(`Hall floor plan uploaded successfully for ${selectedHall?.name}!`);
        setSelectedHall(null);
      } else {
        setError(result.data.message || 'Hall upload failed');
      }
    } catch (error) {
      setError('Hall upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Area Floor Plan Upload & Detection</h2>
              <p className="text-gray-600 mt-1">
                Upload BIEC area floor plan for automatic hall detection and management
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon="fas fa-times" size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <FontAwesomeIcon icon="fas fa-exclamation-triangle" className="text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {!uploadedAreaPlan ? (
            /* Upload Section */
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                {detecting ? (
                  <div className="space-y-6">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FontAwesomeIcon icon="fas fa-search" size={24} className="text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Area Floor Plan</h3>
                      <p className="text-gray-600 mb-4">
                        Analyzing image and detecting hall structures...
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div 
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Detection Process:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>✓ Uploading image to server</li>
                        <li>✓ Analyzing color regions</li>
                        <li>✓ Detecting hall boundaries</li>
                        <li>✓ Identifying booth structures</li>
                        <li>✓ Creating interactive elements</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <FontAwesomeIcon icon="fas fa-upload" className="mx-auto text-gray-400" size={64} />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Upload BIEC Area Floor Plan
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Upload the main area floor plan image. Our advanced detection system will automatically identify all halls and colored booth structures.
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                      >
                        {uploading ? 'Uploading...' : 'Select Area Floor Plan Image'}
                      </button>
                      <p className="text-sm text-gray-500 mt-3">
                        Supports JPG, PNG, GIF, BMP, WEBP (max 50MB)
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Detection Features:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon="fas fa-palette" className="text-blue-500 mr-2" />
                          <span>Multi-color booth detection</span>
                        </div>
                        <div className="flex items-center">
                          <FontAwesomeIcon icon="fas fa-vector-square" className="text-green-500 mr-2" />
                          <span>Precise geometric accuracy</span>
                        </div>
                        <div className="flex items-center">
                          <FontAwesomeIcon icon="fas fa-building" className="text-purple-500 mr-2" />
                          <span>Automatic hall identification</span>
                        </div>
                        <div className="flex items-center">
                          <FontAwesomeIcon icon="fas fa-mouse-pointer" className="text-orange-500 mr-2" />
                          <span>Interactive hall management</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          ) : (
            /* Detection Results */
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FontAwesomeIcon icon="fas fa-check-circle" className="text-green-500 mr-3" size={20} />
                  <div>
                    <h3 className="font-medium text-green-800">Area Floor Plan Processed Successfully!</h3>
                    <p className="text-green-700 text-sm mt-1">
                      Detected {uploadedAreaPlan.detected_halls.length} halls with {uploadedAreaPlan.detected_halls.reduce((total, hall) => total + (hall.area || 0), 0).toLocaleString()} total area
                    </p>
                  </div>
                </div>
              </div>

              {/* Hall Detection Preview */}
              <HallDetectionPreview
                imageUrl={`http://localhost:5000${uploadedAreaPlan.image_url}`}
                detectedHalls={uploadedAreaPlan.detected_halls}
                onHallSelect={handleHallSelect}
                selectedHallId={selectedHall?.id}
              />

              {/* Hall Management Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Next Steps - Hall Management:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Click on any detected hall in the preview above</li>
                  <li>Upload a detailed floor plan specific to that hall</li>
                  <li>System will detect booths within the hall floor plan</li>
                  <li>Manage individual hall floor plans independently</li>
                </ol>
              </div>

              {/* Hall Upload Modal */}
              {selectedHall && (
                <HallUploadModal
                  hall={selectedHall}
                  onUpload={(file) => handleHallUpload(selectedHall.id, file)}
                  onClose={() => setSelectedHall(null)}
                  uploading={uploading}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {uploadedAreaPlan ? (
                `Area plan "${uploadedAreaPlan.name}" ready for hall management`
              ) : (
                'Upload your BIEC area floor plan to begin automatic hall detection'
              )}
            </div>
            <div className="flex space-x-3">
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {uploadedAreaPlan ? 'Close' : 'Cancel'}
                </button>
              )}
              {uploadedAreaPlan && (
                <button
                  onClick={() => {
                    // Navigate to hall management interface
                    window.location.href = '/admin/hall-management';
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                >
                  Manage Halls
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface HallUploadModalProps {
  hall: DetectedHall;
  onUpload: (file: File) => void;
  onClose: () => void;
  uploading: boolean;
}

const HallUploadModal: React.FC<HallUploadModalProps> = ({
  hall,
  onUpload,
  onClose,
  uploading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Upload Floor Plan for {hall.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FontAwesomeIcon icon="fas fa-times" size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Hall Information:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Area: {hall.area.toLocaleString()} px²</div>
                <div>Confidence: {(hall.confidence * 100).toFixed(1)}%</div>
                <div>Detection: {hall.detection_method.replace('_', ' ')}</div>
                <div>Size: {hall.bounds.width} × {hall.bounds.height}</div>
              </div>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {uploading ? (
                <div className="space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600">Uploading and detecting booths...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <FontAwesomeIcon icon="fas fa-upload" className="text-gray-400" size={32} />
                  <div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    >
                      Select Hall Floor Plan
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      Upload detailed floor plan for this hall
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';
import { hierarchicalAPI } from '../../services/api';

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

interface HallPlan {
  id: string;
  name: string;
  hall_id: string;
  image_url: string;
  booth_detection: any;
  created_at: string;
  status: string;
}

interface HierarchicalUploaderProps {
  onClose?: () => void;
}

export const HierarchicalUploader: React.FC<HierarchicalUploaderProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState<'area' | 'halls'>('area');
  const [areaPlans, setAreaPlans] = useState<AreaPlan[]>([]);
  const [selectedAreaPlan, setSelectedAreaPlan] = useState<AreaPlan | null>(null);
  const [hallPlans, setHallPlans] = useState<Record<string, HallPlan[]>>({});
  const [uploading, setUploading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const areaFileInputRef = useRef<HTMLInputElement>(null);
  const hallFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedHallForUpload, setSelectedHallForUpload] = useState<string | null>(null);

  React.useEffect(() => {
    loadAreaPlans();
  }, []);

  const loadAreaPlans = async () => {
    try {
      const result = await hierarchicalAPI.getAreaPlans();
      if (result.success) {
        setAreaPlans(result.data.area_plans || []);
      }
    } catch (error) {
      console.error('Failed to load area plans:', error);
    }
  };

  const loadHallPlans = async (hallId: string) => {
    try {
      const result = await hierarchicalAPI.getHallPlans(hallId);
      if (result.success) {
        setHallPlans(prev => ({
          ...prev,
          [hallId]: result.data.hall_plans || []
        }));
      }
    } catch (error) {
      console.error('Failed to load hall plans:', error);
    }
  };

  const handleAreaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setDetecting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', `Area Plan ${new Date().toLocaleDateString()}`);
      formData.append('description', 'Main area floor plan with automatic hall detection');

      const result = await hierarchicalAPI.uploadAreaPlan(formData);

      if (result.success) {
        const newAreaPlan = result.data.area_plan;
        setAreaPlans(prev => [newAreaPlan, ...prev]);
        setSelectedAreaPlan(newAreaPlan);
        setCurrentStep('halls');
      } else {
        setError(result.data.message || 'Upload failed');
      }
    } catch (error) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setDetecting(false);
      if (areaFileInputRef.current) {
        areaFileInputRef.current.value = '';
      }
    }
  };

  const handleHallUpload = async (hallId: string, file: File) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', `Hall Floor Plan`);
      formData.append('description', `Detailed floor plan for hall ${hallId}`);
      if (selectedAreaPlan) {
        formData.append('area_plan_id', selectedAreaPlan.id);
      }

      const result = await hierarchicalAPI.uploadHallPlan(hallId, formData);

      if (result.success) {
        // Reload hall plans for this hall
        await loadHallPlans(hallId);
      } else {
        setError(result.data.message || 'Hall upload failed');
      }
    } catch (error) {
      setError('Hall upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (hallFileInputRef.current) {
        hallFileInputRef.current.value = '';
      }
    }
  };

  const handleHallFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedHallForUpload) return;

    handleHallUpload(selectedHallForUpload, file);
    setSelectedHallForUpload(null);
  };

  const selectAreaPlan = (plan: AreaPlan) => {
    setSelectedAreaPlan(plan);
    setCurrentStep('halls');
    
    // Load hall plans for all detected halls
    plan.detected_halls.forEach(hall => {
      loadHallPlans(hall.id);
    });
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Hierarchical Floor Plan Upload</h2>
              <p className="text-gray-600 mt-1">
                Upload area floor plans and assign detailed hall floor plans
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
          
          {/* Step Indicator */}
          <div className="flex items-center mt-6">
            <div className={`flex items-center ${currentStep === 'area' ? 'text-blue-600' : 'text-green-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'area' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
              }`}>
                {currentStep === 'area' ? '1' : <FontAwesomeIcon icon="fas fa-check" size={14} />}
              </div>
              <span className="ml-2 font-medium">Area Floor Plan</span>
            </div>
            <div className="flex-1 h-px bg-gray-300 mx-4"></div>
            <div className={`flex items-center ${currentStep === 'halls' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'halls' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Hall Floor Plans</span>
            </div>
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

          {currentStep === 'area' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Step 1: Upload Area Floor Plan
                </h3>
                <p className="text-gray-600 mb-4">
                  Upload the main area floor plan. Our system will automatically detect individual halls.
                </p>
                
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {detecting ? (
                    <div className="space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <div>
                        <p className="text-lg font-medium text-gray-900">Detecting Halls...</p>
                        <p className="text-gray-600">Analyzing floor plan and identifying hall spaces</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <FontAwesomeIcon icon="fas fa-upload" className="mx-auto text-gray-400" size={48} />
                      <div>
                        <button
                          onClick={() => areaFileInputRef.current?.click()}
                          disabled={uploading}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                        >
                          {uploading ? 'Uploading...' : 'Upload Area Floor Plan'}
                        </button>
                        <p className="text-sm text-gray-500 mt-2">
                          Supports JPG, PNG, GIF, BMP, WEBP (max 10MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <input
                  type="file"
                  ref={areaFileInputRef}
                  onChange={handleAreaUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Existing Area Plans */}
              {areaPlans.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">
                    Or select an existing area plan:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {areaPlans.map((plan) => (
                      <div
                        key={plan.id}
                        onClick={() => selectAreaPlan(plan)}
                        className="cursor-pointer border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all"
                      >
                        <div className="aspect-video bg-gray-100 rounded mb-3 overflow-hidden">
                          <img
                            src={`http://localhost:5000${plan.image_url}`}
                            alt={plan.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h5 className="font-medium text-gray-900">{plan.name}</h5>
                        <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {plan.detected_halls.length} halls detected
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            plan.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {plan.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 'halls' && selectedAreaPlan && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Step 2: Upload Hall Floor Plans
                  </h3>
                  <p className="text-gray-600">
                    Upload detailed floor plans for each detected hall in "{selectedAreaPlan.name}"
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep('area')}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Back to Area Plans
                </button>
              </div>

              {/* Area Plan Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-16 bg-gray-200 rounded overflow-hidden">
                    <img
                      src={`http://localhost:5000${selectedAreaPlan.image_url}`}
                      alt={selectedAreaPlan.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedAreaPlan.name}</h4>
                    <p className="text-sm text-gray-600">{selectedAreaPlan.detected_halls.length} halls detected</p>
                  </div>
                </div>
              </div>

              {/* Detected Halls */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedAreaPlan.detected_halls.map((hall) => (
                  <div key={hall.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900">{hall.name}</h5>
                      <span className={`text-xs px-2 py-1 rounded-full ${getDetectionMethodColor(hall.detection_method)}`}>
                        {hall.detection_method.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div>Area: {hall.area.toLocaleString()} px²</div>
                      <div>Confidence: {(hall.confidence * 100).toFixed(1)}%</div>
                      <div>Size: {hall.bounds.width} × {hall.bounds.height}</div>
                    </div>

                    {/* Hall Plans */}
                    <div className="space-y-2">
                      {hallPlans[hall.id]?.map((plan) => (
                        <div key={plan.id} className="bg-green-50 border border-green-200 rounded p-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-800">{plan.name}</span>
                            <span className="text-xs text-green-600">
                              {plan.booth_detection?.detection_count || 0} booths
                            </span>
                          </div>
                        </div>
                      )) || []}
                      
                      {/* Upload Button */}
                      <button
                        onClick={() => {
                          setSelectedHallForUpload(hall.id);
                          hallFileInputRef.current?.click();
                        }}
                        disabled={uploading}
                        className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50"
                      >
                        <FontAwesomeIcon icon="fas fa-plus" className="mr-2" />
                        {uploading && selectedHallForUpload === hall.id ? 'Uploading...' : 'Upload Hall Plan'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <input
                type="file"
                ref={hallFileInputRef}
                onChange={handleHallFileSelect}
                accept="image/*"
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {currentStep === 'area' ? (
                'Upload your main area floor plan to automatically detect halls'
              ) : (
                `${selectedAreaPlan?.detected_halls.length || 0} halls detected. Upload detailed floor plans for each hall.`
              )}
            </div>
            <div className="flex space-x-3">
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              )}
              {currentStep === 'halls' && (
                <button
                  onClick={() => {
                    // Publish area plan and navigate to management
                    onClose?.();
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                >
                  Complete Setup
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
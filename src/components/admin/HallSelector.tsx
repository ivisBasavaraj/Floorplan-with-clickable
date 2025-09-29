import React, { useState, useEffect } from 'react';
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
  state?: any;
}

interface HallSelectorProps {
  onHallPlanSelect: (hallPlan: HallPlan) => void;
  onClose: () => void;
}

export const HallSelector: React.FC<HallSelectorProps> = ({
  onHallPlanSelect,
  onClose
}) => {
  const [areaPlans, setAreaPlans] = useState<AreaPlan[]>([]);
  const [selectedAreaPlan, setSelectedAreaPlan] = useState<AreaPlan | null>(null);
  const [hallPlans, setHallPlans] = useState<Record<string, HallPlan[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAreaPlans();
  }, []);

  const loadAreaPlans = async () => {
    try {
      setLoading(true);
      const result = await hierarchicalAPI.getPublicAreaPlans();
      
      if (result.success) {
        const plans = result.data.area_plans || [];
        setAreaPlans(plans);
        
        if (plans.length > 0) {
          setSelectedAreaPlan(plans[0]);
          await loadHallPlansForArea(plans[0]);
        }
      } else {
        setError('Failed to load area plans');
      }
    } catch (error) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const loadHallPlansForArea = async (areaPlan: AreaPlan) => {
    try {
      const hallPlansData: Record<string, HallPlan[]> = {};
      
      for (const hall of areaPlan.detected_halls) {
        const result = await hierarchicalAPI.getPublicHallPlans(hall.id);
        if (result.success) {
          hallPlansData[hall.id] = result.data.hall_plans || [];
        }
      }
      
      setHallPlans(hallPlansData);
    } catch (error) {
      console.error('Failed to load hall plans:', error);
    }
  };

  const selectAreaPlan = async (plan: AreaPlan) => {
    setSelectedAreaPlan(plan);
    await loadHallPlansForArea(plan);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hall floor plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Select Hall Floor Plan</h2>
              <p className="text-gray-600 mt-1">
                Choose an area and hall to view the detailed floor plan
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FontAwesomeIcon icon="fas fa-times" size={24} />
            </button>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Area Plans */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Exhibition Areas</h3>
              
              <div className="space-y-3">
                {areaPlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => selectAreaPlan(plan)}
                    className={`cursor-pointer border rounded-lg p-4 transition-all ${
                      selectedAreaPlan?.id === plan.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden">
                        <img
                          src={`http://localhost:5000${plan.image_url}`}
                          alt={plan.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{plan.name}</h4>
                        <p className="text-sm text-gray-600">{plan.description}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">
                            {plan.detected_halls.length} halls
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            plan.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {plan.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hall Plans */}
            {selectedAreaPlan && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Halls in {selectedAreaPlan.name}
                </h3>
                
                <div className="space-y-4">
                  {selectedAreaPlan.detected_halls.map((hall) => (
                    <div key={hall.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{hall.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${getDetectionMethodColor(hall.detection_method)}`}>
                          {(hall.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        Size: {hall.bounds.width} × {hall.bounds.height} px
                      </div>

                      {/* Hall Plans for this hall */}
                      <div className="space-y-2">
                        {hallPlans[hall.id]?.map((plan) => (
                          <div
                            key={plan.id}
                            onClick={() => onHallPlanSelect(plan)}
                            className="cursor-pointer bg-blue-50 border border-blue-200 rounded p-3 hover:bg-blue-100 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-blue-900">{plan.name}</h5>
                                <p className="text-sm text-blue-700">
                                  {plan.booth_detection?.detection_count || 0} booths detected
                                </p>
                              </div>
                              <FontAwesomeIcon icon="fas fa-arrow-right" className="text-blue-600" />
                            </div>
                          </div>
                        )) || []}
                        
                        {(!hallPlans[hall.id] || hallPlans[hall.id].length === 0) && (
                          <div className="text-center text-gray-500 py-4 border-2 border-dashed border-gray-300 rounded">
                            <FontAwesomeIcon icon="fas fa-upload" className="mb-2" />
                            <p className="text-sm">No floor plan available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Select a hall floor plan to view detailed booth layouts
            </div>
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
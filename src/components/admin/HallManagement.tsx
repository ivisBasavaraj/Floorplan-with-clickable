import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';
import { hierarchicalAPI } from '../../services/api';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
}

interface HallManagementProps {
  onClose?: () => void;
}

export const HallManagement: React.FC<HallManagementProps> = ({ onClose }) => {
  const [areaPlans, setAreaPlans] = useState<AreaPlan[]>([]);
  const [selectedAreaPlan, setSelectedAreaPlan] = useState<AreaPlan | null>(null);
  const [hallPlans, setHallPlans] = useState<Record<string, HallPlan[]>>({});
  const [unassignedPlans, setUnassignedPlans] = useState<HallPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load area plans
      const areaResult = await hierarchicalAPI.getAreaPlans();
      if (areaResult.success) {
        const plans = areaResult.data.area_plans || [];
        setAreaPlans(plans);
        
        if (plans.length > 0) {
          setSelectedAreaPlan(plans[0]);
          await loadHallPlansForArea(plans[0]);
        }
      }
    } catch (error) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadHallPlansForArea = async (areaPlan: AreaPlan) => {
    try {
      const hallPlansData: Record<string, HallPlan[]> = {};
      
      // Load plans for each detected hall
      for (const hall of areaPlan.detected_halls) {
        const result = await hierarchicalAPI.getHallPlans(hall.id);
        if (result.success) {
          hallPlansData[hall.id] = result.data.hall_plans || [];
        }
      }
      
      setHallPlans(hallPlansData);
    } catch (error) {
      console.error('Failed to load hall plans:', error);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    // If dropped in the same location, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    try {
      // Handle assignment to hall
      if (destination.droppableId.startsWith('hall-')) {
        const hallId = destination.droppableId.replace('hall-', '');
        await hierarchicalAPI.assignPlanToHall(hallId, draggableId);
        
        // Reload data
        if (selectedAreaPlan) {
          await loadHallPlansForArea(selectedAreaPlan);
        }
      }
    } catch (error) {
      setError('Failed to assign plan to hall');
    }
  };

  const publishAreaPlan = async (planId: string) => {
    try {
      // Implementation would update area plan status to published
      console.log('Publishing area plan:', planId);
      await loadData(); // Reload data
    } catch (error) {
      setError('Failed to publish area plan');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hall management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Hall Management</h2>
              <p className="text-gray-600 mt-1">
                Manage area floor plans and assign hall-specific floor plans
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Area Plans List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Area Floor Plans</h3>
              
              {areaPlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => {
                    setSelectedAreaPlan(plan);
                    loadHallPlansForArea(plan);
                  }}
                  className={`cursor-pointer border rounded-lg p-4 transition-all ${
                    selectedAreaPlan?.id === plan.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{plan.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      plan.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {plan.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {plan.detected_halls.length} halls detected
                    </span>
                    {plan.status === 'draft' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          publishAreaPlan(plan.id);
                        }}
                        className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Publish
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Hall Assignment Interface */}
            {selectedAreaPlan && (
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Hall Floor Plan Assignment
                  </h3>
                  <div className="text-sm text-gray-600">
                    Drag and drop to assign plans to halls
                  </div>
                </div>

                <DragDropContext onDragEnd={handleDragEnd}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedAreaPlan.detected_halls.map((hall) => (
                      <div key={hall.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{hall.name}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {hall.bounds.width} × {hall.bounds.height}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getDetectionMethodColor(hall.detection_method)}`}>
                              {(hall.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        <Droppable droppableId={`hall-${hall.id}`}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`min-h-32 border-2 border-dashed rounded-lg p-3 transition-colors ${
                                snapshot.isDraggingOver
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-300 bg-gray-50'
                              }`}
                            >
                              {hallPlans[hall.id]?.map((plan, index) => (
                                <Draggable key={plan.id} draggableId={plan.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`bg-white border border-gray-200 rounded p-2 mb-2 ${
                                        snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{plan.name}</span>
                                        <span className="text-xs text-gray-500">
                                          {plan.booth_detection?.detection_count || 0} booths
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              )) || []}
                              
                              {(!hallPlans[hall.id] || hallPlans[hall.id].length === 0) && (
                                <div className="text-center text-gray-500 py-4">
                                  <FontAwesomeIcon icon="fas fa-upload" className="mb-2" />
                                  <p className="text-sm">No floor plan assigned</p>
                                  <p className="text-xs">Drag a plan here or upload new</p>
                                </div>
                              )}
                              
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    ))}
                  </div>
                </DragDropContext>
              </div>
            )}
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
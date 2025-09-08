import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '../components/icons/FontAwesomeIcon';
import { useAuthStore } from '../store/authStore';
import { publicFloorPlanAPI } from '../services/api';

interface FloorPlan {
  id: string;
  name: string;
  description?: string;
  created: string;
  last_modified: string;
  status: string;
  stats?: {
    total_booths: number;
    sold: number;
    available: number;
    reserved: number;
  };
}

export const UserFloorPlanList: React.FC = () => {
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    loadPublicFloorPlans();
  }, []);

  const loadPublicFloorPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await publicFloorPlanAPI.getPublicFloorPlans();
      
      if (result.success) {
        setFloorPlans(result.data.floorplans || []);
      } else {
        setError(result.data.message || 'Failed to load floor plans');
      }
    } catch (error) {
      console.error('Failed to load floor plans:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading floor plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon="fas fa-exclamation-triangle" size={48} className="text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadPublicFloorPlans}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Available Floor Plans</h1>
              <p className="text-gray-600 mt-1">Explore interactive 2D and 3D floor plans</p>
            </div>
            {user && (
              <div className="text-sm text-gray-500">
                Welcome, {user.name}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {floorPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {floorPlans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon="fas fa-map" size={24} className="text-blue-500 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    </div>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {plan.status}
                    </span>
                  </div>
                  
                  {plan.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{plan.description}</p>
                  )}
                  
                  {plan.stats && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Booth Occupancy</span>
                        <span>{plan.stats.sold} / {plan.stats.total_booths}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: plan.stats.total_booths > 0 
                              ? `${(plan.stats.sold / plan.stats.total_booths) * 100}%` 
                              : '0%' 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Available: {plan.stats.available}</span>
                        <span>Reserved: {plan.stats.reserved}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 mb-4">
                    Last updated: {new Date(plan.last_modified).toLocaleDateString('en-US')}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link 
                      to={`/viewer/${plan.id}?mode=2d`}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                    >
                      <FontAwesomeIcon icon="fas fa-eye" size={14} className="mr-2" />
                      2D View
                    </Link>
                    <Link 
                      to={`/viewer/${plan.id}?mode=3d`}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors"
                    >
                      <FontAwesomeIcon icon="fas fa-cube" size={14} className="mr-2" />
                      3D View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FontAwesomeIcon icon="fas fa-map" size={64} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Floor Plans Available</h3>
            <p className="text-gray-600">There are currently no published floor plans to view.</p>
          </div>
        )}
      </div>
    </div>
  );
};
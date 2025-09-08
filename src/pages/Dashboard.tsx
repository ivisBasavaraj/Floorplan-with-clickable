import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '../components/icons/FontAwesomeIcon';
import { BackgroundUpload } from '../components/dashboard/BackgroundUpload';
import { FloorPlanManager } from '../components/dashboard/FloorPlanManager';
import { useAuthStore } from '../store/authStore';
import { floorPlanAPI } from '../services/api';

export const Dashboard: React.FC = () => {
  const [showBackgroundUpload, setShowBackgroundUpload] = useState(false);
  const [showFloorPlanManager, setShowFloorPlanManager] = useState(false);
  const [recentFloorPlans, setRecentFloorPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    exhibitors: '0',
    upcomingEvents: '0',
    occupancyRate: '0%'
  });
  const { user } = useAuthStore();

  // Redirect non-admin users to floor plans viewer
  if (user && user.role !== 'admin') {
    return <Navigate to="/floor-plans" replace />;
  }

  useEffect(() => {
    loadRecentFloorPlans();
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Load actual statistics from backend
      const floorPlansResult = await floorPlanAPI.getFloorPlans();

      let totalFloorPlans = 0;
      let totalBooths = 0;
      let occupiedBooths = 0;

      if (floorPlansResult.success && floorPlansResult.data.floorplans) {
        totalFloorPlans = floorPlansResult.data.floorplans.length;
        
        // Calculate booth statistics from floor plans
        floorPlansResult.data.floorplans.forEach((plan: any) => {
          if (plan.stats) {
            totalBooths += plan.stats.total_booths || 0;
            occupiedBooths += plan.stats.sold || 0;
          }
        });
        

      }

      const occupancyRate = totalBooths > 0 ? Math.round((occupiedBooths / totalBooths) * 100) : 0;
      
      setDashboardStats({
        exhibitors: occupiedBooths.toString(),
        upcomingEvents: totalFloorPlans.toString(),
        occupancyRate: `${occupancyRate}%`
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      // Keep default values on error
    }
  };

  const loadRecentFloorPlans = async () => {
    try {
      setLoading(true);
      const result = await floorPlanAPI.getFloorPlans({ limit: 5 });
      if (result.success) {
        // Admin can see all floor plans
        const floorplans = result.data.floorplans || [];

        setRecentFloorPlans(floorplans);
      } else {
        console.error('Failed to load floor plans:', result.data?.message);
        setRecentFloorPlans([]);
      }
    } catch (error) {
      console.error('Failed to load floor plans:', error);
      setRecentFloorPlans([]);
    } finally {
      setLoading(false);
    }
  };
  
  const stats = [
    { label: 'Exhibitors', value: dashboardStats.exhibitors, icon: <FontAwesomeIcon icon="fas fa-users" size={24} className="text-blue-500" /> },
    { label: 'Floor Plans', value: dashboardStats.upcomingEvents, icon: <FontAwesomeIcon icon="fas fa-map" size={24} className="text-purple-500" /> },
    { label: 'Occupancy Rate', value: dashboardStats.occupancyRate, icon: <FontAwesomeIcon icon="fas fa-chart-line" size={24} className="text-orange-500" /> }
  ];

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowFloorPlanManager(true)}
            className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
          >
            <FontAwesomeIcon icon="fas fa-database" size={18} className="mr-2" />
            Manage Floor Plans
          </button>
          
          <button 
            onClick={() => setShowBackgroundUpload(true)}
            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
          >
            <FontAwesomeIcon icon="fas fa-image" size={18} className="mr-2" />
            Quick Start with Background
          </button>
          
          <Link 
            to="/admin/floor-plans/new" 
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            <FontAwesomeIcon icon="fas fa-plus-circle" size={18} className="mr-2" />
            New Floor Plan
          </Link>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 flex items-center">
            <div className="rounded-full p-3 bg-gray-100 mr-4">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Recent floor plans */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Floor Plans</h2>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">Loading floor plans...</div>
          </div>
        ) : recentFloorPlans.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Floor Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Modified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booths
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentFloorPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon="fas fa-file-alt" size={18} className="text-blue-500 mr-2" />
                      <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      plan.status === 'published' ? 'bg-green-100 text-green-800' :
                      plan.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      plan.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {plan.status || 'draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(plan.last_modified).toLocaleDateString('en-US')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {plan.stats ? (
                        <>
                          <div className="font-medium">
                            {plan.stats.sold || 0} / {plan.stats.total_booths || 0}
                          </div>
                          <div className="text-xs text-gray-500 mb-1">
                            {plan.stats.available || 0} available, {plan.stats.reserved || 0} reserved
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{ 
                                width: plan.stats.total_booths > 0 
                                  ? `${((plan.stats.sold || 0) / plan.stats.total_booths) * 100}%` 
                                  : '0%' 
                              }}
                            ></div>
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-500 italic">No booths</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link to={`/admin/floor-plans/${plan.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-4">
                      Edit
                    </Link>
                    <Link to={`/viewer/${plan.id}`} className="text-blue-600 hover:text-blue-900">
                      Preview
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center">
            <div className="text-gray-500">
              No floor plans found. Create your first one!
            </div>
          </div>
        )}
      </div>
      
      {/* Recent activity */}
      <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Recent Activity</h2>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="rounded-full bg-blue-100 p-2 text-blue-600 mr-4">
              <FontAwesomeIcon icon="fas fa-users" size={16} />
            </div>
            <div>
              <p className="text-sm text-gray-900">
                <span className="font-medium">John Doe</span> reserved booth #145 for Tech Conference 2025
              </p>
              <p className="text-xs text-gray-500 mt-1">Today, 2:30 PM</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="rounded-full bg-green-100 p-2 text-green-600 mr-4">
              <FontAwesomeIcon icon="fas fa-check-circle" size={16} />
            </div>
            <div>
              <p className="text-sm text-gray-900">
                <span className="font-medium">ABC Company</span> reserved booth #78
              </p>
              <p className="text-xs text-gray-500 mt-1">Yesterday, 11:15 AM</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="rounded-full bg-purple-100 p-2 text-purple-600 mr-4">
              <FontAwesomeIcon icon="fas fa-file-alt" size={16} />
            </div>
            <div>
              <p className="text-sm text-gray-900">
                <span className="font-medium">You</span> created a new floor plan "Job Fair"
              </p>
              <p className="text-xs text-gray-500 mt-1">May 5, 2025</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floor Plan Manager Modal */}
      {showFloorPlanManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-7xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-lg">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Floor Plan Manager (Backend API)</h2>
              <button
                onClick={() => {
                  setShowFloorPlanManager(false);
                  // Refresh dashboard data when closing the manager
                  loadRecentFloorPlans();
                  loadDashboardStats();
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <FloorPlanManager 
              currentUser={user} 
              onFloorPlanChange={() => {
                loadRecentFloorPlans();
                loadDashboardStats();
              }}
            />
          </div>
        </div>
      )}

      {/* Background Upload Modal */}
      {showBackgroundUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <BackgroundUpload onClose={() => setShowBackgroundUpload(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { floorPlanAPI } from '../../services/api';
import { FloorPlan } from '../../types/canvas';

interface FloorPlanManagerProps {
  currentUser: any;
  onFloorPlanChange?: () => void;
}

export const FloorPlanManager: React.FC<FloorPlanManagerProps> = ({ currentUser, onFloorPlanChange }) => {
  const [floorPlans, setFloorPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedFloorPlan, setSelectedFloorPlan] = useState<any>(null);

  useEffect(() => {
    loadFloorPlans();
  }, []);

  const loadFloorPlans = async () => {
    try {
      setLoading(true);
      const result = await floorPlanAPI.getFloorPlans({ 
        search: searchTerm,
        limit: 50 
      });
      
      if (result.success) {
        setFloorPlans(result.data.floorplans || []);
      } else {
        setError('Failed to load floor plans');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFloorPlan = async (formData: any) => {
    try {
      const result = await floorPlanAPI.createFloorPlan(formData);
      if (result.success) {
        setShowCreateForm(false);
        setError(''); // Clear any previous errors
        await loadFloorPlans(); // Ensure we wait for the reload
        onFloorPlanChange?.(); // Notify parent component
      } else {
        setError(result.data?.message || 'Failed to create floor plan');
      }
    } catch (err) {
      setError('Failed to create floor plan');
    }
  };

  const handleDeleteFloorPlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this floor plan?')) return;
    
    try {
      const result = await floorPlanAPI.deleteFloorPlan(id);
      if (result.success) {
        loadFloorPlans();
        onFloorPlanChange?.(); // Notify parent component
      } else {
        setError('Failed to delete floor plan');
      }
    } catch (err) {
      setError('Failed to delete floor plan');
    }
  };

  const viewFloorPlanDetails = async (id: string) => {
    try {
      const result = await floorPlanAPI.getFloorPlan(id);
      if (result.success) {
        setSelectedFloorPlan(result.data.floorplan);
      }
    } catch (err) {
      setError('Failed to load floor plan details');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const result = await floorPlanAPI.updateFloorPlanStatus(id, newStatus);
      if (result.success) {
        loadFloorPlans(); // Refresh the list
        onFloorPlanChange?.(); // Notify parent component
      } else {
        setError('Failed to update floor plan status');
      }
    } catch (err) {
      setError('Failed to update floor plan status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading floor plans...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Floor Plan Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create New Floor Plan
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search floor plans..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && loadFloorPlans()}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={loadFloorPlans}
          className="ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Search
        </button>
      </div>

      {/* Floor Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {floorPlans.map((floorPlan) => (
          <div key={floorPlan.id} className="bg-white rounded-lg shadow-md p-6 border">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{floorPlan.name}</h3>
              <div className="flex flex-col items-end">
                <span className="text-sm text-gray-500">v{floorPlan.version}</span>
                <span className={`text-xs px-2 py-1 rounded mt-1 ${
                  floorPlan.status === 'published' ? 'bg-green-100 text-green-800' :
                  floorPlan.status === 'active' ? 'bg-blue-100 text-blue-800' :
                  floorPlan.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {floorPlan.status || 'draft'}
                </span>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">
              {floorPlan.description || 'No description'}
            </p>

            {/* Statistics */}
            {floorPlan.stats && (
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Total Booths:</span> {floorPlan.stats.total_booths}
                  </div>
                  <div>
                    <span className="font-medium">Available:</span> {floorPlan.stats.available}
                  </div>
                  <div>
                    <span className="font-medium">Sold:</span> {floorPlan.stats.sold}
                  </div>
                  <div>
                    <span className="font-medium">Reserved:</span> {floorPlan.stats.reserved}
                  </div>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-500 mb-4">
              <div>Created: {new Date(floorPlan.created).toLocaleDateString('en-US')}</div>
              <div>Modified: {new Date(floorPlan.last_modified).toLocaleDateString('en-US')}</div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => viewFloorPlanDetails(floorPlan.id)}
                className="bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold py-1 px-2 rounded"
              >
                View Details
              </button>
              {floorPlan.status !== 'published' && (
                <button
                  onClick={() => handleStatusChange(floorPlan.id, 'published')}
                  className="bg-green-500 hover:bg-green-700 text-white text-xs font-bold py-1 px-2 rounded"
                >
                  Publish
                </button>
              )}
              {floorPlan.status !== 'active' && floorPlan.status !== 'published' && (
                <button
                  onClick={() => handleStatusChange(floorPlan.id, 'active')}
                  className="bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold py-1 px-2 rounded"
                >
                  Activate
                </button>
              )}
              {(floorPlan.status === 'published' || floorPlan.status === 'active') && (
                <button
                  onClick={() => handleStatusChange(floorPlan.id, 'draft')}
                  className="bg-yellow-500 hover:bg-yellow-700 text-white text-xs font-bold py-1 px-2 rounded"
                >
                  Draft
                </button>
              )}
              <button
                onClick={() => handleDeleteFloorPlan(floorPlan.id)}
                className="bg-red-500 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {floorPlans.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No floor plans found. Create your first one!</p>
        </div>
      )}

      {/* Create Floor Plan Modal */}
      {showCreateForm && (
        <CreateFloorPlanModal
          onSubmit={handleCreateFloorPlan}
          onClose={() => setShowCreateForm(false)}
        />
      )}

      {/* Floor Plan Details Modal */}
      {selectedFloorPlan && (
        <FloorPlanDetailsModal
          floorPlan={selectedFloorPlan}
          onClose={() => setSelectedFloorPlan(null)}
        />
      )}
    </div>
  );
};

interface CreateFloorPlanModalProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
}

const CreateFloorPlanModal: React.FC<CreateFloorPlanModalProps> = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    event_id: '',
    floor: 1,
    status: 'draft'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Create New Floor Plan</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Event ID
            </label>
            <input
              type="text"
              value={formData.event_id}
              onChange={(e) => setFormData({...formData, event_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Floor Number
            </label>
            <input
              type="number"
              value={formData.floor}
              onChange={(e) => setFormData({...formData, floor: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              min="1"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface FloorPlanDetailsModalProps {
  floorPlan: any;
  onClose: () => void;
}

const FloorPlanDetailsModal: React.FC<FloorPlanDetailsModalProps> = ({ floorPlan, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{floorPlan.name} - Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Floor Plan Info */}
          <div>
            <h4 className="font-semibold mb-2">Floor Plan Information</h4>
            <div className="space-y-2 text-sm">
              <div><strong>Description:</strong> {floorPlan.description || 'N/A'}</div>
              <div><strong>Event ID:</strong> {floorPlan.event_id || 'N/A'}</div>
              <div><strong>Floor:</strong> {floorPlan.floor}</div>
              <div><strong>Version:</strong> {floorPlan.version}</div>
              <div><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  floorPlan.status === 'published' ? 'bg-green-100 text-green-800' :
                  floorPlan.status === 'active' ? 'bg-blue-100 text-blue-800' :
                  floorPlan.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {floorPlan.status || 'draft'}
                </span>
              </div>
              <div><strong>Created:</strong> {new Date(floorPlan.created).toLocaleString('en-US')}</div>
              <div><strong>Last Modified:</strong> {new Date(floorPlan.last_modified).toLocaleString('en-US')}</div>
            </div>
          </div>

          {/* Statistics */}
          {floorPlan.stats && (
            <div>
              <h4 className="font-semibold mb-2">Statistics</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Total Booths:</strong> {floorPlan.stats.total_booths}</div>
                <div><strong>Available:</strong> {floorPlan.stats.available}</div>
                <div><strong>Reserved:</strong> {floorPlan.stats.reserved}</div>
                <div><strong>Sold:</strong> {floorPlan.stats.sold}</div>
                <div><strong>On Hold:</strong> {floorPlan.stats.on_hold}</div>
              </div>
            </div>
          )}
        </div>

        {/* Booth Details */}
        {floorPlan.booth_details && floorPlan.booth_details.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">Booth Details</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Booth #</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Exhibitor</th>
                  </tr>
                </thead>
                <tbody>
                  {floorPlan.booth_details.map((booth: any, index: number) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2">{booth.number}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          booth.status === 'available' ? 'bg-green-100 text-green-800' :
                          booth.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                          booth.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booth.status}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {booth.exhibitor?.company_name || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { publicFloorPlanAPI } from '../services/api';

export const TestApiPage: React.FC = () => {
  const [floorPlans, setFloorPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);

  useEffect(() => {
    testApi();
  }, []);

  const testApi = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Testing public API...');
      const result = await publicFloorPlanAPI.getPublicFloorPlans();
      console.log('API result:', result);
      
      setApiResponse(result);
      
      if (result.success) {
        const plans = result.data.floorplans || [];
        setFloorPlans(plans);
        console.log('Floor plans found:', plans);
      } else {
        setError(`API Error: ${result.data?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('API test error:', error);
      setError(`Network Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Public Floor Plans API Test</h2>
          
          <button 
            onClick={testApi}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md mb-4"
          >
            Test API
          </button>
          
          {loading && (
            <div className="text-blue-600">Loading...</div>
          )}
          
          {error && (
            <div className="text-red-600 bg-red-50 p-4 rounded-md mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          {apiResponse && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Raw API Response:</h3>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}
          
          {floorPlans.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Found {floorPlans.length} Floor Plans:</h3>
              <div className="space-y-4">
                {floorPlans.map((plan, index) => (
                  <div key={plan.id || index} className="border border-gray-200 rounded-md p-4">
                    <h4 className="font-semibold text-lg">{plan.name}</h4>
                    <p className="text-gray-600">{plan.description}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>ID: {plan.id}</p>
                      <p>Status: {plan.status}</p>
                      <p>Created: {plan.created}</p>
                      {plan.stats && (
                        <p>Booths: {plan.stats.total_booths} total, {plan.stats.sold} sold</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!loading && floorPlans.length === 0 && !error && (
            <div className="text-gray-600 bg-gray-50 p-4 rounded-md">
              No floor plans found. Make sure you have created and published floor plans from the admin dashboard.
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Make sure the backend is running on http://localhost:5000</li>
            <li>Create an admin user and login</li>
            <li>Create a floor plan and set status to "published"</li>
            <li>The floor plan should appear in this test</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
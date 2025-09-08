import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';
import { useCanvasStore } from '../../store/canvasStore';
import { useAuthStore } from '../../store/authStore';
import { AreaSelector } from './AreaSelector';
import { areaMapAPI } from '../../services/api';

interface AreaMap {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  created: string;
}

interface AreaMapSelectorProps {
  onMapSelected: (map: AreaMap) => void;
  selectedMapId?: string;
}

export const AreaMapSelector: React.FC<AreaMapSelectorProps> = ({ 
  onMapSelected, 
  selectedMapId 
}) => {
  const [areaMaps, setAreaMaps] = useState<AreaMap[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showAreaSelector, setShowAreaSelector] = useState(false);
  const [selectedMapForArea, setSelectedMapForArea] = useState<AreaMap | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { setBackgroundImage } = useCanvasStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadAreaMaps();
  }, []);

  const loadAreaMaps = async () => {
    setLoading(true);
    setError(null);
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      setError('Please log in to access area maps');
      setLoading(false);
      return;
    }
    
    try {
      // Try to load from backend first
      const result = await areaMapAPI.getAreaMaps();
      if (result.success && result.data.area_maps) {
        setAreaMaps(result.data.area_maps);
        return;
      } else if (!result.success) {
        console.error('Failed to load area maps:', result.data);
        setError('Failed to load area maps. Please check your connection and try again.');
      }
      
      // Fallback to localStorage or sample data
      const storedMaps = localStorage.getItem('areaMaps');
      if (storedMaps) {
        setAreaMaps(JSON.parse(storedMaps));
      } else {
        // Load existing floor plan as area map
        const response = await fetch('http://localhost:5000/api/public/floorplans/68b12d874c288e624dbf4020');
        const sampleMaps: AreaMap[] = [];
        
        if (response.ok) {
          const result = await response.json();
          if (result.floorplan?.state?.backgroundImage) {
            sampleMaps.push({
              id: '68b12d874c288e624dbf4020',
              name: result.floorplan.name || 'Exhibition Floor Plan',
              url: result.floorplan.state.backgroundImage.url,
              width: result.floorplan.state.canvasSize?.width || 1200,
              height: result.floorplan.state.canvasSize?.height || 800,
              created: result.floorplan.created
            });
          }
        }
        
        // Add default sample if no floor plan found
        if (sampleMaps.length === 0) {
          sampleMaps.push({
            id: '1',
            name: 'Sample Floor Plan Map',
            url: 'http://localhost:5000/uploads/sample-map.jpg',
            width: 1200,
            height: 800,
            created: new Date().toISOString()
          });
        }
        setAreaMaps(sampleMaps);
        localStorage.setItem('areaMaps', JSON.stringify(sampleMaps));
      }
    } catch (error) {
      console.error('Failed to load area maps:', error);
      setError('Failed to load area maps. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMapSelect = (map: AreaMap) => {
    setSelectedMapForArea(map);
    setShowAreaSelector(true);
  };

  const handleAreaSelected = (area: { x: number; y: number; width: number; height: number }) => {
    if (!selectedMapForArea) return;
    
    onMapSelected(selectedMapForArea);
    
    setBackgroundImage({
      url: selectedMapForArea.url,
      opacity: 0.7,
      fitMode: 'fit',
      locked: false,
      position: { x: -area.x, y: -area.y },
      scale: 1,
      rotation: 0
    });
    
    setShowAreaSelector(false);
    setSelectedMapForArea(null);
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;
    
    if (!isAuthenticated) {
      setError('Please log in to upload area maps');
      return;
    }

    setUploading(true);
    try {
      const result = await areaMapAPI.uploadAreaMap(uploadFile);

      if (result.success) {
        const newMap: AreaMap = {
          id: result.data.filename,
          name: uploadFile.name.replace(/\.[^/.]+$/, ''),
          url: result.data.url,
          width: 1200,
          height: 800,
          created: result.data.uploaded_at
        };

        const updatedMaps = [...areaMaps, newMap];
        setAreaMaps(updatedMaps);
        localStorage.setItem('areaMaps', JSON.stringify(updatedMaps));
        
        handleMapSelect(newMap);
        setShowUpload(false);
        setUploadFile(null);
      } else {
        console.error('Upload failed:', result.data);
        setError('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="area-map-selector">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Select Area Map</h3>
        <button
          onClick={() => setShowUpload(true)}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
        >
          <FontAwesomeIcon icon="fas fa-upload" size={14} className="mr-2" />
          Upload New
        </button>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-8">
          <FontAwesomeIcon icon="fas fa-exclamation-triangle" size={32} className="text-red-500 mb-4" />
          <p className="text-red-600 text-center mb-4">{error}</p>
          <button
            onClick={loadAreaMaps}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {areaMaps.map((map) => (
            <div
              key={map.id}
              onClick={() => handleMapSelect(map)}
              className={`cursor-pointer border-2 rounded-lg p-3 transition-all hover:shadow-md ${
                selectedMapId === map.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden relative">
                <img
                  src={map.url}
                  alt={map.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
                <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white font-medium text-sm bg-blue-600 px-2 py-1 rounded">Select Area</span>
                </div>
              </div>
              <h4 className="font-medium text-gray-900 truncate">{map.name}</h4>
              <p className="text-sm text-gray-500">
                {map.width} × {map.height}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Area Selector Modal */}
      {showAreaSelector && selectedMapForArea && (
        <AreaSelector
          imageUrl={selectedMapForArea.url}
          onAreaSelected={handleAreaSelected}
          onClose={() => {
            setShowAreaSelector(false);
            setSelectedMapForArea(null);
          }}
        />
      )}

      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Area Map</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Image File
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {uploadFile && (
                  <div className="text-sm text-gray-600">
                    Selected: {uploadFile.name}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowUpload(false);
                    setUploadFile(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFileUpload}
                  disabled={!uploadFile || uploading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
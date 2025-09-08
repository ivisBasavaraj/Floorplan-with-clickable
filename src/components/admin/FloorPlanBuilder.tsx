import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { floorPlanAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useCanvasStore } from '../../store/canvasStore';
import { BoothElement, TextElement } from '../../types/canvas';
import { Canvas } from '../canvas/Canvas';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';
import { PropertiesPanel } from '../panels/PropertiesPanel';
import { ToolsPanel } from '../panels/ToolsPanel';
import { FloorPlanViewer3D } from '../viewer/FloorPlanViewer3D';
import { AreaMapSelector } from './AreaMapSelector';

interface AreaMap {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  created: string;
}

export const FloorPlanBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    elements, 
    addElement, 
    resetCanvas, 
    activeTool, 
    grid, 
    zoom,
    setCanvasSize 
  } = useCanvasStore();

  const [selectedAreaMap, setSelectedAreaMap] = useState<AreaMap | null>(null);
  const [showAreaMapSelector, setShowAreaMapSelector] = useState(false);
  const [floorPlanName, setFloorPlanName] = useState('');
  const [floorPlanDescription, setFloorPlanDescription] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'2d' | '3d'>('2d');

  useEffect(() => {
    if (id === 'new') {
      resetCanvas();
      setFloorPlanName(`Floor Plan ${new Date().toLocaleDateString()}`);
      // Skip area map selector, go directly to canvas
      setCanvasSize(1200, 800);
      setSelectedAreaMap({
        id: 'default',
        name: 'Default Canvas',
        url: '',
        width: 1200,
        height: 800,
        created: new Date().toISOString()
      });
    } else if (id) {
      loadExistingFloorPlan(id);
    }
  }, [id, resetCanvas]);

  const loadExistingFloorPlan = async (planId: string) => {
    try {
      const result = await floorPlanAPI.getFloorPlan(planId);
      if (result.success && result.data.floorplan) {
        const plan = result.data.floorplan;
        setFloorPlanName(plan.name);
        setFloorPlanDescription(plan.description || '');
        setIsPublished(plan.status === 'published');
        
        if (plan.state) {
          // Load the floor plan state
          const { loadFloorPlan } = useCanvasStore.getState();
          loadFloorPlan(plan.state);
        }
      }
    } catch (error) {
      console.error('Failed to load floor plan:', error);
    }
  };

  const handleAreaMapSelected = (map: AreaMap) => {
    setSelectedAreaMap(map);
    setShowAreaMapSelector(false);
    setCanvasSize(map.width, map.height);
  };

  const addSampleElements = () => {
    // Add a sample booth
    addElement({
      type: 'booth',
      x: 100,
      y: 100,
      width: 120,
      height: 80,
      rotation: 0,
      fill: '#FFFFFF',
      stroke: '#333333',
      strokeWidth: 2,
      draggable: true,
      layer: 1,
      customProperties: {},
      number: 'A-101',
      status: 'available',
      dimensions: {
        imperial: '12\' x 8\'',
        metric: '3.6m x 2.4m'
      }
    } as Omit<BoothElement, 'id' | 'selected'>);

    // Add entrance label
    addElement({
      type: 'text',
      x: 50,
      y: 50,
      width: 200,
      height: 40,
      rotation: 0,
      fill: '#2563eb',
      stroke: '',
      strokeWidth: 0,
      draggable: true,
      layer: 2,
      customProperties: {},
      text: 'Main Entrance',
      fontSize: 18,
      fontFamily: 'Arial',
      align: 'center',
      fontStyle: 'bold'
    } as Omit<TextElement, 'id' | 'selected'>);
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setSaveStatus('Saving...');

    try {
      const floorPlanData = {
        name: floorPlanName,
        description: floorPlanDescription,
        event_id: 'default_event',
        floor: 1,
        status: isPublished ? 'published' : 'draft',
        state: {
          elements: elements.map(el => ({
            ...el,
            ...(el.type === 'booth' && {
              number: (el as BoothElement).number || `B${Math.floor(Math.random() * 1000)}`,
              status: (el as BoothElement).status || 'available',
              dimensions: (el as BoothElement).dimensions || {
                imperial: '10x10 ft',
                metric: '3x3 m'
              }
            })
          })),
          canvasSize: useCanvasStore.getState().canvasSize,
          zoom: 1,
          offset: { x: 0, y: 0 },
          grid: {
            enabled: true,
            size: 20,
            snap: true,
            opacity: 0.3
          },
          selectedAreaMap
        }
      };

      const result = (id === 'new' || !id) 
        ? await floorPlanAPI.createFloorPlan(floorPlanData)
        : await floorPlanAPI.updateFloorPlan(id, floorPlanData);
      
      if (result.success) {
        setSaveStatus('✅ Saved successfully!');
        setShowSaveDialog(false);
        
        if ((id === 'new' || !id) && result.data.floorplan?.id) {
          navigate(`/admin/floor-plans/${result.data.floorplan.id}/edit`, { replace: true });
        }
        
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('❌ Save failed');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('❌ Save failed - Check connection');
      setTimeout(() => setSaveStatus(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublished(true);
    await handleSave();
  };

  return (
    <div className="floor-plan-builder fixed inset-0 flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon="fas fa-arrow-left" size={16} />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <FontAwesomeIcon icon="fas fa-drafting-compass" size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Floor Plan Builder</h1>
              <p className="text-sm text-gray-500">
                {selectedAreaMap ? selectedAreaMap.name : 'Select an area map to begin'}
              </p>
            </div>
          </div>
          {saveStatus && (
            <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
              {saveStatus}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {selectedAreaMap && (
            <button
              onClick={() => setShowAreaMapSelector(true)}
              className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FontAwesomeIcon icon="fas fa-map" size={14} className="mr-2" />
              Change Map
            </button>
          )}
          <button
            onClick={() => setShowPreview(true)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Preview
          </button>
          <button
            onClick={() => setShowSaveDialog(true)}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handlePublish}
            disabled={isSaving}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Publish
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center space-x-1">
          {[
            { id: 'select', icon: 'fas fa-mouse-pointer', label: 'Select' },
            { id: 'booth', icon: 'fas fa-square', label: 'Booth' },
            { id: 'wall', icon: 'fas fa-minus', label: 'Wall' },
            { id: 'text', icon: 'fas fa-font', label: 'Text' },
            { id: 'door', icon: 'fas fa-door-open', label: 'Door' },
            { id: 'furniture', icon: 'fas fa-couch', label: 'Furniture' },
          ].map((tool) => (
            <button
              key={tool.id}
              onClick={() => useCanvasStore.getState().setActiveTool(tool.id)}
              className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                activeTool === tool.id ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
              }`}
              title={tool.label}
            >
              <FontAwesomeIcon icon={tool.icon} size={16} />
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              const bgImage = useCanvasStore.getState().backgroundImage;
              if (bgImage?.url && bgImage.url.includes('/uploads/')) {
                const filename = bgImage.url.split('/uploads/')[1];
                window.dispatchEvent(new CustomEvent('manual-detection', { detail: { filename } }));
              } else {
                console.log('No background image uploaded');
              }
            }}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
            title="Detect Booths"
          >
            <FontAwesomeIcon icon="fas fa-search" size={14} className="mr-2" />
            Detect
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const bgImage = useCanvasStore.getState().backgroundImage;
              if (bgImage?.url && bgImage.url.includes('/uploads/')) {
                const filename = bgImage.url.split('/uploads/')[1];
                window.dispatchEvent(new CustomEvent('hierarchy-detection', { detail: { filename } }));
              } else {
                console.log('No background image uploaded');
              }
            }}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors cursor-pointer"
            title="Detect Booth Hierarchy"
          >
            <FontAwesomeIcon icon="fas fa-sitemap" size={14} className="mr-2" />
            Hierarchy
          </button>
          <div className="flex items-center space-x-2">
            <button
              className={`p-2 rounded transition-colors ${
                grid.enabled ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => useCanvasStore.getState().toggleGrid()}
              title="Toggle Grid"
            >
              <FontAwesomeIcon icon="fas fa-th" size={16} />
            </button>
            <span className="text-sm text-gray-600">
              Zoom: {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tools */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Design Tools</h3>
            <ToolsPanel />
          </div>
          
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Statistics</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Elements:</span>
                <span>{elements.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Booths:</span>
                <span>{elements.filter(el => el.type === 'booth').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Tool:</span>
                <span className="capitalize">{activeTool}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 relative bg-gray-100">
          <Canvas />
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Properties</h3>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            <PropertiesPanel />
          </div>
        </div>
      </div>

      {/* Area Map Selector Modal */}
      {showAreaMapSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Select Area Map</h2>
                <button
                  onClick={() => setShowAreaMapSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon="fas fa-times" size={20} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <AreaMapSelector
                onMapSelected={handleAreaMapSelected}
                selectedMapId={selectedAreaMap?.id}
              />
            </div>
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Floor Plan</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Floor Plan Name
                  </label>
                  <input
                    type="text"
                    value={floorPlanName}
                    onChange={(e) => setFloorPlanName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter floor plan name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={floorPlanDescription}
                    onChange={(e) => setFloorPlanDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter description"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="publish"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="publish" className="ml-2 block text-sm text-gray-900">
                    Publish immediately (make visible to users)
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!floorPlanName.trim() || isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Floor Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">Floor Plan Preview</h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setPreviewMode('2d')}
                  className={`px-3 py-1 rounded ${previewMode === '2d' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  2D View
                </button>
                <button
                  onClick={() => setPreviewMode('3d')}
                  className={`px-3 py-1 rounded ${previewMode === '3d' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  3D View
                </button>
                <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700">
                  <FontAwesomeIcon icon="fas fa-times" size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 h-full">
              {previewMode === '2d' ? (
                <div className="h-full p-4">
                  <Canvas />
                </div>
              ) : (
                // Use the real 3D viewer for consistency with user view
                <div className="h-full p-4">
                  <div className="h-full min-h-[400px]">
                    <FloorPlanViewer3D />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
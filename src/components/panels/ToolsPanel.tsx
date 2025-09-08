
import React, { ReactElement, useState } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';

import './tools-panel.css';

// Define interfaces for our tool items
interface ToolItem {
  id: string;
  icon: ReactElement;
  label: string;
}

interface ActionItem extends ToolItem {
  action: () => void;
  disabled: boolean;
}

export const ToolsPanel: React.FC = () => {
  const { 
    activeTool, 
    selectedIds, 
    setActiveTool,
    deleteElements,
    duplicateElements,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    elements,
    addElement,
    updateElement
  } = useCanvasStore();
  
  const [showSubdivisionDialog, setShowSubdivisionDialog] = useState(false);
  const [subdivisionRows, setSubdivisionRows] = useState(2);
  const [subdivisionCols, setSubdivisionCols] = useState(2);
  
  const hasSelection = selectedIds.length > 0;
  const hasBoothSelection = selectedIds.length > 0 && selectedIds.some(id => {
    const element = elements.find(el => el.id === id);
    return element?.type === 'booth';
  });

  // Subdivision functionality
  const subdivideSelectedBooths = (rows: number = 2, cols: number = 2) => {
    selectedIds.forEach(id => {
      const element = elements.find(el => el.id === id);
      if (element?.type === 'booth') {
        const subWidth = element.width / cols;
        const subHeight = element.height / rows;
        
        // Remove original booth
        deleteElements([id]);
        
        // Add sub-booths based on rows and columns
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const subIndex = row * cols + col;
            addElement({
              type: 'booth',
              x: element.x + (col * subWidth),
              y: element.y + (row * subHeight),
              width: subWidth,
              height: subHeight,
              rotation: element.rotation,
              fill: element.fill,
              stroke: element.stroke,
              strokeWidth: element.strokeWidth,
              draggable: true,
              layer: element.layer,
              customProperties: {
                ...element.customProperties,
                boothNumber: `${element.customProperties?.boothNumber || 'B'}-${String.fromCharCode(65 + subIndex)}`,
                parentBooth: element.id,
                isSubdivision: true,
                subdivisionIndex: subIndex,
                subdivisionGrid: `${rows}x${cols}`
              }
            });
          }
        }
      }
    });
  };

  const handleSubdivisionClick = () => {
    setShowSubdivisionDialog(true);
  };

  const applySubdivision = () => {
    subdivideSelectedBooths(subdivisionRows, subdivisionCols);
    setShowSubdivisionDialog(false);
  };
  
  const tools: ToolItem[] = [
    { id: 'select', icon: <FontAwesomeIcon icon="fas fa-mouse-pointer" className="tool-icon" size={18} />, label: 'Select' },
    { id: 'booth', icon: <FontAwesomeIcon icon="fas fa-th-large" className="tool-icon" size={18} />, label: 'Booth' },
    { id: 'rectangle', icon: <FontAwesomeIcon icon="far fa-square" className="tool-icon" size={18} />, label: 'Rectangle' },
    { id: 'circle', icon: <FontAwesomeIcon icon="far fa-circle" className="tool-icon" size={18} />, label: 'Circle' },
    { id: 'text', icon: <FontAwesomeIcon icon="fas fa-font" className="tool-icon" size={18} />, label: 'Text' },
    { id: 'image', icon: <FontAwesomeIcon icon="far fa-image" className="tool-icon" size={18} />, label: 'Image' },
    { id: 'line', icon: <FontAwesomeIcon icon="fas fa-minus" className="tool-icon" size={18} />, label: 'Line' },
    { id: 'wall', icon: <FontAwesomeIcon icon="fas fa-border-all" className="tool-icon" size={18} />, label: 'Wall' },
    { id: 'door', icon: <FontAwesomeIcon icon="fas fa-door-open" className="tool-icon" size={18} />, label: 'Door' },
    { id: 'furniture', icon: <FontAwesomeIcon icon="fas fa-couch" className="tool-icon" size={18} />, label: 'Furniture' },
    { id: 'plant', icon: <FontAwesomeIcon icon="fas fa-seedling" className="tool-icon" size={18} />, label: 'Plant' },
    
    // Meeting / Conference Room
    { id: 'meeting-room', icon: <FontAwesomeIcon icon="fas fa-users" className="tool-icon" size={18} />, label: 'Meeting Room' },
    
    // Family / Family Services
    { id: 'family-services', icon: <FontAwesomeIcon icon="fas fa-baby" className="tool-icon" size={18} />, label: 'Family Services' },
    
    // Car / Transportation
    { id: 'transportation', icon: <FontAwesomeIcon icon="fas fa-car" className="tool-icon" size={18} />, label: 'Transportation' },
    
    // No Smoking
    { id: 'no-smoking', icon: <FontAwesomeIcon icon="fas fa-smoking-ban" className="tool-icon" size={18} />, label: 'No Smoking' },
    
    // Restaurant / Dining
    { id: 'restaurant', icon: <FontAwesomeIcon icon="fas fa-utensils" className="tool-icon" size={18} />, label: 'Restaurant' },
    
    // Information / Help Desk
    { id: 'information', icon: <FontAwesomeIcon icon="fas fa-info-circle" className="tool-icon" size={18} />, label: 'Information' },
    
    // Cafeteria / Food Service
    { id: 'cafeteria', icon: <FontAwesomeIcon icon="fas fa-coffee" className="tool-icon" size={18} />, label: 'Cafeteria' },
    
    // ATM / Banking Services
    { id: 'atm', icon: <FontAwesomeIcon icon="fas fa-credit-card" className="tool-icon" size={18} />, label: 'ATM' },
    
    // Elevator
    { id: 'elevator', icon: <FontAwesomeIcon icon="fas fa-elevator" className="tool-icon" size={18} />, label: 'Elevator' },
    
    // Emergency Exit
    { id: 'emergency-exit', icon: <FontAwesomeIcon icon="fas fa-door-open" className="tool-icon" size={18} />, label: 'Emergency Exit' },
    
    // Doctor / Medical Services
    { id: 'medical', icon: <FontAwesomeIcon icon="fas fa-stethoscope" className="tool-icon" size={18} />, label: 'Medical' },
    
    // Childcare / Family Room
    { id: 'childcare', icon: <FontAwesomeIcon icon="fas fa-child" className="tool-icon" size={18} />, label: 'Childcare' },
    
    // Nursing Room / Mother and Baby Room
    { id: 'nursing-room', icon: <FontAwesomeIcon icon="fas fa-baby-carriage" className="tool-icon" size={18} />, label: 'Nursing Room' },
    
    // Senior Citizen / Elderly Assistance
    { id: 'senior-assistance', icon: <FontAwesomeIcon icon="fas fa-walking-cane" className="tool-icon" size={18} />, label: 'Senior Assistance' },
    
    // Accessible / Wheelchair Accessible
    { id: 'wheelchair-accessible', icon: <FontAwesomeIcon icon="fas fa-wheelchair" className="tool-icon" size={18} />, label: 'Wheelchair Accessible' },
    
    // Lost and Found
    { id: 'lost-found', icon: <FontAwesomeIcon icon="fas fa-search" className="tool-icon" size={18} />, label: 'Lost & Found' },
    
    // Information Point
    { id: 'info-point', icon: <FontAwesomeIcon icon="fas fa-question-circle" className="tool-icon" size={18} />, label: 'Info Point' },
    
    // First Aid / Medical Assistance
    { id: 'first-aid', icon: <FontAwesomeIcon icon="fas fa-first-aid" className="tool-icon" size={18} />, label: 'First Aid' },
    
    // Restroom (All Gender or Male and Female)
    { id: 'restroom', icon: <FontAwesomeIcon icon="fas fa-restroom" className="tool-icon" size={18} />, label: 'Restroom' },
    
    // Men’s Restroom
    { id: 'mens-restroom', icon: <FontAwesomeIcon icon="fas fa-mars" className="tool-icon" size={18} />, label: "Men's Restroom" },
    
    // Women’s Restroom
    { id: 'womens-restroom', icon: <FontAwesomeIcon icon="fas fa-venus" className="tool-icon" size={18} />, label: "Women's Restroom" },
    
    // Luggage / Baggage Services
    { id: 'baggage', icon: <FontAwesomeIcon icon="fas fa-suitcase" className="tool-icon" size={18} />, label: 'Baggage' }
  ];
  


  // Group tools into categories for better organization
  const basicTools = tools.slice(0, 11); // First 11 tools are basic elements
  const facilityTools = [
    tools.find(t => t.id === 'meeting-room'),
    tools.find(t => t.id === 'restaurant'),
    tools.find(t => t.id === 'information'),
    tools.find(t => t.id === 'cafeteria'),
    tools.find(t => t.id === 'atm'),
    tools.find(t => t.id === 'elevator'),
    tools.find(t => t.id === 'restroom'),
    tools.find(t => t.id === 'mens-restroom'),
    tools.find(t => t.id === 'womens-restroom'),
  ].filter((tool): tool is ToolItem => Boolean(tool));
  
  const serviceTools = [
    tools.find(t => t.id === 'family-services'),
    tools.find(t => t.id === 'medical'),
    tools.find(t => t.id === 'childcare'),
    tools.find(t => t.id === 'nursing-room'),
    tools.find(t => t.id === 'senior-assistance'),
    tools.find(t => t.id === 'wheelchair-accessible'),
    tools.find(t => t.id === 'lost-found'),
    tools.find(t => t.id === 'info-point'),
    tools.find(t => t.id === 'first-aid'),
    tools.find(t => t.id === 'baggage'),
  ].filter((tool): tool is ToolItem => Boolean(tool));
  
  const specialTools = [
    tools.find(t => t.id === 'transportation'),
    tools.find(t => t.id === 'no-smoking'),
    tools.find(t => t.id === 'emergency-exit'),
  ].filter((tool): tool is ToolItem => Boolean(tool));

  // Add className to all icons for consistent styling
  const addToolIconClass = (toolList: ToolItem[]): ToolItem[] => {
    return toolList.map(tool => ({
      ...tool,
      icon: React.cloneElement(tool.icon, { 
        className: tool.icon.props.className || "tool-icon" 
      })
    }));
  };

  const enhancedBasicTools = addToolIconClass(basicTools);
  const enhancedFacilityTools = addToolIconClass(facilityTools);
  const enhancedServiceTools = addToolIconClass(serviceTools);
  const enhancedSpecialTools = addToolIconClass(specialTools);



  return (
    <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
      {/* Basic Tools Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {enhancedBasicTools.slice(0, 8).map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`p-3 rounded-lg border transition-colors ${
              activeTool === tool.id 
                ? 'bg-blue-100 border-blue-300 text-blue-700' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
            title={tool.label}
          >
            <div className="flex flex-col items-center space-y-1">
              {tool.icon}
              <span className="text-xs font-medium">{tool.label}</span>
            </div>
          </button>
        ))}
      </div>
      

      
      {/* Actions */}
      <div className="border-t border-gray-200 pt-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Actions</h4>
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={handleSubdivisionClick}
            disabled={!hasBoothSelection}
            className="p-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded transition-colors disabled:opacity-50"
            title="Subdivide"
          >
            <FontAwesomeIcon icon="fas fa-th" size={14} />
          </button>
          <button
            onClick={() => deleteElements(selectedIds)}
            disabled={!hasSelection}
            className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded transition-colors disabled:opacity-50"
            title="Delete"
          >
            <FontAwesomeIcon icon="fas fa-trash" size={14} />
          </button>
          <button
            onClick={() => duplicateElements(selectedIds)}
            disabled={!hasSelection}
            className="p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors disabled:opacity-50"
            title="Duplicate"
          >
            <FontAwesomeIcon icon="fas fa-copy" size={14} />
          </button>
          <button
            onClick={() => bringForward(selectedIds)}
            disabled={!hasSelection}
            className="p-2 text-gray-600 hover:bg-green-50 hover:text-green-600 rounded transition-colors disabled:opacity-50"
            title="Forward"
          >
            <FontAwesomeIcon icon="fas fa-chevron-up" size={14} />
          </button>
        </div>
      </div>

      {/* Subdivision Dialog */}
      {showSubdivisionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Subdivide Booth</h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose how to divide the selected booth(s) into smaller sections.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rows
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={subdivisionRows}
                  onChange={(e) => setSubdivisionRows(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Columns
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={subdivisionCols}
                  onChange={(e) => setSubdivisionCols(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">
                  This will create <strong>{subdivisionRows * subdivisionCols}</strong> sub-booths
                  in a <strong>{subdivisionRows}×{subdivisionCols}</strong> grid.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSubdivisionDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applySubdivision}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Apply Subdivision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
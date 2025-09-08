import React, { useState } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { 
  BoothElement, 
  TextElement, 
  AnyCanvasElement 
} from '../../types/canvas';

export const PropertiesPanel: React.FC = () => {
  const { elements, selectedIds, updateElement } = useCanvasStore();
  
  // Get the first selected element for editing
  const selectedElement = elements.find(el => selectedIds.includes(el.id));
  
  if (!selectedElement) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122" />
          </svg>
        </div>
        <p className="text-sm text-gray-500">Select an element to edit properties</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">
          {getElementTitle(selectedElement)}
        </h3>
        <p className="text-xs text-gray-500">ID: {selectedElement.id.slice(0, 8)}...</p>
      </div>
      
      {/* Common properties */}
      <CommonProperties element={selectedElement} />
      
      {/* Element-specific properties */}
      {selectedElement.type === 'booth' && (
        <BoothProperties element={selectedElement as BoothElement} />
      )}
      
      {selectedElement.type === 'text' && (
        <TextProperties element={selectedElement as TextElement} />
      )}
    </div>
  );
};

const getElementTitle = (element: AnyCanvasElement): string => {
  switch (element.type) {
    case 'booth':
      return `Booth ${(element as BoothElement).number}`;
    case 'text':
      return 'Text Element';
    case 'shape':
      return 'Shape';
    case 'image':
      return 'Image';
    default:
      return 'Element';
  }
};

interface PropertiesProps {
  element: AnyCanvasElement;
}

const CommonProperties: React.FC<PropertiesProps> = ({ element }) => {
  const { updateElement } = useCanvasStore();
  
  const handleChange = (field: keyof AnyCanvasElement, value: any) => {
    updateElement(element.id, { [field]: value });
  };
  
  return (
    <div className="space-y-4 mb-4">
      <div className="border-b border-gray-200 pb-2">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Position & Size</h4>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">X</label>
          <input 
            type="number" 
            value={Math.round(element.x)} 
            onChange={(e) => handleChange('x', Number(e.target.value))}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-500 mb-1">Y</label>
          <input 
            type="number" 
            value={Math.round(element.y)} 
            onChange={(e) => handleChange('y', Number(e.target.value))}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-500 mb-1">Width</label>
          <input 
            type="number" 
            value={Math.round(element.width)} 
            onChange={(e) => handleChange('width', Number(e.target.value))}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-500 mb-1">Height</label>
          <input 
            type="number" 
            value={Math.round(element.height)} 
            onChange={(e) => handleChange('height', Number(e.target.value))}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
      </div>
      
      <div className="border-b border-gray-200 pb-2 pt-2">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Appearance</h4>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fill</label>
          <div className="flex space-x-2">
            <input 
              type="color" 
              value={element.fill} 
              onChange={(e) => handleChange('fill', e.target.value)}
              className="w-8 h-8 border border-gray-300 rounded cursor-pointer" 
            />
            <input 
              type="text" 
              value={element.fill} 
              onChange={(e) => handleChange('fill', e.target.value)}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
        </div>
        
        <div>
          <label className="block text-xs text-gray-500 mb-1">Stroke</label>
          <div className="flex space-x-2">
            <input 
              type="color" 
              value={element.stroke} 
              onChange={(e) => handleChange('stroke', e.target.value)}
              className="w-8 h-8 border border-gray-300 rounded cursor-pointer" 
            />
            <input 
              type="text" 
              value={element.stroke} 
              onChange={(e) => handleChange('stroke', e.target.value)}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
        </div>
        
        <div>
          <label className="block text-xs text-gray-500 mb-1">Stroke Width</label>
          <input 
            type="number" 
            value={element.strokeWidth} 
            onChange={(e) => handleChange('strokeWidth', Number(e.target.value))}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
            min="0"
            step="0.5"
          />
        </div>
      </div>
    </div>
  );
};

const BoothProperties: React.FC<{ element: BoothElement }> = ({ element }) => {
  const { updateElement, updateBoothStatus } = useCanvasStore();
  
  const handleChange = (field: keyof BoothElement, value: any) => {
    updateElement(element.id, { [field]: value });
  };
  
  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-2">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Booth Details</h4>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Booth Number</label>
          <input 
            type="text" 
            value={element.number} 
            onChange={(e) => handleChange('number', e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <select 
            value={element.status} 
            onChange={(e) => updateBoothStatus(element.id, e.target.value as BoothElement['status'])}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
          >
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs text-gray-500 mb-1">Price ($)</label>
          <input 
            type="number" 
            value={element.price || ''} 
            onChange={(e) => handleChange('price', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="0"
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Imperial</label>
            <input 
              type="text" 
              value={element.dimensions.imperial} 
              onChange={(e) => handleChange('dimensions', { 
                ...element.dimensions, 
                imperial: e.target.value 
              })}
              placeholder="10' x 10'"
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">Metric</label>
            <input 
              type="text" 
              value={element.dimensions.metric} 
              onChange={(e) => handleChange('dimensions', { 
                ...element.dimensions, 
                metric: e.target.value 
              })}
              placeholder="3m x 3m"
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const TextProperties: React.FC<{ element: TextElement }> = ({ element }) => {
  const { updateElement } = useCanvasStore();
  
  const handleChange = (field: keyof TextElement, value: any) => {
    updateElement(element.id, { [field]: value });
  };
  
  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-2">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Text Settings</h4>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Content</label>
          <textarea 
            value={element.text} 
            onChange={(e) => handleChange('text', e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-h-16 resize-none" 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Size</label>
            <input 
              type="number" 
              value={element.fontSize} 
              onChange={(e) => handleChange('fontSize', Number(e.target.value))}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
              min="8"
              max="120"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">Align</label>
            <select 
              value={element.align} 
              onChange={(e) => handleChange('align', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-xs text-gray-500 mb-1">Font</label>
          <select 
            value={element.fontFamily} 
            onChange={(e) => handleChange('fontFamily', e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs text-gray-500 mb-1">Style</label>
          <select 
            value={element.fontStyle} 
            onChange={(e) => handleChange('fontStyle', e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
            <option value="italic">Italic</option>
            <option value="bold italic">Bold Italic</option>
          </select>
        </div>
      </div>
    </div>
  );
};
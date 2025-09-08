import React, { useState } from 'react';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';
import { useCanvasStore } from '../../store/canvasStore';
import { v4 as uuidv4 } from 'uuid';
import type { ShapeElement } from '../../types/canvas';

export const FlooringToolbar: React.FC = () => {
  const { flooring, addFlooringElement } = useCanvasStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#8B4513'); // Brown wood color
  
  if (!flooring?.enabled) return null;
  
  const colors = [
    '#8B4513', // Brown (wood)
    '#A0522D', // Sienna (wood)
    '#D2B48C', // Tan (light wood)
    '#808080', // Gray (concrete)
    '#696969', // DimGray (dark concrete)
    '#DCDCDC', // Gainsboro (light concrete)
    '#F5F5DC', // Beige (carpet)
    '#E6E6FA', // Lavender (carpet)
    '#87CEEB', // SkyBlue (tile)
    '#F0E68C', // Khaki (tile)
  ];
  
  const handleAddRectangle = () => {
    addFlooringElement({
      type: 'shape',
      shapeType: 'rectangle',
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      fill: selectedColor,
      stroke: '#000000',
      strokeWidth: 1,
      rotation: 0,
      draggable: true,
      layer: 0,
      customProperties: {
        flooringType: 'rectangle'
      }
    });
  };
  
  const handleAddCircle = () => {
    addFlooringElement({
      type: 'shape',
      shapeType: 'circle',
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      fill: selectedColor,
      stroke: '#000000',
      strokeWidth: 1,
      rotation: 0,
      draggable: true,
      layer: 0,
      customProperties: {
        flooringType: 'circle'
      }
    });
  };
  
  const handleAddPolygon = () => {
    // Create a simple polygon (hexagon)
    const radius = 100;
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      points.push(radius + radius * Math.cos(angle));
      points.push(radius + radius * Math.sin(angle));
    }
    
    addFlooringElement({
      type: 'shape',
      shapeType: 'polygon',
      x: 100,
      y: 100,
      width: radius * 2,
      height: radius * 2,
      fill: selectedColor,
      stroke: '#000000',
      strokeWidth: 1,
      rotation: 0,
      draggable: true,
      layer: 0,
      points,
      customProperties: {
        flooringType: 'polygon'
      }
    });
  };
  
  return (
    <div className={`absolute left-6 top-1/2 transform -translate-y-1/2 bg-white rounded-lg shadow-lg ${isOpen ? 'w-48' : 'w-10'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
      >
        {isOpen ? <FontAwesomeIcon icon="fas fa-times" size={16} /> : <FontAwesomeIcon icon="fas fa-palette" size={16} />}
      </button>
      
      {isOpen && (
        <div className="p-3 space-y-4">
          <h3 className="text-sm font-medium">Flooring Tools</h3>
          
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleAddRectangle}
              className="p-2 hover:bg-gray-100 rounded-md flex flex-col items-center"
              title="Add Rectangle"
            >
              <FontAwesomeIcon icon="far fa-square" size={20} />
              <span className="text-xs mt-1">Rectangle</span>
            </button>
            
            <button
              onClick={handleAddCircle}
              className="p-2 hover:bg-gray-100 rounded-md flex flex-col items-center"
              title="Add Circle"
            >
              <FontAwesomeIcon icon="far fa-circle" size={20} />
              <span className="text-xs mt-1">Circle</span>
            </button>
            
            <button
              onClick={handleAddPolygon}
              className="p-2 hover:bg-gray-100 rounded-md flex flex-col items-center"
              title="Add Polygon"
            >
              <FontAwesomeIcon icon="fas fa-stop" size={20} />
              <span className="text-xs mt-1">Polygon</span>
            </button>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-xs font-medium">Colors</h4>
            <div className="grid grid-cols-5 gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full ${selectedColor === color ? 'ring-2 ring-blue-500' : ''}`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
import React from 'react';
import { useFloorPlanViewerStore } from '../../store/floorPlanViewerStore';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';

export const FloorNavigation: React.FC = () => {
  const {
    currentFloor,
    floorLevels,
    setCurrentFloor,
    getCurrentFloorCompanies,
    getFeaturedCompanies
  } = useFloorPlanViewerStore();

  const currentFloorCompanies = getCurrentFloorCompanies();
  const featuredCompanies = getFeaturedCompanies();

  const handleFloorChange = (floor: number) => {
    setCurrentFloor(floor);
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Floor Navigation</h3>
        <p className="text-sm text-gray-500">
          Select a floor to view booths and companies
        </p>
      </div>

      {/* Floor Level Buttons */}
      <div className="p-4 border-b border-gray-200">
        <div className="space-y-2">
          {floorLevels.map((floor) => (
            <button
              key={floor.id}
              onClick={() => handleFloorChange(floor.level)}
              className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left
                ${currentFloor === floor.level
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{floor.name}</div>
                  <div className="text-sm text-gray-500">
                    Level {floor.level}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {currentFloor === floor.level && (
                    <FontAwesomeIcon 
                      icon="check-circle" 
                      className="w-5 h-5 text-blue-500" 
                    />
                  )}
                  <FontAwesomeIcon 
                    icon="chevron-right" 
                    className={`w-4 h-4 transition-colors ${
                      currentFloor === floor.level ? 'text-blue-500' : 'text-gray-400'
                    }`} 
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Floor Stats */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Current Floor Stats</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Companies</span>
            <span className="font-semibold text-gray-900">
              {currentFloorCompanies.length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Featured Companies</span>
            <span className="font-semibold text-purple-600">
              {featuredCompanies.length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Available Booths</span>
            <span className="font-semibold text-green-600">
              {Math.max(0, 5 - currentFloorCompanies.length)}
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Legend</h4>
        <div className="space-y-2">
          <LegendItem
            color="bg-green-500"
            label="Available Booths"
            count={Math.max(0, 5 - currentFloorCompanies.length)}
          />
          <LegendItem
            color="bg-purple-500"
            label="Featured Companies"
            count={featuredCompanies.length}
          />
          <LegendItem
            color="bg-blue-500"
            label="Occupied Booths"
            count={currentFloorCompanies.length}
          />
          <LegendItem
            color="bg-gray-400"
            label="Reserved Booths"
            count={0}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 flex-1">
        <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
        <div className="space-y-2">
          <button className="w-full p-2 text-left text-sm text-gray-600 hover:bg-gray-50 
            rounded-lg transition-colors flex items-center gap-2">
            <FontAwesomeIcon icon="download" className="w-4 h-4" />
            Export Floor Plan
          </button>
          <button className="w-full p-2 text-left text-sm text-gray-600 hover:bg-gray-50 
            rounded-lg transition-colors flex items-center gap-2">
            <FontAwesomeIcon icon="print" className="w-4 h-4" />
            Print Floor Plan
          </button>
          <button className="w-full p-2 text-left text-sm text-gray-600 hover:bg-gray-50 
            rounded-lg transition-colors flex items-center gap-2">
            <FontAwesomeIcon icon="share" className="w-4 h-4" />
            Share Floor Plan
          </button>
        </div>
      </div>
    </div>
  );
};

interface LegendItemProps {
  color: string;
  label: string;
  count: number;
}

const LegendItem: React.FC<LegendItemProps> = ({ color, label, count }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-medium text-gray-900">{count}</span>
    </div>
  );
};
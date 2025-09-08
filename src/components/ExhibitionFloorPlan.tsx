import React, { useState } from 'react';
import './ExhibitionFloorPlan.css';

interface Booth {
  id: string;
  name: string;
  status: 'available' | 'onhold' | 'reserved';
  x: number;
  y: number;
  width: number;
  height: number;
  section?: string;
}

const ExhibitionFloorPlan: React.FC = () => {
  const [selectedBooth, setSelectedBooth] = useState<string | null>(null);

  const booths: Booth[] = [
    // Sustainable Construction Section
    { id: 'fertile', name: 'Fertile', status: 'reserved', x: 345, y: 140, width: 60, height: 40, section: 'sustainable' },
    { id: 'ecofin', name: 'EcoFin', status: 'reserved', x: 285, y: 165, width: 50, height: 35, section: 'sustainable' },
    { id: 'ecospa', name: 'EcoSpa', status: 'reserved', x: 395, y: 190, width: 50, height: 35, section: 'sustainable' },
    { id: 'smartte', name: 'SmartTe', status: 'reserved', x: 285, y: 230, width: 60, height: 35, section: 'sustainable' },
    
    // Waste Management Section
    { id: 'bioma', name: 'Bioma', status: 'reserved', x: 780, y: 65, width: 50, height: 35, section: 'waste' },
    { id: 'future', name: 'Future', status: 'reserved', x: 845, y: 65, width: 50, height: 35, section: 'waste' },
    { id: 'nexgo', name: 'NexGo', status: 'reserved', x: 780, y: 115, width: 50, height: 35, section: 'waste' },
    { id: 'terram', name: 'Terram', status: 'reserved', x: 875, y: 115, width: 50, height: 35, section: 'waste' },
    { id: 'bioly', name: 'Bioly', status: 'reserved', x: 780, y: 165, width: 40, height: 30, section: 'waste' },
    { id: 'evergreen', name: 'EverGreen', status: 'reserved', x: 780, y: 230, width: 65, height: 35, section: 'waste' },
    { id: 'ecome-ecoso', name: 'EcoMe EcoSo', status: 'reserved', x: 850, y: 230, width: 75, height: 35, section: 'waste' },
    
    // Available booths (light green)
    { id: 'available-1', name: '', status: 'available', x: 105, y: 145, width: 70, height: 50 },
    { id: 'available-2', name: '', status: 'available', x: 105, y: 200, width: 70, height: 50 },
    { id: 'available-3', name: '', status: 'available', x: 180, y: 145, width: 70, height: 50 },
    { id: 'available-4', name: '', status: 'available', x: 180, y: 200, width: 70, height: 50 },
    { id: 'available-5', name: '', status: 'available', x: 520, y: 315, width: 80, height: 40 },
    
    // On hold booths (white/light gray)
    { id: 'onhold-1', name: '', status: 'onhold', x: 250, y: 140, width: 30, height: 30 },
    { id: 'onhold-2', name: '', status: 'onhold', x: 410, y: 140, width: 30, height: 30 },
    { id: 'onhold-3', name: '', status: 'onhold', x: 450, y: 140, width: 30, height: 30 },
    { id: 'onhold-4', name: '', status: 'onhold', x: 490, y: 140, width: 30, height: 30 },
    { id: 'onhold-5', name: '', status: 'onhold', x: 250, y: 175, width: 30, height: 30 },
    { id: 'onhold-6', name: '', status: 'onhold', x: 410, y: 175, width: 30, height: 30 },
    { id: 'onhold-7', name: '', status: 'onhold', x: 450, y: 175, width: 30, height: 30 },
    { id: 'onhold-8', name: '', status: 'onhold', x: 490, y: 175, width: 30, height: 30 },
    { id: 'onhold-9', name: '', status: 'onhold', x: 410, y: 210, width: 30, height: 30 },
    { id: 'onhold-10', name: '', status: 'onhold', x: 450, y: 210, width: 30, height: 30 },
    { id: 'onhold-11', name: '', status: 'onhold', x: 490, y: 210, width: 30, height: 30 },
    
    // Reserved booths (dark green)
    { id: 'reserved-1', name: '', status: 'reserved', x: 990, y: 225, width: 25, height: 40 },
  ];

  const handleBoothClick = (boothId: string) => {
    setSelectedBooth(boothId);
  };

  return (
    <div className="exhibition-floor-plan">
      <div className="floor-plan-container">
        {/* Background grid and structure */}
        <div className="floor-background">
          {/* Blue pathway */}
          <svg className="pathway-overlay" viewBox="0 0 1200 600">
            <path
              d="M 650 0 L 650 180 Q 650 200 670 200 L 680 200 Q 700 200 700 220 L 700 380 Q 700 400 680 400 L 520 400 Q 500 400 500 420 L 500 600"
              stroke="#4A90E2"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="680" cy="180" r="8" fill="#4A90E2" />
            <circle cx="500" cy="520" r="8" fill="#4A90E2" />
          </svg>
          
          {/* Section labels */}
          <div className="section-label sustainable-section">
            <span>Sustainable Construction</span>
          </div>
          <div className="section-label waste-section">
            <span>Waste Management</span>
          </div>
          
          {/* PIAZZA area */}
          <div className="piazza-area">
            <span>PIAZZA</span>
          </div>
          
          {/* Hall indicator */}
          <div className="hall-indicator">
            <span>HALL</span>
            <span className="hall-number">3.1</span>
          </div>
          
          {/* Booths */}
          {booths.map((booth) => (
            <div
              key={booth.id}
              className={`booth booth-${booth.status} ${selectedBooth === booth.id ? 'selected' : ''}`}
              style={{
                left: `${booth.x}px`,
                top: `${booth.y}px`,
                width: `${booth.width}px`,
                height: `${booth.height}px`,
              }}
              onClick={() => handleBoothClick(booth.id)}
            >
              {booth.name && <span className="booth-label">{booth.name}</span>}
            </div>
          ))}
          
          {/* Legend */}
          <div className="legend">
            <div className="legend-item">
              <div className="legend-color available"></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="legend-color onhold"></div>
              <span>On Hold</span>
            </div>
            <div className="legend-item">
              <div className="legend-color reserved"></div>
              <span>Reserved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExhibitionFloorPlan;
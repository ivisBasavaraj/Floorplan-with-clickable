import React from 'react';
import LeafletFloorPlanDesigner from '../components/LeafletFloorPlanDesigner';

const FloorPlanDesignerDemo: React.FC = () => {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <LeafletFloorPlanDesigner />
    </div>
  );
};

export default FloorPlanDesignerDemo;
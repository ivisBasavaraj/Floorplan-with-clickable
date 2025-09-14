import React from 'react';
import EnhancedLeafletMap from '../components/EnhancedLeafletMap';

const EnhancedMapDemo: React.FC = () => {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <EnhancedLeafletMap />
    </div>
  );
};

export default EnhancedMapDemo;
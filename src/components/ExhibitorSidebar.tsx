import React from 'react';
import './ExhibitionFloorPlan.css';

interface Exhibitor {
  id: string;
  name: string;
  company: string;
  description: string;
  logo: string;
  contact: string;
}

interface ExhibitorSidebarProps {
  exhibitor: Exhibitor | null;
  isVisible: boolean;
  onClose: () => void;
}

const ExhibitorSidebar: React.FC<ExhibitorSidebarProps> = ({ exhibitor, isVisible, onClose }) => {
  return (
    <div className={`sidebar ${isVisible ? 'active' : ''}`}>
      <button className="close-btn" onClick={onClose}>×</button>
      
      {exhibitor ? (
        <>
          <div className="sidebar-header">
            <img src={exhibitor.logo} alt={exhibitor.name} />
            <h2>{exhibitor.name}</h2>
            <h4>{exhibitor.company}</h4>
          </div>
          
          <div className="sidebar-content">
            <section>
              <strong>Description:</strong>
              <p>{exhibitor.description}</p>
            </section>
            
            <section>
              <strong>Contact:</strong>
              <p>{exhibitor.contact}</p>
            </section>
          </div>
          
          <div className="sidebar-footer">
            <button className="btn-primary">Visit Website</button>
            <button className="btn-secondary">Contact</button>
          </div>
        </>
      ) : (
        <div className="sidebar-content">
          <p>Details not available</p>
        </div>
      )}
    </div>
  );
};

export default ExhibitorSidebar;
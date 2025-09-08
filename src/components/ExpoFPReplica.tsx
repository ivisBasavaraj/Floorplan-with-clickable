import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from './icons/FontAwesomeIcon';
import './ExpoFPReplica.css';

interface Booth {
  id: string;
  number: string;
  x: number;
  y: number;
  width: number;
  height: number;
  status: 'available' | 'occupied' | 'reserved';
  company?: string;
  category?: string;
}

interface Exhibitor {
  id: string;
  name: string;
  booth: string;
  category: string;
  description: string;
  logo?: string;
  website?: string;
}

export const ExpoFPReplica: React.FC = () => {
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const booths: Booth[] = [
    { id: '1', number: '101', x: 120, y: 120, width: 100, height: 80, status: 'occupied', company: 'TechCorp', category: 'Technology' },
    { id: '2', number: '102', x: 240, y: 120, width: 100, height: 80, status: 'available', category: 'Technology' },
    { id: '3', number: '103', x: 360, y: 120, width: 100, height: 80, status: 'occupied', company: 'InnovateLab', category: 'Innovation' },
    { id: '4', number: '201', x: 120, y: 220, width: 100, height: 80, status: 'occupied', company: 'GreenTech', category: 'Sustainability' },
    { id: '5', number: '202', x: 240, y: 220, width: 100, height: 80, status: 'occupied', company: 'DataFlow', category: 'Analytics' },
    { id: '6', number: '203', x: 360, y: 220, width: 100, height: 80, status: 'available', category: 'Technology' },
    { id: '7', number: '301', x: 120, y: 320, width: 100, height: 80, status: 'occupied', company: 'CloudSys', category: 'Cloud' },
    { id: '8', number: '302', x: 240, y: 320, width: 100, height: 80, status: 'occupied', company: 'AI Solutions', category: 'AI/ML' },
    { id: '9', number: '303', x: 360, y: 320, width: 100, height: 80, status: 'available', category: 'Technology' },
  ];

  const exhibitors: Exhibitor[] = [
    { id: '1', name: 'TechCorp Solutions', booth: '101', category: 'Technology', description: 'Leading provider of enterprise software solutions', website: 'https://techcorp.com' },
    { id: '2', name: 'InnovateLab', booth: '103', category: 'Innovation', description: 'Cutting-edge research and development company', website: 'https://innovatelab.com' },
    { id: '3', name: 'GreenTech Industries', booth: '201', category: 'Sustainability', description: 'Sustainable technology solutions for the future', website: 'https://greentech.com' },
    { id: '4', name: 'DataFlow Analytics', booth: '202', category: 'Analytics', description: 'Advanced data analytics and business intelligence', website: 'https://dataflow.com' },
    { id: '5', name: 'CloudSys', booth: '301', category: 'Cloud', description: 'Cloud infrastructure and services provider', website: 'https://cloudsys.com' },
    { id: '6', name: 'AI Solutions Inc', booth: '302', category: 'AI/ML', description: 'Artificial intelligence and machine learning solutions', website: 'https://aisolutions.com' }
  ];

  const filteredExhibitors = exhibitors.filter(exhibitor =>
    exhibitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exhibitor.booth.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exhibitor.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBoothClick = (booth: Booth) => {
    setSelectedBooth(booth);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.max(0.5, Math.min(2, prev + delta)));
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="expofp-replica">
      {/* Left Sidebar */}
      <div className="expofp-sidebar">
        <div className="sidebar-header">
          <h2>Exhibitors</h2>
          <span className="exhibitor-count">{filteredExhibitors.length} exhibitors</span>
        </div>

        <div className="search-container">
          <div className="search-wrapper">
            <FontAwesomeIcon icon="fas fa-search" className="search-icon" />
            <input
              type="text"
              placeholder="Search exhibitors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="clear-btn">
                <FontAwesomeIcon icon="fas fa-times" />
              </button>
            )}
          </div>
        </div>

        <div className="exhibitor-list">
          {filteredExhibitors.map(exhibitor => (
            <div
              key={exhibitor.id}
              className="exhibitor-item"
              onClick={() => {
                const booth = booths.find(b => b.number === exhibitor.booth);
                if (booth) handleBoothClick(booth);
              }}
            >
              <div className="exhibitor-logo">
                {exhibitor.logo ? (
                  <img src={exhibitor.logo} alt={exhibitor.name} />
                ) : (
                  <div className="logo-placeholder">
                    {exhibitor.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="exhibitor-info">
                <h3>{exhibitor.name}</h3>
                <div className="exhibitor-meta">
                  <span className="booth-tag">Booth {exhibitor.booth}</span>
                  <span className="category-tag">{exhibitor.category}</span>
                </div>
                <p className="exhibitor-desc">{exhibitor.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Canvas */}
      <div className="expofp-main">
        <div className="canvas-controls">
          <div className="zoom-controls">
            <button onClick={() => handleZoom(0.1)} className="zoom-btn">
              <FontAwesomeIcon icon="fas fa-plus" />
            </button>
            <button onClick={() => handleZoom(-0.1)} className="zoom-btn">
              <FontAwesomeIcon icon="fas fa-minus" />
            </button>
            <button onClick={resetView} className="reset-btn">
              <FontAwesomeIcon icon="fas fa-expand-arrows-alt" />
            </button>
          </div>
        </div>

        <div className="canvas-container">
          <div
            className="canvas-viewport"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`
            }}
          >
            <div className="floor-plan">
              {booths.map(booth => (
                <div
                  key={booth.id}
                  className={`booth ${booth.status} ${selectedBooth?.id === booth.id ? 'selected' : ''}`}
                  style={{
                    left: `${booth.x}px`,
                    top: `${booth.y}px`,
                    width: `${booth.width}px`,
                    height: `${booth.height}px`
                  }}
                  onClick={() => handleBoothClick(booth)}
                >
                  <div className="booth-number">{booth.number}</div>
                  {booth.company && (
                    <div className="booth-company">{booth.company}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booth Modal */}
      {selectedBooth && (
        <div className="booth-modal-overlay" onClick={() => setSelectedBooth(null)}>
          <div className="booth-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Booth {selectedBooth.number}</h3>
              <button onClick={() => setSelectedBooth(null)} className="close-btn">
                <FontAwesomeIcon icon="fas fa-times" />
              </button>
            </div>
            <div className="modal-content">
              {selectedBooth.company ? (
                <>
                  <h4>{selectedBooth.company}</h4>
                  <p>Status: <span className={`status ${selectedBooth.status}`}>
                    {selectedBooth.status.charAt(0).toUpperCase() + selectedBooth.status.slice(1)}
                  </span></p>
                  <div className="modal-actions">
                    <button className="btn-primary">
                      <FontAwesomeIcon icon="fas fa-route" />
                      Get Directions
                    </button>
                    <button className="btn-secondary">
                      <FontAwesomeIcon icon="fas fa-info-circle" />
                      More Info
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>Status: <span className={`status ${selectedBooth.status}`}>
                    {selectedBooth.status.charAt(0).toUpperCase() + selectedBooth.status.slice(1)}
                  </span></p>
                  {selectedBooth.status === 'available' && (
                    <div className="modal-actions">
                      <button className="btn-primary">
                        <FontAwesomeIcon icon="fas fa-shopping-cart" />
                        Book This Booth
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
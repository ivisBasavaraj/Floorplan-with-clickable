import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from './icons/FontAwesomeIcon';
import './ExpoFloorPlanDemo.css';

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
  featured?: boolean;
}

export const ExpoFloorPlanDemo: React.FC = () => {
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Sample booth data
  const booths: Booth[] = [
    { id: '1', number: 'A01', x: 100, y: 100, width: 80, height: 60, status: 'occupied', company: 'TechCorp', category: 'Technology' },
    { id: '2', number: 'A02', x: 200, y: 100, width: 80, height: 60, status: 'available', category: 'Technology' },
    { id: '3', number: 'A03', x: 300, y: 100, width: 80, height: 60, status: 'reserved', company: 'InnovateLab', category: 'Innovation' },
    { id: '4', number: 'B01', x: 100, y: 200, width: 80, height: 60, status: 'occupied', company: 'GreenTech', category: 'Sustainability' },
    { id: '5', number: 'B02', x: 200, y: 200, width: 80, height: 60, status: 'occupied', company: 'DataFlow', category: 'Analytics' },
    { id: '6', number: 'B03', x: 300, y: 200, width: 80, height: 60, status: 'available', category: 'Technology' },
    { id: '7', number: 'C01', x: 100, y: 300, width: 80, height: 60, status: 'occupied', company: 'CloudSys', category: 'Cloud' },
    { id: '8', number: 'C02', x: 200, y: 300, width: 80, height: 60, status: 'reserved', company: 'AI Solutions', category: 'AI/ML' },
    { id: '9', number: 'C03', x: 300, y: 300, width: 80, height: 60, status: 'available', category: 'Technology' },
  ];

  // Sample exhibitor data
  const exhibitors: Exhibitor[] = [
    {
      id: '1',
      name: 'TechCorp Solutions',
      booth: 'A01',
      category: 'Technology',
      description: 'Leading provider of enterprise software solutions',
      featured: true,
      website: 'https://techcorp.com'
    },
    {
      id: '2',
      name: 'InnovateLab',
      booth: 'A03',
      category: 'Innovation',
      description: 'Cutting-edge research and development company',
      website: 'https://innovatelab.com'
    },
    {
      id: '3',
      name: 'GreenTech Industries',
      booth: 'B01',
      category: 'Sustainability',
      description: 'Sustainable technology solutions for the future',
      featured: true,
      website: 'https://greentech.com'
    },
    {
      id: '4',
      name: 'DataFlow Analytics',
      booth: 'B02',
      category: 'Analytics',
      description: 'Advanced data analytics and business intelligence',
      website: 'https://dataflow.com'
    },
    {
      id: '5',
      name: 'CloudSys',
      booth: 'C01',
      category: 'Cloud',
      description: 'Cloud infrastructure and services provider',
      website: 'https://cloudsys.com'
    },
    {
      id: '6',
      name: 'AI Solutions Inc',
      booth: 'C02',
      category: 'AI/ML',
      description: 'Artificial intelligence and machine learning solutions',
      featured: true,
      website: 'https://aisolutions.com'
    }
  ];

  const categories = ['all', 'Technology', 'Innovation', 'Sustainability', 'Analytics', 'Cloud', 'AI/ML'];

  const filteredExhibitors = exhibitors.filter(exhibitor => {
    const matchesSearch = exhibitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exhibitor.booth.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exhibitor.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || exhibitor.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBoothClick = (booth: Booth) => {
    setSelectedBooth(booth);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="expo-floor-plan">
      {/* Header */}
      <header className="expo-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="expo-title">
              <FontAwesomeIcon icon="fas fa-map" className="title-icon" />
              Tech Expo 2024
            </h1>
            <p className="expo-subtitle">Interactive Floor Plan</p>
          </div>
          
          <div className="header-controls">
            <div className="view-toggle">
              <button
                className={`toggle-btn ${viewMode === '2d' ? 'active' : ''}`}
                onClick={() => setViewMode('2d')}
              >
                <FontAwesomeIcon icon="fas fa-th" />
                2D
              </button>
              <button
                className={`toggle-btn ${viewMode === '3d' ? 'active' : ''}`}
                onClick={() => setViewMode('3d')}
              >
                <FontAwesomeIcon icon="fas fa-cube" />
                3D
              </button>
            </div>
            
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FontAwesomeIcon icon={sidebarOpen ? "fas fa-times" : "fas fa-bars"} />
            </button>
          </div>
        </div>
      </header>

      <div className="expo-content">
        {/* Sidebar */}
        <aside className={`expo-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <h2>Exhibitors</h2>
            <span className="exhibitor-count">{filteredExhibitors.length} companies</span>
          </div>

          {/* Search */}
          <div className="search-section">
            <div className="search-input-wrapper">
              <FontAwesomeIcon icon="fas fa-search" className="search-icon" />
              <input
                type="text"
                placeholder="Search companies, booths..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="clear-search"
                >
                  <FontAwesomeIcon icon="fas fa-times" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="filter-section">
            <label className="filter-label">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Exhibitor List */}
          <div className="exhibitor-list">
            {filteredExhibitors.map(exhibitor => (
              <div
                key={exhibitor.id}
                className={`exhibitor-card ${exhibitor.featured ? 'featured' : ''}`}
                onClick={() => {
                  const booth = booths.find(b => b.number === exhibitor.booth);
                  if (booth) handleBoothClick(booth);
                }}
              >
                <div className="exhibitor-header">
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
                    <h3 className="exhibitor-name">{exhibitor.name}</h3>
                    <div className="exhibitor-meta">
                      <span className="booth-number">Booth {exhibitor.booth}</span>
                      <span className="category-tag">{exhibitor.category}</span>
                    </div>
                  </div>
                  {exhibitor.featured && (
                    <div className="featured-badge">
                      <FontAwesomeIcon icon="fas fa-star" />
                    </div>
                  )}
                </div>
                <p className="exhibitor-description">{exhibitor.description}</p>
                {exhibitor.website && (
                  <a
                    href={exhibitor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="exhibitor-website"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FontAwesomeIcon icon="fas fa-external-link-alt" />
                    Visit Website
                  </a>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Main Floor Plan */}
        <main className="floor-plan-main">
          {/* Controls */}
          <div className="floor-plan-controls">
            <div className="zoom-controls">
              <button onClick={() => handleZoom(0.1)} className="zoom-btn" title="Zoom In">
                <FontAwesomeIcon icon="fas fa-plus" />
              </button>
              <button onClick={() => handleZoom(-0.1)} className="zoom-btn" title="Zoom Out">
                <FontAwesomeIcon icon="fas fa-minus" />
              </button>
              <button onClick={resetView} className="reset-btn" title="Reset View">
                <FontAwesomeIcon icon="fas fa-expand-arrows-alt" />
              </button>
            </div>

            <div className="legend">
              <div className="legend-item">
                <div className="legend-color available"></div>
                <span>Available</span>
              </div>
              <div className="legend-item">
                <div className="legend-color occupied"></div>
                <span>Occupied</span>
              </div>
              <div className="legend-item">
                <div className="legend-color reserved"></div>
                <span>Reserved</span>
              </div>
            </div>
          </div>

          {/* Floor Plan Canvas */}
          <div className="floor-plan-canvas">
            <div
              className="floor-plan-viewport"
              style={{
                transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`
              }}
            >
              {/* Floor Plan Background */}
              <div className="floor-background">
                <div className="grid-pattern"></div>
                
                {/* Hall Labels */}
                <div className="hall-label" style={{ top: '50px', left: '150px' }}>
                  Hall A
                </div>
                <div className="hall-label" style={{ top: '150px', left: '150px' }}>
                  Hall B
                </div>
                <div className="hall-label" style={{ top: '250px', left: '150px' }}>
                  Hall C
                </div>

                {/* Pathways */}
                <div className="pathway horizontal" style={{ top: '80px', left: '50px', width: '400px' }}></div>
                <div className="pathway horizontal" style={{ top: '180px', left: '50px', width: '400px' }}></div>
                <div className="pathway horizontal" style={{ top: '280px', left: '50px', width: '400px' }}></div>
                <div className="pathway vertical" style={{ top: '50px', left: '80px', height: '300px' }}></div>
                <div className="pathway vertical" style={{ top: '50px', left: '400px', height: '300px' }}></div>

                {/* Booths */}
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

                {/* Facilities */}
                <div className="facility entrance" style={{ top: '20px', left: '200px' }}>
                  <FontAwesomeIcon icon="fas fa-door-open" />
                  <span>Entrance</span>
                </div>
                <div className="facility restroom" style={{ top: '380px', left: '100px' }}>
                  <FontAwesomeIcon icon="fas fa-restroom" />
                  <span>Restrooms</span>
                </div>
                <div className="facility cafe" style={{ top: '380px', left: '300px' }}>
                  <FontAwesomeIcon icon="fas fa-coffee" />
                  <span>Food Court</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Booth Details Modal */}
      {selectedBooth && (
        <div className="booth-modal-overlay" onClick={() => setSelectedBooth(null)}>
          <div className="booth-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Booth {selectedBooth.number}</h3>
              <button
                onClick={() => setSelectedBooth(null)}
                className="close-modal"
              >
                <FontAwesomeIcon icon="fas fa-times" />
              </button>
            </div>
            <div className="modal-content">
              {selectedBooth.company ? (
                <>
                  <h4>{selectedBooth.company}</h4>
                  <p className="booth-status">
                    Status: <span className={`status-text ${selectedBooth.status}`}>
                      {selectedBooth.status.charAt(0).toUpperCase() + selectedBooth.status.slice(1)}
                    </span>
                  </p>
                  <p>Category: {selectedBooth.category}</p>
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
                  <p className="booth-status">
                    Status: <span className={`status-text ${selectedBooth.status}`}>
                      {selectedBooth.status.charAt(0).toUpperCase() + selectedBooth.status.slice(1)}
                    </span>
                  </p>
                  {selectedBooth.status === 'available' && (
                    <div className="modal-actions">
                      <button className="btn-primary">
                        <FontAwesomeIcon icon="fas fa-shopping-cart" />
                        Book This Booth
                      </button>
                      <button className="btn-secondary">
                        <FontAwesomeIcon icon="fas fa-info-circle" />
                        More Info
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile Search Bar */}
      <div className="mobile-search">
        <div className="search-input-wrapper">
          <FontAwesomeIcon icon="fas fa-search" className="search-icon" />
          <input
            type="text"
            placeholder="Search companies, booths..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="clear-search"
            >
              <FontAwesomeIcon icon="fas fa-times" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
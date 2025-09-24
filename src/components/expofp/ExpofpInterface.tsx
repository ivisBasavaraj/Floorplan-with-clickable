import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';
import { useCanvasStore } from '../../store/canvasStore';
import { ViewMode2D } from '../preview/ViewMode2D';
import { ViewMode3D } from '../preview/ViewMode3D';
import { publicFloorPlanAPI } from '../../services/api';
import { BoothElement } from '../../types/canvas';
import { generateSVGPlaceholder, PLACEHOLDER_CONFIGS } from '../../utils/placeholderUtils';
import './ExpofpInterface.css';

interface Company {
  id: string;
  name: string;
  booth_number: string;
  category: string;
  description?: string;
  logo?: string;
  featured: boolean;
  status: 'available' | 'occupied' | 'reserved';
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

interface FloorPlan {
  id: string;
  name: string;
  description?: string;
  state?: any;
}

export const ExpofpInterface: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [selectedFloorPlan, setSelectedFloorPlan] = useState<FloorPlan | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedBooth, setSelectedBooth] = useState<BoothElement | null>(null);
  const [hoveredCompany, setHoveredCompany] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Canvas store
  const { elements, loadFloorPlan, setViewerMode } = useCanvasStore();

  // Get initial view mode from URL
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === '2d' || mode === '3d') {
      setViewMode(mode);
    }
  }, [searchParams]);

  // Set viewer mode
  useEffect(() => {
    setViewerMode(viewMode);
    return () => setViewerMode('editor');
  }, [viewMode, setViewerMode]);

  // Load data
  useEffect(() => {
    loadFloorPlans();
  }, []);

  // Load specific floor plan
  useEffect(() => {
    if (id && floorPlans.length > 0) {
      const plan = floorPlans.find(fp => fp.id === id);
      if (plan) {
        loadFloorPlanDetails(plan);
      }
    } else if (!id && floorPlans.length > 0) {
      loadFloorPlanDetails(floorPlans[0]);
    }
  }, [id, floorPlans]);

  // Generate companies from booth elements
  useEffect(() => {
    if (elements.length > 0) {
      generateCompaniesFromBooths();
    }
  }, [elements]);

  // Filter companies
  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const matchesSearch = searchTerm === '' || 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.booth_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || company.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [companies, searchTerm, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(companies.map(c => c.category))];
    return cats;
  }, [companies]);

  const loadFloorPlans = async () => {
    try {
      setLoading(true);
      const result = await publicFloorPlanAPI.getPublicFloorPlans();
      
      if (result.success) {
        const plans = result.data.floorplans || [];
        setFloorPlans(plans);
      }
    } catch (error) {
      console.error('Failed to load floor plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFloorPlanDetails = async (plan: FloorPlan) => {
    try {
      setSelectedFloorPlan(plan);
      const result = await publicFloorPlanAPI.getPublicFloorPlan(plan.id);
      
      if (result.success && result.data.floorplan?.state) {
        loadFloorPlan(result.data.floorplan.state);
      }
    } catch (error) {
      console.error('Failed to load floor plan details:', error);
    }
  };

  const generateCompaniesFromBooths = () => {
    const boothElements = elements.filter(el => el.type === 'booth') as BoothElement[];
    
    const companyNames = [
      'TechCorp Solutions', 'InnovateLab', 'GreenTech Industries', 'DataFlow Analytics',
      'CloudSys', 'AI Solutions Inc', 'Digital Marketing Pro', 'Healthcare Innovations',
      'Financial Services Group', 'Education Tech', 'Smart Manufacturing', 'Retail Excellence'
    ];

    const categories = [
      'Technology', 'Innovation', 'Sustainability', 'Analytics', 
      'Cloud Services', 'AI/ML', 'Marketing', 'Healthcare',
      'Finance', 'Education', 'Manufacturing', 'Retail'
    ];

    const companiesFromBooths: Company[] = boothElements.map((booth, index) => {
      const name = companyNames[index % companyNames.length] || `Company ${booth.number}`;
      const category = categories[index % categories.length];
      const featured = index < 3; // First 3 are featured
      const statuses: Company['status'][] = ['occupied', 'reserved', 'available'];
      const status = statuses[index % 3];
      
      return {
        id: booth.id,
        name,
        booth_number: booth.number,
        category,
        featured,
        status,
        logo: generateSVGPlaceholder({
          ...PLACEHOLDER_CONFIGS.company,
          backgroundColor: status === 'occupied' ? '#3b82f6' : 
                          status === 'reserved' ? '#f59e0b' : '#10b981',
          text: name.charAt(0)
        }),
        description: `${name} - Leading provider of ${category.toLowerCase()} solutions`,
        contact: {
          email: `info@${name.toLowerCase().replace(/\s+/g, '')}.com`,
          website: `https://${name.toLowerCase().replace(/\s+/g, '')}.com`,
          phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`
        }
      };
    });
    
    setCompanies(companiesFromBooths);
  };

  const handleBoothClick = (boothId: string) => {
    const booth = elements.find(
      (element) => element.id === boothId && element.type === 'booth'
    ) as BoothElement | undefined;
    
    if (booth) {
      setSelectedBooth(booth);
    }
  };

  const handleCompanyClick = (company: Company) => {
    const boothElement = elements.find(
      (element) => element.type === 'booth' && 
      (element as BoothElement).number === company.booth_number
    ) as BoothElement | undefined;
    
    if (boothElement) {
      setSelectedBooth(boothElement);
    }
  };

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const resetView = () => {
    setZoomLevel(1);
  };

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="search-highlight">
          {part}
        </span>
      ) : part
    );
  };

  if (loading) {
    return (
      <div className="expofp-interface">
        <div className="expofp-loading">
          <div className="loading-spinner"></div>
          <span>Loading exhibition floor plan...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="expofp-interface">
      {/* ExpofP Header */}
      <header className="expofp-header">
        <div className="header-content">
          <div className="header-left">
            <div className="expo-logo">
              <FontAwesomeIcon icon="fas fa-map" className="logo-icon" />
            </div>
            <div className="expo-info">
              <h1 className="expo-title">
                {selectedFloorPlan?.name || 'Tech Expo 2024'}
              </h1>
              <p className="expo-subtitle">Interactive Floor Plan</p>
            </div>
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

      <div className="expofp-content">
        {/* ExpofP Sidebar */}
        <aside className={`expofp-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <h2>Exhibitors</h2>
            <span className="exhibitor-count">{filteredCompanies.length} companies</span>
          </div>

          {/* Search Section */}
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

          {/* Company List */}
          <div className="exhibitor-list">
            {filteredCompanies.map(company => (
              <div
                key={company.id}
                className={`exhibitor-card ${company.featured ? 'featured' : ''} ${hoveredCompany === company.id ? 'hovered' : ''}`}
                onClick={() => handleCompanyClick(company)}
                onMouseEnter={() => setHoveredCompany(company.id)}
                onMouseLeave={() => setHoveredCompany(null)}
              >
                <div className="exhibitor-header">
                  <div className="exhibitor-logo">
                    <img
                      src={company.logo}
                      alt={company.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = generateSVGPlaceholder({
                          ...PLACEHOLDER_CONFIGS.company,
                          text: company.name.charAt(0)
                        });
                      }}
                    />
                  </div>
                  <div className="exhibitor-info">
                    <h3 className="exhibitor-name">
                      {highlightSearchTerm(company.name, searchTerm)}
                    </h3>
                    <div className="exhibitor-meta">
                      <span className="booth-number">
                        Booth {highlightSearchTerm(company.booth_number, searchTerm)}
                      </span>
                      <span className="category-tag">
                        {highlightSearchTerm(company.category, searchTerm)}
                      </span>
                    </div>
                  </div>
                  {company.featured && (
                    <div className="featured-badge">
                      <FontAwesomeIcon icon="fas fa-star" />
                    </div>
                  )}
                </div>
                
                <p className="exhibitor-description">{company.description}</p>
                
                <div className="exhibitor-status">
                  <span className={`status-badge ${company.status}`}>
                    {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ExpofP Main Canvas */}
        <main className="expofp-main">
          {/* Canvas Controls */}
          <div className="canvas-controls">
            <div className="zoom-controls">
              <button 
                onClick={() => handleZoom(0.1)} 
                className="zoom-btn"
                title="Zoom In"
              >
                <FontAwesomeIcon icon="fas fa-plus" />
              </button>
              <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
              <button 
                onClick={() => handleZoom(-0.1)} 
                className="zoom-btn"
                title="Zoom Out"
              >
                <FontAwesomeIcon icon="fas fa-minus" />
              </button>
              <button 
                onClick={resetView} 
                className="reset-btn"
                title="Reset View"
              >
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
            {selectedFloorPlan ? (
              <>
                {viewMode === '2d' ? (
                  <ViewMode2D 
                    onBoothClick={handleBoothClick} 
                    selectedBoothId={selectedBooth?.id}
                  />
                ) : (
                  <ViewMode3D 
                    onBoothClick={handleBoothClick} 
                    selectedBoothId={selectedBooth?.id}
                  />
                )}
              </>
            ) : (
              <div className="expofp-loading">
                <div className="loading-spinner"></div>
                <span>Loading floor plan...</span>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ExpofP Booth Modal */}
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
              {(() => {
                const company = companies.find(c => c.booth_number === selectedBooth.number);
                return company ? (
                  <>
                    <div className="company-header">
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="company-logo"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = generateSVGPlaceholder({
                            ...PLACEHOLDER_CONFIGS.company,
                            text: company.name.charAt(0)
                          });
                        }}
                      />
                      <div className="company-info">
                        <h4>{company.name}</h4>
                        <p className="company-category">{company.category}</p>
                        <span className={`status-badge ${company.status}`}>
                          {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="company-description">{company.description}</p>
                    
                    {company.contact && (
                      <div className="contact-info">
                        {company.contact.phone && (
                          <div className="contact-item">
                            <FontAwesomeIcon icon="fas fa-phone" />
                            <span>{company.contact.phone}</span>
                          </div>
                        )}
                        {company.contact.email && (
                          <div className="contact-item">
                            <FontAwesomeIcon icon="fas fa-envelope" />
                            <a href={`mailto:${company.contact.email}`}>
                              {company.contact.email}
                            </a>
                          </div>
                        )}
                        {company.contact.website && (
                          <div className="contact-item">
                            <FontAwesomeIcon icon="fas fa-globe" />
                            <a href={company.contact.website} target="_blank" rel="noopener noreferrer">
                              Visit Website
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                    
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
                      Status: <span className="status-text available">Available</span>
                    </p>
                    <div className="modal-actions">
                      <button className="btn-primary">
                        <FontAwesomeIcon icon="fas fa-shopping-cart" />
                        Book This Booth
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
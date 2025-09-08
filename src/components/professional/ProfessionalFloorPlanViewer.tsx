import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';
import { useAuthStore } from '../../store/authStore';
import { publicFloorPlanAPI } from '../../services/api';
import { useCanvasStore } from '../../store/canvasStore';
import { ViewMode2D } from '../preview/ViewMode2D';
import { ViewMode3D } from '../preview/ViewMode3D';
import { ProfessionalBoothPopup } from './ProfessionalBoothPopup';
import { ProfessionalSponsorHeader } from './ProfessionalSponsorHeader';
import { BoothElement } from '../../types/canvas';
import '../../styles/ProfessionalFloorPlan.css';

interface FloorPlan {
  id: string;
  name: string;
  description?: string;
  created: string;
  last_modified: string;
  status: string;
  state?: any;
  booth_details?: any[];
  stats?: {
    total_booths: number;
    sold: number;
    available: number;
    reserved: number;
  };
}

interface Company {
  id: string;
  name: string;
  booth_number: string;
  floor: number;
  status: 'available' | 'sold' | 'reserved';
  category: string;
  description?: string;
  logo?: string;
  featured: boolean;
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  website?: string;
}

interface SponsorLogo {
  id: string;
  name: string;
  logo: string;
  website?: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
}

export const ProfessionalFloorPlanViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  
  // State management
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [selectedFloorPlan, setSelectedFloorPlan] = useState<FloorPlan | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sponsors, setSponsors] = useState<SponsorLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedBooth, setSelectedBooth] = useState<BoothElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredCompany, setHoveredCompany] = useState<string | null>(null);

  // Canvas store
  const { 
    elements, 
    loadFloorPlan, 
    setViewerMode,
    resetCanvas 
  } = useCanvasStore();

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get initial view mode from URL params
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === '2d' || mode === '3d') {
      setViewMode(mode);
    }
  }, [searchParams]);

  // Update URL when view mode changes
  useEffect(() => {
    if (selectedFloorPlan) {
      setSearchParams({ mode: viewMode });
    }
  }, [viewMode, selectedFloorPlan, setSearchParams]);

  // Set viewer mode when component mounts
  useEffect(() => {
    setViewerMode(viewMode);
    return () => setViewerMode('editor');
  }, [viewMode, setViewerMode]);

  useEffect(() => {
    loadFloorPlans();
    loadSponsorsFromBackend();
  }, []);

  // Load companies after elements are loaded
  useEffect(() => {
    if (elements.length > 0) {
      loadCompaniesFromBackend();
    }
  }, [elements]);

  // Load specific floor plan if ID is provided
  useEffect(() => {
    if (id && floorPlans.length > 0) {
      const plan = floorPlans.find(fp => fp.id === id);
      if (plan) {
        loadFloorPlanDetails(plan);
      }
    }
  }, [id, floorPlans]);

  // Filter companies based on search term and floor
  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const matchesSearch = searchTerm === '' || 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.booth_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFloor = company.floor === selectedFloor;
      
      return matchesSearch && matchesFloor;
    }).sort((a, b) => {
      // Featured companies first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [companies, searchTerm, selectedFloor]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredCompanies.length;
    const available = filteredCompanies.filter(c => c.status === 'available').length;
    const occupied = filteredCompanies.filter(c => c.status === 'sold').length;
    const reserved = filteredCompanies.filter(c => c.status === 'reserved').length;
    const featured = filteredCompanies.filter(c => c.featured).length;
    
    return { total, available, occupied, reserved, featured };
  }, [filteredCompanies]);

  const loadCompaniesFromBackend = async () => {
    try {
      const result = await publicFloorPlanAPI.getPublicCompanies();
      if (result.success && result.data.companies) {
        setCompanies(result.data.companies);
        return;
      }
    } catch (error) {
      console.log('Backend companies not available, using booth data from floor plan');
    }
    
    loadCompaniesFromFloorPlan();
  };

  const loadCompaniesFromFloorPlan = () => {
    const boothElements = elements.filter(el => el.type === 'booth') as BoothElement[];
    
    const companiesFromBooths: Company[] = boothElements.map((booth, index) => {
      const categories = ['Technology', 'Healthcare', 'Finance', 'Education', 'Energy', 'Marketing', 'Manufacturing', 'Retail'];
      const category = categories[index % categories.length];
      
      const companyNames = [
        'TechCorp Solutions', 'Green Energy Inc', 'Digital Marketing Pro', 'Healthcare Innovations',
        'Financial Services Group', 'Education Tech', 'Smart Manufacturing', 'Retail Excellence',
        'Data Analytics Pro', 'Cloud Solutions Inc', 'AI Innovations', 'Cyber Security Corp',
        'Mobile Tech Solutions', 'E-commerce Platform', 'Business Intelligence', 'Software Development Co'
      ];
      
      const name = companyNames[index % companyNames.length] || `Company ${booth.number}`;
      const featured = index < 4;
      const statuses: ('available' | 'sold' | 'reserved')[] = ['sold', 'reserved', 'available'];
      const status = statuses[index % 3];
      
      return {
        id: booth.id,
        name,
        booth_number: booth.number,
        floor: 1,
        category,
        featured,
        status,
        logo: `https://via.placeholder.com/48x48/${status === 'sold' ? '4299e1' : status === 'reserved' ? 'ed8936' : '48bb78'}/ffffff?text=${name.charAt(0)}`,
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

  const loadSponsorsFromBackend = async () => {
    try {
      const result = await publicFloorPlanAPI.getPublicSponsors();
      if (result.success && result.data.sponsors) {
        setSponsors(result.data.sponsors);
        return;
      }
    } catch (error) {
      console.log('Backend sponsors not available, using sample data');
    }
    
    const sampleSponsors: SponsorLogo[] = [
      { id: '1', name: 'Microsoft', logo: 'https://via.placeholder.com/120x40/0078d4/ffffff?text=Microsoft', website: 'https://microsoft.com', tier: 'platinum' },
      { id: '2', name: 'Google', logo: 'https://via.placeholder.com/120x40/4285f4/ffffff?text=Google', website: 'https://google.com', tier: 'platinum' },
      { id: '3', name: 'Amazon', logo: 'https://via.placeholder.com/120x40/ff9900/000000?text=Amazon', website: 'https://amazon.com', tier: 'gold' },
      { id: '4', name: 'Apple', logo: 'https://via.placeholder.com/120x40/000000/ffffff?text=Apple', website: 'https://apple.com', tier: 'gold' },
      { id: '5', name: 'IBM', logo: 'https://via.placeholder.com/120x40/1261fe/ffffff?text=IBM', website: 'https://ibm.com', tier: 'silver' }
    ];
    
    setSponsors(sampleSponsors);
  };

  const loadFloorPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await publicFloorPlanAPI.getPublicFloorPlans();
      
      if (result.success) {
        const plans = result.data.floorplans || [];
        setFloorPlans(plans);
        
        if (!id && plans.length > 0) {
          loadFloorPlanDetails(plans[0]);
        }
      } else {
        setError(result.data.message || 'Failed to load floor plans');
      }
    } catch (error) {
      console.error('Failed to load floor plans:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const loadFloorPlanDetails = async (plan: FloorPlan) => {
    try {
      setSelectedFloorPlan(plan);
      
      const result = await publicFloorPlanAPI.getPublicFloorPlan(plan.id);
      
      if (result.success && result.data.floorplan) {
        const detailedPlan = result.data.floorplan;
        
        if (detailedPlan.state) {
          loadFloorPlan(detailedPlan.state);
        } else {
          resetCanvas();
        }
      }
    } catch (error) {
      console.error('Failed to load floor plan details:', error);
    }
  };

  const handleBoothClick = (boothId: string) => {
    const booth = elements.find(
      (element) => element.id === boothId && element.type === 'booth'
    ) as BoothElement | undefined;
    
    if (booth) {
      setSelectedBooth(booth);
    }
  };

  const closeBoothInfo = () => {
    setSelectedBooth(null);
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

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 text-yellow-800 px-1 rounded">
          {part}
        </span>
      ) : part
    );
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (selectedBooth) {
          closeBoothInfo();
        } else if (!sidebarCollapsed) {
          setSidebarCollapsed(true);
        }
      }
      if (event.key === 'Tab') {
        setSidebarCollapsed(!sidebarCollapsed);
        event.preventDefault();
      }
      if (event.key === '1' && event.ctrlKey) {
        setViewMode('2d');
        event.preventDefault();
      }
      if (event.key === '2' && event.ctrlKey) {
        setViewMode('3d');
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarCollapsed, selectedBooth]);

  if (loading) {
    return (
      <div className="professional-floor-plan">
        <div className="professional-loading">
          <div className="professional-loading-spinner"></div>
          <span>Loading exhibition floor plan...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="professional-floor-plan">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <FontAwesomeIcon icon="fas fa-exclamation-triangle" size={48} className="text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={loadFloorPlans}
              className="professional-button primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (floorPlans.length === 0) {
    return (
      <div className="professional-floor-plan">
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md mx-auto">
            <FontAwesomeIcon icon="fas fa-map" size={64} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Floor Plans Available</h3>
            <p className="text-gray-600 mb-4">There are currently no published floor plans to view.</p>
            <button 
              onClick={loadFloorPlans}
              className="professional-button primary"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="professional-floor-plan">
      {/* Professional Header */}
      <div className="professional-header">
        <h1>{selectedFloorPlan?.name || 'Exhibition Floor Plan'}</h1>
        <div className="subtitle">Interactive 2D & 3D Floor Plan Viewer</div>
      </div>

      {/* Professional Sponsor Header */}
      <ProfessionalSponsorHeader sponsors={sponsors} />
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Professional Left Sidebar */}
        <div className={`professional-sidebar ${sidebarCollapsed ? 'hidden' : ''} ${isMobile && !sidebarCollapsed ? 'fixed inset-0 z-50' : ''}`}>
          <div className="professional-sidebar-header">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="professional-sidebar-title">Exhibitors</h2>
                <p className="professional-sidebar-subtitle">
                  {filteredCompanies.length} companies on Floor {selectedFloor}
                </p>
              </div>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
                title="Close sidebar"
              >
                <FontAwesomeIcon icon="fas fa-times" size={16} />
              </button>
            </div>
            
            <div className="professional-search">
              <FontAwesomeIcon 
                icon="fas fa-search" 
                className="professional-search-icon"
              />
              <input
                type="text"
                placeholder="Search companies, booths, categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="professional-search-input"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="professional-search-clear"
                  title="Clear search"
                >
                  <FontAwesomeIcon icon="fas fa-times" size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="professional-company-list professional-scrollbar">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                className={`professional-company-card ${company.featured ? 'featured' : ''} ${hoveredCompany === company.id ? 'selected' : ''}`}
                onClick={() => handleCompanyClick(company)}
                onMouseEnter={() => setHoveredCompany(company.id)}
                onMouseLeave={() => setHoveredCompany(null)}
              >
                <div className="professional-company-info">
                  <div className="professional-company-avatar">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={company.name}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <span className={company.logo ? 'hidden' : ''}>
                      {company.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="professional-company-details">
                    <h3 className="professional-company-name">
                      {highlightSearchTerm(company.name, searchTerm)}
                    </h3>
                    <div className="professional-company-booth">
                      Booth {highlightSearchTerm(company.booth_number, searchTerm)}
                    </div>
                    <div className="professional-company-meta">
                      <span className={`professional-status-badge ${company.status === 'sold' ? 'occupied' : company.status}`}>
                        {company.status === 'sold' ? 'Occupied' : 
                         company.status === 'reserved' ? 'Reserved' : 'Available'}
                      </span>
                      <span className="professional-category-badge">
                        {company.category}
                      </span>
                      {company.featured && (
                        <span className="professional-featured-badge">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Professional Canvas Area */}
        <div className="professional-canvas-container">
          <div className="professional-canvas-background" />
          
          {/* Sidebar Toggle Button */}
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="absolute top-4 left-4 z-20 bg-white border border-gray-300 rounded-lg p-3 shadow-lg hover:shadow-xl transition-all duration-200"
              title="Open sidebar"
            >
              <FontAwesomeIcon icon="fas fa-bars" size={16} className="text-gray-600" />
            </button>
          )}

          {/* Professional Controls */}
          <div className="professional-controls">
            <div className="professional-view-toggle">
              <button
                onClick={() => setViewMode('2d')}
                className={`professional-view-button ${viewMode === '2d' ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon="fas fa-map" size={14} />
                <span>2D View</span>
              </button>
              <button
                onClick={() => setViewMode('3d')}
                className={`professional-view-button ${viewMode === '3d' ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon="fas fa-cube" size={14} />
                <span>3D View</span>
              </button>
            </div>

            <div className="professional-zoom-controls">
              <button
                className="professional-zoom-button"
                title="Zoom In"
              >
                <FontAwesomeIcon icon="fas fa-plus" size={14} />
              </button>
              <button
                className="professional-zoom-button"
                title="Zoom Out"
              >
                <FontAwesomeIcon icon="fas fa-minus" size={14} />
              </button>
              <button
                className="professional-zoom-button"
                title="Fit to Screen"
              >
                <FontAwesomeIcon icon="fas fa-expand" size={14} />
              </button>
            </div>
          </div>

          {/* Floor Plan Canvas */}
          <div className="h-full">
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
                
                {selectedBooth && (
                  <ProfessionalBoothPopup 
                    booth={selectedBooth} 
                    company={companies.find(c => c.booth_number === selectedBooth.number)}
                    onClose={closeBoothInfo} 
                  />
                )}
              </>
            ) : (
              <div className="professional-loading">
                <div className="professional-loading-spinner"></div>
                <span>Loading floor plan...</span>
              </div>
            )}
          </div>
        </div>

        {/* Professional Right Panel */}
        <div className="professional-right-panel">
          {/* Floor Navigation */}
          <div className="professional-panel-section">
            <h3 className="professional-panel-title">
              <FontAwesomeIcon icon="fas fa-building" size={18} className="text-blue-500" />
              Floor Levels
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedFloor(1)}
                className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                  selectedFloor === 1
                    ? 'floor-nav-button active'
                    : 'floor-nav-button'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Ground Floor</div>
                    <div className="text-sm opacity-75">Level 1</div>
                  </div>
                  {selectedFloor === 1 && (
                    <FontAwesomeIcon icon="fas fa-check-circle" size={18} />
                  )}
                </div>
              </button>
              <button
                onClick={() => setSelectedFloor(2)}
                className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                  selectedFloor === 2
                    ? 'floor-nav-button active'
                    : 'floor-nav-button'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Second Floor</div>
                    <div className="text-sm opacity-75">Level 2</div>
                  </div>
                  {selectedFloor === 2 && (
                    <FontAwesomeIcon icon="fas fa-check-circle" size={18} />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="professional-panel-section">
            <h3 className="professional-panel-title">
              <FontAwesomeIcon icon="fas fa-info-circle" size={18} className="text-green-500" />
              Legend
            </h3>
            <div className="space-y-1">
              <div className="professional-legend-item">
                <div className="flex items-center">
                  <div className="professional-legend-color" style={{ backgroundColor: '#28a745' }}></div>
                  <span className="professional-legend-label">Available Booths</span>
                </div>
                <span className="professional-legend-count">{stats.available}</span>
              </div>
              <div className="professional-legend-item">
                <div className="flex items-center">
                  <div className="professional-legend-color" style={{ backgroundColor: '#007BFF' }}></div>
                  <span className="professional-legend-label">Occupied Booths</span>
                </div>
                <span className="professional-legend-count">{stats.occupied}</span>
              </div>
              <div className="professional-legend-item">
                <div className="flex items-center">
                  <div className="professional-legend-color" style={{ backgroundColor: '#ffc107' }}></div>
                  <span className="professional-legend-label">Reserved Booths</span>
                </div>
                <span className="professional-legend-count">{stats.reserved}</span>
              </div>
              <div className="professional-legend-item">
                <div className="flex items-center">
                  <div className="professional-legend-color" style={{ backgroundColor: '#C3A4FF' }}></div>
                  <span className="professional-legend-label">Featured Companies</span>
                </div>
                <span className="professional-legend-count">{stats.featured}</span>
              </div>
            </div>
            
            <div className="professional-progress">
              <div className="professional-progress-label">
                <span>Occupancy Rate</span>
                <span>{stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0}%</span>
              </div>
              <div className="professional-progress-bar">
                <div 
                  className="professional-progress-fill"
                  style={{ 
                    width: stats.total > 0 ? `${(stats.occupied / stats.total) * 100}%` : '0%'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="professional-panel-section">
            <h3 className="professional-panel-title">
              <FontAwesomeIcon icon="fas fa-chart-bar" size={18} className="text-purple-500" />
              Quick Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="stat-card available">
                <div className="stat-number">{stats.total}</div>
                <div className="stat-label">Total Booths</div>
              </div>
              <div className="stat-card occupied">
                <div className="stat-number">{stats.available}</div>
                <div className="stat-label">Available</div>
              </div>
              <div className="stat-card reserved">
                <div className="stat-number">{stats.reserved}</div>
                <div className="stat-label">Reserved</div>
              </div>
              <div className="stat-card featured">
                <div className="stat-number">{stats.featured}</div>
                <div className="stat-label">Featured</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-40 backdrop-blur-sm"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </div>
  );
};
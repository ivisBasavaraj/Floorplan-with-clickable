import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '../components/icons/FontAwesomeIcon';

import SVGViewBoxMap from '../components/preview/SVGViewBoxMap';
import { ViewMode2D } from '../components/preview/ViewMode2D';
import { ViewMode3D } from '../components/preview/ViewMode3D';
import PlainLeafletMap from '../components/PlainLeafletMap';
import { publicHallAPI, publicFloorPlanAPI } from '../services/api';
import { UserBoothInfoPopup } from '../components/user/UserBoothInfoPopup';
import { UserSponsorHeader } from '../components/user/UserSponsorHeader';
import { ViewToggle } from '../components/viewer/ViewToggle';
import { floorPlanAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useCanvasStore } from '../store/canvasStore';
import { getBrandLogo } from '../utils/brandLogos';
// Note: ViewerControls and FloorNavigation removed as they depend on floorPlanViewerStore
// We have our own enhanced controls built into the component
import '../styles/FloorPlanViewer.css';
import '../components/ExpoFPReplica.css';
import { BoothElement } from '../types/canvas';
import { generateSVGPlaceholder, PLACEHOLDER_CONFIGS } from '../utils/placeholderUtils';

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
}

export const EnhancedUserFloorPlanViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  // State management
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [selectedFloorPlan, setSelectedFloorPlan] = useState<FloorPlan | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sponsors, setSponsors] = useState<SponsorLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'map'>('map');
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedBooth, setSelectedBooth] = useState<BoothElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Gate floor plan visibility until a hall is chosen on map
  const [selectedHallId, setSelectedHallId] = useState<string | null>(null);
  const [halls, setHalls] = useState<{ id: string; name: string; polygon: [number, number][]; color?: string }[]>([
    { id: 'hall1', name: 'BIEC Hall 1', color: '#2563eb', polygon: [
      [13.06352, 77.47472], [13.06355, 77.47563], [13.06293, 77.47568], [13.06289, 77.47477]
    ]},
    { id: 'hall2', name: 'BIEC Hall 2', color: '#16a34a', polygon: [
      [13.06294, 77.47475], [13.06298, 77.47566], [13.06232, 77.47571], [13.06227, 77.47480]
    ]},
    { id: 'hall3', name: 'BIEC Hall 3', color: '#f59e0b', polygon: [
      [13.06232, 77.47479], [13.06236, 77.47569], [13.06172, 77.47574], [13.06167, 77.47484]
    ]},
  ]);
  const [planPicker, setPlanPicker] = useState<{ open: boolean; hallId: string | null; plans: FloorPlan[] }>({ open: false, hallId: null, plans: [] });

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
    if (mode === '2d' || mode === '3d' || mode === 'map') {
      setViewMode(mode);
    }
    // If map mode is chosen via URL, require hall selection before showing floor plan
    if (mode === 'map') {
      setSelectedHallId(null);
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
    // Fetch public halls for map gating
    (async () => {
      try {
        const res = await publicHallAPI.getPublicHalls();
        if (res.success && res.data.halls && res.data.halls.length > 0) {
          setHalls(res.data.halls);
        }
      } catch (e) {
        console.error('Failed to load halls', e);
      }
    })();
  }, [user]); // Reload when user authentication changes

  // Load companies after elements are loaded
  useEffect(() => {
    if (elements.length > 0) {
      loadCompaniesFromBackend();
    }
  }, [elements]);
  
  // Listen for CSV data updates
  useEffect(() => {
    const handleBoothDataLoaded = () => {
      console.log('Booth data loaded event received, refreshing companies...');
      refreshCompanies();
    };
    
    window.addEventListener('booth-data-loaded', handleBoothDataLoaded);
    return () => window.removeEventListener('booth-data-loaded', handleBoothDataLoaded);
  }, [elements]);
  
  // Also listen for storage changes in case CSV is uploaded in another tab
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'boothData' && elements.length > 0) {
        console.log('Storage change detected for boothData, refreshing companies...');
        refreshCompanies();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [elements]);
  
  // Initial load of companies from CSV if available
  useEffect(() => {
    if (elements.length > 0) {
      const storedBoothData = localStorage.getItem('boothData');
      if (storedBoothData) {
        console.log('Found existing CSV data on mount, loading companies...');
        refreshCompanies();
      }
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

  const loadCompaniesFromBackend = async () => {
    try {
      // Try to load companies from backend API
      const result = await publicFloorPlanAPI.getPublicCompanies();
      if (result.success && result.data.companies) {
        setCompanies(result.data.companies);
        return;
      }
    } catch (error) {
      console.log('Backend companies not available, using booth data from floor plan');
    }
    
    // Fallback: Extract company data from booth elements in the floor plan
    loadCompaniesFromFloorPlan();
  };
  
  // Force refresh companies when CSV data changes
  const refreshCompanies = () => {
    if (elements.length > 0) {
      loadCompaniesFromFloorPlan();
    }
  };

  const loadCompaniesFromFloorPlan = () => {
    // Extract booth information from canvas elements first
    const boothElements = elements.filter(el => el.type === 'booth') as BoothElement[];
    
    // Try to get CSV data from localStorage
    const storedBoothData = localStorage.getItem('boothData');
    let csvData: Record<string, any> = {};
    
    if (storedBoothData) {
      try {
        csvData = JSON.parse(storedBoothData);
        console.log('Found CSV booth data:', csvData);
        console.log('Available booth numbers in floor plan:', boothElements.map(b => b.number));
        console.log('Available CSV booth keys:', Object.keys(csvData));
      } catch (error) {
        console.error('Error parsing stored booth data:', error);
      }
    }
    
    const companiesFromBooths: Company[] = boothElements.map((booth, index) => {
      // Check if we have CSV data for this booth - try both exact match and with 'B' prefix
      let csvBoothData = csvData[booth.number];
      if (!csvBoothData && booth.number.startsWith('B')) {
        // Try without 'B' prefix
        csvBoothData = csvData[booth.number.substring(1)];
      }
      if (!csvBoothData && !booth.number.startsWith('B')) {
        // Try with 'B' prefix
        csvBoothData = csvData['B' + booth.number];
      }
      
      console.log(`Booth ${booth.number}: CSV data found:`, !!csvBoothData, csvBoothData);
      
      if (csvBoothData) {
        // Use CSV data - extract website and images/logo from otherDetails
        const websiteMatch = csvBoothData.otherDetails?.match(/Website: ([^|]+)/);
        const imagesMatch = csvBoothData.otherDetails?.match(/Images:\s*([^|]+)/);
        const website = websiteMatch ? websiteMatch[1].trim() : null;
        const imageUrl = imagesMatch ? imagesMatch[1].trim() : null;
        
        return {
          id: booth.id,
          name: csvBoothData.boothName || csvBoothData.owner || `Company ${booth.number}`,
          booth_number: booth.number,
          floor: 1,
          category: 'Exhibition',
          featured: false,
          status: 'reserved' as const,
          logo: imageUrl || generateSVGPlaceholder({ 
            ...PLACEHOLDER_CONFIGS.company, 
            backgroundColor: '#2c5530',
            text: (csvBoothData.boothName || csvBoothData.owner || booth.number).charAt(0)
          }),
          description: csvBoothData.otherDetails?.split('|')[0]?.trim() || `${csvBoothData.boothName || csvBoothData.owner} - Exhibition participant`,
          contact: {
            email: `info@${(csvBoothData.boothName || csvBoothData.owner || 'company').toLowerCase().replace(/\s+/g, '')}.com`,
            website: website || `https://${(csvBoothData.boothName || csvBoothData.owner || 'company').toLowerCase().replace(/\s+/g, '')}.com`,
            phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`
          }
        };
      } else {
        // Fallback to mock data only if no CSV data exists at all
        if (Object.keys(csvData).length === 0) {
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
          const statuses: ('available' | 'reserved')[] = ['reserved', 'available'];
          const status = statuses[index % 2];
          
          return {
            id: booth.id,
            name,
            booth_number: booth.number,
            floor: 1,
            category,
            featured,
            status,
            logo: generateSVGPlaceholder({ 
              ...PLACEHOLDER_CONFIGS.company, 
              backgroundColor: status === 'reserved' ? '#2c5530' : '#90EE90',
              text: name.charAt(0)
            }),
            description: `${name} - Leading provider of ${category.toLowerCase()} solutions`,
            contact: {
              email: `info@${name.toLowerCase().replace(/\s+/g, '')}.com`,
              website: `https://${name.toLowerCase().replace(/\s+/g, '')}.com`,
              phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`
            }
          };
        } else {
          // If CSV data exists but this booth isn't in it, show as available
          return {
            id: booth.id,
            name: `Booth ${booth.number}`,
            booth_number: booth.number,
            floor: 1,
            category: 'Available',
            featured: false,
            status: 'available' as const,
            logo: generateSVGPlaceholder({ 
              ...PLACEHOLDER_CONFIGS.company, 
              backgroundColor: '#6c757d',
              text: booth.number
            }),
            description: `Booth ${booth.number} - Available for booking`,
            contact: {
              email: 'info@available.com',
              website: 'https://available.com',
              phone: '+1 (555) 000-0000'
            }
          };
        }
      }
    });
    
    setCompanies(companiesFromBooths);
  };

  const loadSponsorsFromBackend = async () => {
    try {
      // Try to load sponsors from backend API
      const result = await publicFloorPlanAPI.getPublicSponsors();
      if (result.success && result.data.sponsors) {
        setSponsors(result.data.sponsors);
        return;
      }
    } catch (error) {
      console.log('Backend sponsors not available, using sample data');
    }
    
    // Fallback: Sample sponsors data with professional brand logos
    const sampleSponsors: SponsorLogo[] = [
      { 
        id: '1', 
        name: 'Microsoft', 
        logo: getBrandLogo('Microsoft'), 
        website: 'https://microsoft.com' 
      },
      { 
        id: '2', 
        name: 'Google', 
        logo: getBrandLogo('Google'), 
        website: 'https://google.com' 
      },
      { 
        id: '3', 
        name: 'Apple', 
        logo: getBrandLogo('Apple'), 
        website: 'https://apple.com' 
      },
      { 
        id: '4', 
        name: 'Mohawk', 
        logo: getBrandLogo('Mohawk'), 
        website: 'https://mohawkflooring.com' 
      },
      { 
        id: '5', 
        name: 'GreenLeaf Interiors', 
        logo: getBrandLogo('GreenLeaf'), 
        website: 'https://greenleafinteriors.com' 
      },
      { 
        id: '6', 
        name: 'Shaw', 
        logo: getBrandLogo('Shaw'), 
        website: 'https://shawfloors.com' 
      },
      { 
        id: '7', 
        name: 'Armstrong', 
        logo: getBrandLogo('Armstrong'), 
        website: 'https://armstrong.com' 
      },
      { 
        id: '8', 
        name: 'Mannington', 
        logo: getBrandLogo('Mannington'), 
        website: 'https://mannington.com' 
      },
      { 
        id: '9', 
        name: 'Design Studio', 
        logo: getBrandLogo('DesignStudio'), 
        website: 'https://designstudio.com' 
      },
      { 
        id: '10', 
        name: 'BuildTech', 
        logo: getBrandLogo('BuildTech'), 
        website: 'https://buildtech.com' 
      },
      { 
        id: '11', 
        name: 'FloorMaster', 
        logo: getBrandLogo('FloorMaster'), 
        website: 'https://floormaster.com' 
      }
    ];
    

    
    setSponsors(sampleSponsors);
  };

  const loadFloorPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use authenticated API if user is logged in, otherwise use public API
      const result = user 
        ? await floorPlanAPI.getFloorPlans()
        : await publicFloorPlanAPI.getPublicFloorPlans();
      
      if (result.success) {
        const plans = result.data.floorplans || [];
        console.log('Viewer: Loaded floor plans:', plans.map(fp => ({ id: fp.id, name: fp.name, status: fp.status })));
        setFloorPlans(plans);
        
        // If no specific ID, select the first plan
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
      
      // Load detailed floor plan data using appropriate API
      const result = user 
        ? await floorPlanAPI.getFloorPlan(plan.id)
        : await publicFloorPlanAPI.getPublicFloorPlan(plan.id);
      
      if (result.success && result.data.floorplan) {
        const detailedPlan = result.data.floorplan;
        console.log('Viewer: Loading floor plan details for:', plan.name, 'ID:', plan.id);
        
        // Load the floor plan state into canvas store
        if (detailedPlan.state) {
          console.log('Loading floor plan state:', detailedPlan.state);
          loadFloorPlan(detailedPlan.state);
          
          // Debug: Check if there are any image elements
          const imageElements = detailedPlan.state.elements?.filter((el: any) => el.type === 'image') || [];
          console.log('Image elements found:', imageElements.length, imageElements);
        } else {
          console.log('No floor plan state found, resetting canvas');
          resetCanvas();
        }
      } else {
        console.error('Failed to load floor plan details:', result.data?.message);
      }
    } catch (error) {
      console.error('Failed to load floor plan details:', error);
    }
  };

  const handleBoothClick = async (boothId: string) => {
    const booth = elements.find(
      (element) => element.id === boothId && element.type === 'booth'
    ) as BoothElement | undefined;
    
    if (booth) {
      setSelectedBooth(booth);
      
      // Try to fetch additional exhibitor data from backend
      try {
        const response = await fetch(`/api/exhibitors/${booth.number}`);
        if (response.ok) {
          const exhibitorData = await response.json();
          // Update company data with backend response if available
          const updatedCompany = companies.find(c => c.booth_number === booth.number);
          if (updatedCompany) {
            Object.assign(updatedCompany, exhibitorData);
          }
        }
      } catch (error) {
        console.log('Backend exhibitor data not available, using local data');
      }
    }
  };

  const closeBoothInfo = () => {
    setSelectedBooth(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  const handleCompanyClick = (company: Company) => {
    // Find the booth element that matches this company
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading floor plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon="fas fa-exclamation-triangle" size={48} className="text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadFloorPlans}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If there are no global floor plans, still allow map gating view
  if (floorPlans.length === 0 && viewMode !== 'map') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <FontAwesomeIcon icon="fas fa-map" size={64} className="text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Floor Plans Available</h3>
          <p className="text-gray-600 mb-4">There are currently no published floor plans to view.</p>
          <button 
            onClick={loadFloorPlans}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col floor-plan-viewer professional-floor-plan expofp-replica">
      {/* Enhanced Sponsor Header */}
      <UserSponsorHeader sponsors={sponsors} />
      
      {/* User Menu - Only show if user is logged in */}
      {user && (
        <div className="absolute top-4 right-4 z-50">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm transition-colors duration-200"
            >
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-xs">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">{user.name || 'User'}</span>
              <FontAwesomeIcon 
                icon="fas fa-chevron-down" 
                size={12} 
                className={`text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                  <p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role || 'user'}</p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors duration-150 group"
                    >
                      <div className="flex items-center space-x-3">
                        <FontAwesomeIcon icon="fas fa-home" size={14} className="text-gray-400 group-hover:text-blue-600" />
                        <span className="text-sm text-gray-900 group-hover:text-blue-600">Dashboard</span>
                      </div>
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      navigate('/floor-plans');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors duration-150 group"
                  >
                    <div className="flex items-center space-x-3">
                      <FontAwesomeIcon icon="fas fa-map" size={14} className="text-gray-400 group-hover:text-blue-600" />
                      <span className="text-sm text-gray-900 group-hover:text-blue-600">Floor Plans</span>
                    </div>
                  </button>
                </div>

                {/* Separator */}
                <div className="border-t border-gray-100"></div>

                {/* Logout */}
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 transition-colors duration-150 group"
                  >
                    <div className="flex items-center space-x-3">
                      <FontAwesomeIcon icon="fas fa-sign-out-alt" size={14} className="text-gray-400 group-hover:text-red-600" />
                      <span className="text-sm text-gray-900 group-hover:text-red-600">Sign Out</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Overlay to close menu when clicking outside */}
            {showUserMenu && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
            )}
          </div>
        </div>
      )}
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Exhibitor List */}
        <div className={`expofp-sidebar-left transition-all duration-300 ${
          sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-80'
        }`}>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="sidebar-header">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2>Exhibitors</h2>
                  <span className="exhibitor-count">
                    {filteredCompanies.length} exhibitors
                  </span>
                </div>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="close-btn"
                  title="Close sidebar"
                >
                  <FontAwesomeIcon icon="fas fa-times" />
                </button>
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
                    <button
                      onClick={() => setSearchTerm('')}
                      className="clear-btn"
                    >
                      <FontAwesomeIcon icon="fas fa-times" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Company List */}
            <div className="exhibitor-list">
              {filteredCompanies.map((company) => (
                <div
                  key={company.id}
                  className="exhibitor-item"
                  onClick={() => handleCompanyClick(company)}
                >
                  <div className="exhibitor-logo">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={company.name}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <div className="logo-placeholder">
                        {company.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className={company.logo ? 'hidden logo-placeholder' : 'logo-placeholder'}>
                      {company.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="exhibitor-info">
                    <h3>{company.name}</h3>
                    <div className="exhibitor-meta">
                      <span className="booth-tag">Booth {company.booth_number}</span>
                      <span className="category-tag">{company.category}</span>
                    </div>
                    <p className="exhibitor-desc">{company.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="expofp-main flex-1 relative">
          {/* Sidebar Toggle Button */}
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="absolute top-4 left-4 z-20 zoom-btn"
              title="Open sidebar"
            >
              <FontAwesomeIcon icon="fas fa-bars" />
            </button>
          )}

          {/* Canvas Controls */}
          <div className="canvas-controls">
            <div className="zoom-controls">
              <button onClick={() => setViewMode('2d')} className={`zoom-btn ${viewMode === '2d' ? 'active' : ''}`}>
                2D
              </button>
              <button onClick={() => setViewMode('3d')} className={`zoom-btn ${viewMode === '3d' ? 'active' : ''}`}>
                3D
              </button>
              <button onClick={() => setViewMode('map')} className={`zoom-btn ${viewMode === 'map' ? 'active' : ''}`}>
                <FontAwesomeIcon icon="fas fa-globe" />
              </button>
            </div>
          </div>

          {/* Floor Plan Canvas / Map */}
          <div className="h-full">
            {viewMode === 'map' ? (
              <div className="h-full min-h-[400px] relative">
                <PlainLeafletMap
                  drawBooths={(ctx) => { /* no booths drawn in user map gate */ }}
                  halls={halls}
                  onHallClick={async (hall) => {
                    setSelectedHallId(hall.id);
                    // Find floor plans for this specific hall only
                    const hallPlans = floorPlans.filter(plan => plan.hall_id === hall.id);
                    if (hallPlans.length > 0) {
                      await loadFloorPlanDetails(hallPlans[0]);
                      setViewMode('2d');
                    } else {
                      // Fallback: load any available floor plan for now
                      if (floorPlans.length > 0) {
                        await loadFloorPlanDetails(floorPlans[0]);
                        setViewMode('2d');
                      } else {
                        alert(`No floor plan available for ${hall.name}`);
                      }
                    }
                  }}
                  center={[13.062639, 77.475917]}
                  zoom={16}
                />
                {(!halls || halls.length === 0) && (
                  <div className="absolute top-4 left-4 bg-white/90 px-3 py-2 rounded shadow text-sm">
                    No public halls available. Please create halls in admin and mark them public.
                  </div>
                )}
              </div>
            ) : selectedFloorPlan ? (
              <>
                {viewMode === '2d' ? (
                  <ViewMode2D 
                    onBoothClick={handleBoothClick} 
                    selectedBoothId={selectedBooth?.id}
                  />
                ) : viewMode === '3d' ? (
                  <div className="h-full min-h-[400px]">
                    <ViewMode3D 
                      onBoothClick={handleBoothClick} 
                      selectedBoothId={selectedBooth?.id}
                    />
                  </div>
                ) : null}
              </>
            ) : (
              <div className="flex items-center justify-center h-full glass-panel m-6 rounded-2xl">
                <div className="text-center">
                  <p className="text-gray-700 font-medium">Select a hall to load a floor plan.</p>
                </div>
              </div>
            )}
          </div>

          {selectedBooth && (
            <UserBoothInfoPopup
              booth={selectedBooth}
              company={companies.find(c => c.booth_number === selectedBooth.number)}
              onClose={closeBoothInfo}
            />
          )}

          {/* Simple Plan Picker Modal */}
          {planPicker.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 className="text-lg font-semibold mb-4">Choose a floor plan</h3>
                {planPicker.plans.length === 0 ? (
                  <p className="text-gray-600">No published plans available for this hall.</p>
                ) : (
                  <ul className="space-y-2 mb-4">
                    {planPicker.plans.map((p) => (
                      <li key={p.id}>
                        <button
                          className="w-full text-left px-4 py-2 rounded border hover:bg-gray-50"
                          onClick={async () => {
                            await loadFloorPlanDetails(p);
                            setPlanPicker({ open: false, hallId: null, plans: [] });
                            setViewMode('2d');
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{p.name}</span>
                            <span className="text-xs text-gray-500">{new Date(p.last_modified).toLocaleDateString()}</span>
                          </div>
                          {p.description && (
                            <div className="text-sm text-gray-600 mt-1 truncate">{p.description}</div>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 rounded border"
                    onClick={() => setPlanPicker({ open: false, hallId: null, plans: [] })}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>


      </div>
    </div>
  );
};
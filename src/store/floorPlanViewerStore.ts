import { create } from 'zustand';
import { ViewerState, Company, Sponsor, FloorLevel, SearchFilters } from '../types/floorPlanViewer';
import { publicFloorPlanAPI } from '../services/api';
import { generateSVGPlaceholder, PLACEHOLDER_CONFIGS } from '../utils/placeholderUtils';
import { getBrandLogo } from '../utils/brandLogos';

interface FloorPlanViewerStore extends ViewerState {
  // Actions
  setCurrentFloor: (floor: number) => void;
  setViewMode: (mode: '2d' | '3d') => void;
  setSelectedBooth: (boothId: string | undefined) => void;
  setHoveredBooth: (boothId: string | undefined) => void;
  updateSearchFilters: (filters: Partial<SearchFilters>) => void;
  clearSearch: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Data loading
  loadCompanies: (companies: Company[]) => void;
  loadSponsors: (sponsors: Sponsor[]) => void;
  loadFloorLevels: (levels: FloorLevel[]) => void;
  setLoading: (loading: boolean) => void;
  loadFloorPlanData: (floorPlanId: string) => Promise<void>;
  
  // Computed getters
  getFilteredCompanies: () => Company[];
  getFeaturedCompanies: () => Company[];
  getCompanyByBoothId: (boothId: string) => Company | undefined;
  getCurrentFloorCompanies: () => Company[];
}

// Sample data for demonstration
const sampleCompanies: Company[] = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    logo: generateSVGPlaceholder({ ...PLACEHOLDER_CONFIGS.company, backgroundColor: '#007bff', text: 'TC' }),
    category: 'Technology',
    featured: true,
    boothNumber: '4.1-43',
    floor: 1,
    website: 'https://techcorp.com',
    description: 'Leading technology solutions provider',
    contact: {
      email: 'info@techcorp.com',
      phone: '+1-555-0123'
    }
  },
  {
    id: '2',
    name: 'Green Energy Inc',
    logo: generateSVGPlaceholder({ ...PLACEHOLDER_CONFIGS.company, backgroundColor: '#28a745', text: 'GE' }),
    category: 'Energy',
    featured: false,
    boothNumber: '3.2-15',
    floor: 1,
    website: 'https://greenenergy.com',
    description: 'Sustainable energy solutions'
  },
  {
    id: '3',
    name: 'Digital Marketing Pro',
    logo: generateSVGPlaceholder({ ...PLACEHOLDER_CONFIGS.company, backgroundColor: '#6f42c1', text: 'DM' }),
    category: 'Marketing',
    featured: true,
    boothNumber: '2.1-08',
    floor: 1,
    description: 'Professional digital marketing services'
  },
  {
    id: '4',
    name: 'Healthcare Innovations',
    logo: generateSVGPlaceholder({ ...PLACEHOLDER_CONFIGS.company, backgroundColor: '#dc3545', text: 'HI' }),
    category: 'Healthcare',
    featured: false,
    boothNumber: '1.3-22',
    floor: 2,
    description: 'Advanced healthcare technology solutions'
  },
  {
    id: '5',
    name: 'Financial Services Ltd',
    logo: generateSVGPlaceholder({ ...PLACEHOLDER_CONFIGS.company, backgroundColor: '#ffc107', textColor: '#000000', text: 'FS' }),
    category: 'Finance',
    featured: true,
    boothNumber: '5.1-12',
    floor: 2,
    description: 'Comprehensive financial services'
  }
];

const sampleSponsors: Sponsor[] = [
  {
    id: '1',
    name: 'Microsoft',
    logo: getBrandLogo('Microsoft'),
    website: 'https://microsoft.com',
    tier: 'platinum'
  },
  {
    id: '2',
    name: 'Google',
    logo: getBrandLogo('Google'),
    website: 'https://google.com',
    tier: 'platinum'
  },
  {
    id: '3',
    name: 'Amazon',
    logo: getBrandLogo('Amazon'),
    website: 'https://amazon.com',
    tier: 'gold'
  },
  {
    id: '4',
    name: 'Apple',
    logo: getBrandLogo('Apple'),
    website: 'https://apple.com',
    tier: 'gold'
  },
  {
    id: '5',
    name: 'IBM',
    logo: getBrandLogo('IBM'),
    website: 'https://ibm.com',
    tier: 'gold'
  },
  {
    id: '6',
    name: 'Meta',
    logo: getBrandLogo('Meta'),
    website: 'https://meta.com',
    tier: 'silver'
  },
  {
    id: '7',
    name: 'Tesla',
    logo: getBrandLogo('Tesla'),
    website: 'https://tesla.com',
    tier: 'silver'
  },
  {
    id: '8',
    name: 'Netflix',
    logo: getBrandLogo('Netflix'),
    website: 'https://netflix.com',
    tier: 'bronze'
  }
];

const sampleFloorLevels: FloorLevel[] = [
  {
    id: '1',
    name: 'Ground Floor',
    level: 1,
    floorPlanId: 'floor-1',
    active: true
  },
  {
    id: '2',
    name: 'Second Floor',
    level: 2,
    floorPlanId: 'floor-2',
    active: true
  }
];

export const useFloorPlanViewerStore = create<FloorPlanViewerStore>((set, get) => ({
  // Initial state
  currentFloor: 1,
  viewMode: '2d',
  selectedBoothId: undefined,
  hoveredBoothId: undefined,
  searchFilters: {
    term: '',
    category: undefined,
    floor: undefined,
    status: undefined,
    featured: undefined
  },
  companies: sampleCompanies,
  sponsors: sampleSponsors,
  floorLevels: sampleFloorLevels,
  settings: {
    showGrid: true,
    showLabels: true,
    showPaths: false,
    enableTooltips: true,
    autoFit: true
  },
  isLoading: false,
  sidebarCollapsed: false,

  // Actions
  setCurrentFloor: (floor) => set({ currentFloor: floor }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setSelectedBooth: (boothId) => set({ selectedBoothId: boothId }),
  
  setHoveredBooth: (boothId) => set({ hoveredBoothId: boothId }),
  
  updateSearchFilters: (filters) => set((state) => ({
    searchFilters: { ...state.searchFilters, ...filters }
  })),
  
  clearSearch: () => set((state) => ({
    searchFilters: {
      ...state.searchFilters,
      term: '',
      category: undefined,
      status: undefined,
      featured: undefined
    }
  })),
  
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  // Data loading
  loadCompanies: (companies) => set({ companies }),
  
  loadSponsors: (sponsors) => set({ sponsors }),
  
  loadFloorLevels: (levels) => set({ floorLevels: levels }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  loadFloorPlanData: async (floorPlanId) => {
    set({ isLoading: true });
    try {
      const result = await publicFloorPlanAPI.getPublicFloorPlan(floorPlanId);
      if (result.success && result.data.floorplan) {
        const floorPlan = result.data.floorplan;
        
        // Extract companies from booth data
        const companies: Company[] = [];
        if (floorPlan.booth_details) {
          floorPlan.booth_details.forEach((booth: any, index: number) => {
            if (booth.exhibitor) {
              companies.push({
                id: booth.id || `booth-${index}`,
                name: booth.exhibitor.company_name || `Company ${index + 1}`,
                logo: generateSVGPlaceholder({ 
                  ...PLACEHOLDER_CONFIGS.company, 
                  backgroundColor: '#007bff', 
                  text: booth.exhibitor.company_name?.charAt(0) || 'C' 
                }),
                category: booth.exhibitor.category || 'General',
                featured: booth.status === 'sold',
                boothNumber: booth.number || `${index + 1}`,
                floor: floorPlan.floor || 1,
                website: booth.exhibitor.contact?.website,
                description: `Booth ${booth.number}`,
                contact: booth.exhibitor.contact
              });
            }
          });
        }
        
        set({ 
          companies,
          currentFloor: floorPlan.floor || 1,
          isLoading: false 
        });
      } else {
        console.error('Failed to load floor plan data');
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading floor plan data:', error);
      set({ isLoading: false });
    }
  },
  
  // Computed getters
  getFilteredCompanies: () => {
    const { companies, searchFilters, currentFloor } = get();
    let filtered = companies;

    // Filter by current floor
    filtered = filtered.filter(company => company.floor === currentFloor);

    // Filter by search term
    if (searchFilters.term) {
      const term = searchFilters.term.toLowerCase();
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(term) ||
        company.boothNumber.toLowerCase().includes(term) ||
        company.category.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (searchFilters.category) {
      filtered = filtered.filter(company => company.category === searchFilters.category);
    }

    // Filter by featured status
    if (searchFilters.featured !== undefined) {
      filtered = filtered.filter(company => company.featured === searchFilters.featured);
    }

    // Sort: featured companies first, then alphabetically
    return filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.name.localeCompare(b.name);
    });
  },
  
  getFeaturedCompanies: () => {
    const { companies, currentFloor } = get();
    return companies
      .filter(company => company.featured && company.floor === currentFloor)
      .sort((a, b) => a.name.localeCompare(b.name));
  },
  
  getCompanyByBoothId: (boothId) => {
    const { companies } = get();
    return companies.find(company => company.id === boothId);
  },
  
  getCurrentFloorCompanies: () => {
    const { companies, currentFloor } = get();
    return companies.filter(company => company.floor === currentFloor);
  }
}));
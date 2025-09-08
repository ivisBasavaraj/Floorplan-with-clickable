export interface Company {
  id: string;
  name: string;
  logo?: string;
  avatar?: string;
  category: string;
  featured: boolean;
  boothNumber: string;
  floor: number;
  website?: string;
  description?: string;
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  website?: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
}

export interface FloorLevel {
  id: string;
  name: string;
  level: number;
  floorPlanId: string;
  active: boolean;
}

export interface BoothStatus {
  available: string;
  occupied: string;
  reserved: string;
  featured: string;
}

export interface ViewerSettings {
  showGrid: boolean;
  showLabels: boolean;
  showPaths: boolean;
  enableTooltips: boolean;
  autoFit: boolean;
}

export interface SearchFilters {
  term: string;
  category?: string;
  floor?: number;
  status?: keyof BoothStatus;
  featured?: boolean;
}

export interface ViewerState {
  currentFloor: number;
  viewMode: '2d' | '3d';
  selectedBoothId?: string;
  hoveredBoothId?: string;
  searchFilters: SearchFilters;
  companies: Company[];
  sponsors: Sponsor[];
  floorLevels: FloorLevel[];
  settings: ViewerSettings;
  isLoading: boolean;
  sidebarCollapsed: boolean;
}

export interface ZoomControls {
  zoomIn: () => void;
  zoomOut: () => void;
  fitToScreen: () => void;
  resetZoom: () => void;
  currentZoom: number;
  minZoom: number;
  maxZoom: number;
}

export interface BoothInteraction {
  onBoothClick: (boothId: string) => void;
  onBoothHover: (boothId: string | null) => void;
  onBoothSelect: (boothId: string) => void;
}

export interface FloorPlanViewerProps {
  floorPlanId: string;
  initialFloor?: number;
  initialViewMode?: '2d' | '3d';
  onBoothSelect?: (booth: Company) => void;
  onCompanySelect?: (company: Company) => void;
  className?: string;
}
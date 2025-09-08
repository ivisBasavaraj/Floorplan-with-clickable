export type Point = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export type ElementStatus = 'available' | 'reserved' | 'sold' | 'on-hold';

export type ElementType = 'booth' | 'text' | 'shape' | 'image' | 'door' | 'furniture' | 'plant';

export type ViewerMode = 'editor' | '2d' | '3d';

export interface ExhibitorInfo {
  companyName: string;
  logo?: string;
  description?: string;
  category?: string;
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  draggable: boolean;
  selected: boolean;
  layer: number;
  customProperties: Record<string, any>;
}

export type BackgroundFitMode = 'stretch' | 'fit' | 'tile' | 'center';

export interface BackgroundImageSettings {
  url: string;
  opacity: number;
  fitMode: BackgroundFitMode;
  locked: boolean;
  position: Point;
  scale: number;
  rotation: number;
}

export interface FlooringSettings {
  enabled: boolean;
  opacity: number;
  elements: ShapeElement[];
}

export interface CanvasState {
  elements: AnyCanvasElement[];
  selectedIds: string[];
  activeTool: string;
  history: {
    past: AnyCanvasElement[][];
    future: AnyCanvasElement[][];
  };
  grid: {
    enabled: boolean;
    size: number;
    snap: boolean;
    opacity: number;
  };
  zoom: number;
  offset: Point;
  canvasSize: Size;
  backgroundImage?: BackgroundImageSettings;
  flooring?: FlooringSettings;
  
  // Viewer-related state
  viewerMode: ViewerMode;
  activeBoothId?: string; // For booth popup in viewer mode
  searchTerm?: string;
  categoryFilter?: string;
  miniMapEnabled?: boolean;
}

export interface FloorPlan {
  id: string;
  name: string;
  description?: string;
  created: string;
  lastModified: string;
  state: CanvasState;
  version: number;
  eventId: string;
  floor: number;
  layer: number; // Added layer property to support sorting
}

// Define a base interface for all canvas elements
export interface BaseCanvasElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  draggable: boolean;
  selected: boolean;
  layer: number;
  customProperties: Record<string, any>;
}

// Define specific element types with their unique properties
export interface BoothElement extends BaseCanvasElement {
  type: 'booth';
  number: string;
  status: ElementStatus;
  price?: number;
  dimensions: {
    imperial: string;
    metric: string;
  };
  exhibitor?: ExhibitorInfo;
  image?: string; // Booth image URL
  website?: string; // Booth/exhibitor website
  description?: string; // Booth description
}

export interface DoorElement extends BaseCanvasElement {
  type: 'door';
  furnitureType: string;
  direction: string;
}

export interface FurnitureElement extends BaseCanvasElement {
  type: 'furniture';
  furnitureType: string;
}

export interface PlantElement extends BaseCanvasElement {
  type: 'plant';
  plantType: string;
}

// Update AnyCanvasElement type to include all element types
export type AnyCanvasElement = BoothElement | TextElement | ShapeElement | ImageElement | DoorElement | FurnitureElement | PlantElement;

// Extend the base interface for specific element types
export interface TextElement extends BaseCanvasElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  align: string;
  fontStyle: string;
}

export interface ShapeElement extends BaseCanvasElement {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'polygon' | 'line' | 'arrow';
  points?: number[];
}

export interface ImageElement extends BaseCanvasElement {
  type: 'image';
  src: string;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
}

// Add type guards and utility functions if needed

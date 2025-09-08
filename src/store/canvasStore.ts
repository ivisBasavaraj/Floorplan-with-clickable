import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { 
  CanvasState, 
  AnyCanvasElement,
  BoothElement,
  TextElement,
  ShapeElement,
  ImageElement,
  DoorElement,
  FurnitureElement,
  PlantElement,
  BackgroundImageSettings,
  ViewerMode,
  ExhibitorInfo
} from '../types/canvas';

interface CanvasStore extends CanvasState {
  // Element Actions
  addElement: (element: Omit<AnyCanvasElement, 'id' | 'selected'>) => void;
  updateElement: (id: string, updates: Partial<AnyCanvasElement>) => void;
  deleteElements: (ids: string[]) => void;
  duplicateElements: (ids: string[]) => void;
  
  // Selection Actions
  selectElements: (ids: string[]) => void;
  deselectAll: () => void;
  
  // Layer Actions
  bringForward: (ids: string[]) => void;
  sendBackward: (ids: string[]) => void;
  bringToFront: (ids: string[]) => void;
  sendToBack: (ids: string[]) => void;
  
  // Group Actions
  groupElements: (ids: string[]) => void;
  ungroupElements: (groupId: string) => void;
  
  // Canvas Actions
  setActiveTool: (tool: string) => void;
  setZoom: (zoom: number) => void;
  setOffset: (x: number, y: number) => void;
  setGrid: (enabled: boolean, size?: number, snap?: boolean, opacity?: number) => void;
  
  // Background Image Actions
  setBackgroundImage: (settings: BackgroundImageSettings) => void;
  updateBackgroundImage: (updates: Partial<BackgroundImageSettings>) => void;
  removeBackgroundImage: () => void;
  
  // Flooring Actions
  setFlooringEnabled: (enabled: boolean) => void;
  setFlooringOpacity: (opacity: number) => void;
  addFlooringElement: (element: Omit<ShapeElement, 'id' | 'selected'>) => void;
  updateFlooringElement: (id: string, updates: Partial<ShapeElement>) => void;
  deleteFlooringElement: (id: string) => void;
  
  // History Actions
  undo: () => void;
  redo: () => void;
  saveState: () => void;
  
  // Booth Specific Actions
  generateBoothNumbers: (startNumber?: number, prefix?: string) => void;
  updateBoothStatus: (id: string, status: BoothElement['status']) => void;
  
  // Import/Export
  loadFloorPlan: (state: CanvasState) => void;
  resetCanvas: () => void;
  
  // Viewer Mode Actions
  setViewerMode: (mode: ViewerMode) => void;
  setActiveBoothId: (id?: string) => void;
  setSearchTerm: (term?: string) => void;
  setCategoryFilter: (category?: string) => void;
  setMiniMapEnabled: (enabled: boolean) => void;
  
  // Exhibitor Actions
  updateBoothExhibitor: (id: string, exhibitor: ExhibitorInfo) => void;
  
  // Booth Detection
  detectBoothAtPosition: (x: number, y: number) => string | null;
  searchBooths: (searchTerm: string) => string[];
  getBoothsByCategory: (category: string) => string[];
}

const DEFAULT_CANVAS_STATE: CanvasState = {
  elements: [],
  selectedIds: [],
  activeTool: 'select',
  history: {
    past: [],
    future: []
  },
  grid: {
    enabled: true,
    size: 20,
    snap: false, // Disable snap by default to allow free movement
    opacity: 0.3
  },
  zoom: 1,
  offset: { x: 0, y: 0 },
  canvasSize: { width: 2000, height: 1500 },
  flooring: {
    enabled: false,
    opacity: 0.8,
    elements: []
  },
  
  // Viewer-related state
  viewerMode: 'editor',
  miniMapEnabled: true
};

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  ...DEFAULT_CANVAS_STATE,
  
  addElement: (element) => {
    try {
      console.log("addElement called with:", element);
      // Validate element has required base properties
      if (!element || !element.type) {
        console.error("Invalid element:", element);
        return;
      }
      
      // Create a new element with a unique ID
      // Use type-safe approach instead of type assertion
      const newElement: AnyCanvasElement = (() => {
        const baseElement = {
          ...element,
          id: uuidv4(),
          selected: false
        };
        
        // Return the appropriate type based on the element type
        switch (element.type) {
          case 'booth':
            return baseElement as unknown as BoothElement;
          case 'text':
            return baseElement as unknown as TextElement;
          case 'shape':
            return baseElement as unknown as ShapeElement;
          case 'image':
            return baseElement as unknown as ImageElement;
          case 'door':
            return baseElement as unknown as DoorElement;
          case 'furniture':
            return baseElement as unknown as FurnitureElement;
          case 'plant':
            return baseElement as unknown as PlantElement;
          default:
            // This should never happen due to the type constraint
            throw new Error(`Unknown element type: ${element.type}`);
        }
      })();
      
      // Add the element to the state
      console.log("Created new element:", newElement);
      set(state => {
        try {
          console.log("Current state before adding element:", state);
          const newState = {
            ...state,
            elements: [...state.elements, newElement],
            selectedIds: [newElement.id]
          };
          
          console.log("New state after adding element:", newState);
          return newState;
        } catch (innerError) {
          console.error("Error updating state:", innerError);
          return state; // Return unchanged state on error
        }
      });
      
      // Save the state
      get().saveState();
    } catch (error) {
      console.error("Error in addElement:", error);
    }
  },
  
  updateElement: (id, updates) => {
    set((state): CanvasStore => ({
      ...state,
      elements: state.elements.map(element => 
        element.id === id ? { ...element, ...updates } as AnyCanvasElement : element
      )
    }));
    
    get().saveState();
  },
  
  deleteElements: (ids) => {
    set((state): CanvasStore => ({
      ...state,
      elements: state.elements.filter(element => !ids.includes(element.id)),
      selectedIds: state.selectedIds.filter(id => !ids.includes(id))
    }));
    
    get().saveState();
  },
  
  duplicateElements: (ids) => {
    const elementsToClone = get().elements.filter(element => ids.includes(element.id));
    
    const clonedElements = elementsToClone.map(element => ({
      ...element,
      id: uuidv4(),
      x: element.x + 20,
      y: element.y + 20,
      selected: false
    } as AnyCanvasElement));
    
    set((state): CanvasStore => ({
      ...state,
      elements: [...state.elements, ...clonedElements],
      selectedIds: clonedElements.map(element => element.id)
    }));
    
    get().saveState();
  },
  
  selectElements: (ids) => {
    set((state): CanvasStore => ({
      ...state,
      selectedIds: ids,
      elements: state.elements.map(element => ({
        ...element,
        selected: ids.includes(element.id)
      }))
    }));
  },
  
  deselectAll: () => {
    set((state): CanvasStore => ({
      ...state,
      selectedIds: [],
      elements: state.elements.map(element => ({
        ...element,
        selected: false
      }))
    }));
  },
  
  bringForward: (ids) => {
    // Implementation left simple for brevity
    set((state): CanvasStore => {
      // Sort elements by layer to maintain correct ordering
      const sortedElements = [...state.elements].sort((a, b) => a.layer - b.layer);
      
      // Find the highest layer among the selected elements
      const highestSelectedLayer = Math.max(
        ...sortedElements
          .filter(element => ids.includes(element.id))
          .map(element => element.layer)
      );
      
      // Update elements
      const updatedElements = sortedElements.map(element => {
        if (ids.includes(element.id)) {
          return { ...element, layer: element.layer + 1 } as AnyCanvasElement;
        }
        return element;
      });
      
      return { ...state, elements: updatedElements };
    });
    
    get().saveState();
  },
  
  sendBackward: (ids) => {
    // Simple implementation for brevity
    set((state): CanvasStore => {
      const sortedElements = [...state.elements].sort((a, b) => a.layer - b.layer);
      
      const updatedElements = sortedElements.map(element => {
        if (ids.includes(element.id) && element.layer > 0) {
          return { ...element, layer: element.layer - 1 } as AnyCanvasElement;
        }
        return element;
      });
      
      return { ...state, elements: updatedElements };
    });
    
    get().saveState();
  },
  
  bringToFront: (ids) => {
    set((state): CanvasStore => {
      const maxLayer = Math.max(...state.elements.map(element => element.layer)) + 1;
      
      const updatedElements = state.elements.map(element => {
        if (ids.includes(element.id)) {
          return { ...element, layer: maxLayer } as AnyCanvasElement;
        }
        return element;
      });
      
      return { ...state, elements: updatedElements };
    });
    
    get().saveState();
  },
  
  sendToBack: (ids) => {
    set((state): CanvasStore => {
      const minLayer = Math.min(...state.elements.map(element => element.layer)) - 1;
      
      const updatedElements = state.elements.map(element => {
        if (ids.includes(element.id)) {
          return { ...element, layer: minLayer } as AnyCanvasElement;
        }
        return element;
      });
      
      return { ...state, elements: updatedElements };
    });
    
    get().saveState();
  },
  
  groupElements: (ids) => {
    // This would require more complex implementation in a real app
    console.log('Group elements:', ids);
  },
  
  ungroupElements: (groupId) => {
    // This would require more complex implementation in a real app
    console.log('Ungroup elements:', groupId);
  },
  
  setActiveTool: (tool) => {
    set((state): CanvasStore => ({ ...state, activeTool: tool }));
  },
  
  setZoom: (zoom) => {
    set((state): CanvasStore => ({ ...state, zoom }));
  },
  
  setOffset: (x, y) => {
    set((state): CanvasStore => ({ ...state, offset: { x, y } }));
  },
  
  setGrid: (enabled, size = 10, snap = true, opacity = 0.5) => {
    set((state): CanvasStore => ({ 
      ...state,
      grid: { 
        enabled,
        size: size || get().grid.size,
        snap: snap !== undefined ? snap : get().grid.snap,
        opacity: opacity !== undefined ? opacity : get().grid.opacity
      } 
    }));
  },
  
  // Background Image Actions
  setBackgroundImage: (settings) => {
    set((state): CanvasStore => ({
      ...state,
      backgroundImage: settings
    }));
    get().saveState();
  },
  
  updateBackgroundImage: (updates) => {
    set((state): CanvasStore => {
      if (!state.backgroundImage) return state;
      
      return {
        ...state,
        backgroundImage: {
          ...state.backgroundImage,
          ...updates
        }
      };
    });
    get().saveState();
  },
  
  removeBackgroundImage: () => {
    set((state): CanvasStore => ({
      ...state,
      backgroundImage: undefined
    }));
    get().saveState();
  },
  
  // Flooring Actions
  setFlooringEnabled: (enabled) => {
    set((state): CanvasStore => ({
      ...state,
      flooring: {
        ...state.flooring!,
        enabled
      }
    }));
  },
  
  setFlooringOpacity: (opacity) => {
    set((state): CanvasStore => ({
      ...state,
      flooring: {
        ...state.flooring!,
        opacity
      }
    }));
  },
  
  addFlooringElement: (element) => {
    const newElement: ShapeElement = {
      ...element,
      id: uuidv4(),
      selected: false
    } as ShapeElement;
    
    set((state): CanvasStore => ({
      ...state,
      flooring: {
        ...state.flooring!,
        elements: [...state.flooring!.elements, newElement]
      }
    }));
    get().saveState();
  },
  
  updateFlooringElement: (id, updates) => {
    set((state): CanvasStore => ({
      ...state,
      flooring: {
        ...state.flooring!,
        elements: state.flooring!.elements.map(element => 
          element.id === id ? { ...element, ...updates } as ShapeElement : element
        )
      }
    }));
    get().saveState();
  },
  
  deleteFlooringElement: (id) => {
    set((state): CanvasStore => ({
      ...state,
      flooring: {
        ...state.flooring!,
        elements: state.flooring!.elements.filter(element => element.id !== id)
      }
    }));
    get().saveState();
  },
  
  undo: () => {
    const { past, future } = get().history;
    
    if (past.length === 0) return;
    
    const newPast = [...past];
    const previousState = newPast.pop();
    
    if (!previousState) return;
    
    set((state): CanvasStore => ({
      ...state,
      elements: previousState,
      history: {
        past: newPast,
        future: [state.elements, ...future]
      }
    }));
  },
  
  redo: () => {
    const { past, future } = get().history;
    
    if (future.length === 0) return;
    
    const newFuture = [...future];
    const nextState = newFuture.shift();
    
    if (!nextState) return;
    
    set((state): CanvasStore => ({
      ...state,
      elements: nextState,
      history: {
        past: [...past, state.elements],
        future: newFuture
      }
    }));
  },
  
  saveState: () => {
    console.log("saveState called");
    set((state): CanvasStore => {
      console.log("Current state in saveState:", state);
      const newState = {
        ...state,
        history: {
          past: [...state.history.past, state.elements],
          future: []
        }
      };
      console.log("New state after saveState:", newState);
      return newState;
    });
  },
  
  generateBoothNumbers: (startNumber = 100, prefix = '') => {
    const boothElements = get().elements.filter(
      element => element.type === 'booth'
    ) as BoothElement[];
    
    let currentNumber = startNumber;
    
    boothElements.forEach(booth => {
      get().updateElement(booth.id, {
        number: `${prefix}${currentNumber}`
      });
      currentNumber++;
    });
    
    get().saveState();
  },
  
  updateBoothStatus: (id, status) => {
    get().updateElement(id, { status });
  },
  
  loadFloorPlan: (state) => {
    set((currentState): CanvasStore => ({
      ...currentState,
      ...state,
      history: {
        past: [],
        future: []
      }
    }));
  },
  
  resetCanvas: () => {
    console.log("resetCanvas called");
    set(state => {
      console.log("Current state in resetCanvas:", state);
      const newState = {
        ...state,
        elements: [],
        selectedIds: [],
        history: {
          past: [],
          future: []
        }
      };
      console.log("New state after resetCanvas:", newState);
      return newState;
    });
  },
  
  // Viewer Mode Actions
  setViewerMode: (mode) => {
    set((state): CanvasStore => ({ 
      ...state, 
      viewerMode: mode,
      // Reset active booth when changing modes
      activeBoothId: undefined
    }));
  },
  
  setActiveBoothId: (id) => {
    set((state): CanvasStore => ({ ...state, activeBoothId: id }));
  },
  
  setSearchTerm: (term) => {
    set((state): CanvasStore => ({ ...state, searchTerm: term }));
  },
  
  setCategoryFilter: (category) => {
    set((state): CanvasStore => ({ ...state, categoryFilter: category }));
  },
  
  setMiniMapEnabled: (enabled) => {
    set((state): CanvasStore => ({ ...state, miniMapEnabled: enabled }));
  },
  
  // Exhibitor Actions
  updateBoothExhibitor: (id, exhibitor) => {
    set((state): CanvasStore => ({
      ...state,
      elements: state.elements.map(element => {
        if (element.id === id && element.type === 'booth') {
          return { 
            ...element, 
            exhibitor 
          } as BoothElement;
        }
        return element;
      })
    }));
    
    get().saveState();
  },
  
  // Booth Detection
  detectBoothAtPosition: (x, y) => {
    const state = get();
    const { elements, zoom, offset } = state;
    
    // Convert screen coordinates to canvas coordinates
    const canvasX = (x - offset.x) / zoom;
    const canvasY = (y - offset.y) / zoom;
    
    // Find booth elements that contain this point
    const booth = elements.find(element => {
      if (element.type !== 'booth') return false;
      
      // Check if point is inside booth
      return (
        canvasX >= element.x &&
        canvasX <= element.x + element.width &&
        canvasY >= element.y &&
        canvasY <= element.y + element.height
      );
    });
    
    return booth ? booth.id : null;
  },
  
  searchBooths: (searchTerm) => {
    if (!searchTerm) return [];
    
    const state = get();
    const { elements } = state;
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    // Find booths that match the search term
    return elements
      .filter(element => {
        if (element.type !== 'booth') return false;
        
        const booth = element as BoothElement;
        
        // Search in booth number
        if (booth.number.toLowerCase().includes(lowerSearchTerm)) return true;
        
        // Search in exhibitor info if available
        if (booth.exhibitor) {
          const { companyName, description, category } = booth.exhibitor;
          
          if (companyName?.toLowerCase().includes(lowerSearchTerm)) return true;
          if (description?.toLowerCase().includes(lowerSearchTerm)) return true;
          if (category?.toLowerCase().includes(lowerSearchTerm)) return true;
        }
        
        return false;
      })
      .map(booth => booth.id);
  },
  
  getBoothsByCategory: (category) => {
    if (!category) return [];
    
    const state = get();
    const { elements } = state;
    
    // Find booths that match the category
    return elements
      .filter(element => {
        if (element.type !== 'booth') return false;
        
        const booth = element as BoothElement;
        return booth.exhibitor?.category === category;
      })
      .map(booth => booth.id);
  }
}));

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './EnhancedMapView.css';
import { BoothElement } from '../../types/canvas';

interface EnhancedMapViewProps {
  elements: any[];
  onBoothClick: (boothId: string) => void;
  selectedBoothId?: string;
  startIn3D?: boolean;
}

interface Booth {
  id: string;
  name: string;
  status: 'available' | 'onhold' | 'reserved' | 'occupied';
  x: number;
  y: number;
  width: number;
  height: number;
  section?: string;
}

// Custom Canvas Layer class - exact copy from EnhancedLeafletMap
class FloorPlanCanvasLayer extends L.Layer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private map: L.Map | null = null;
  private is3D: boolean = false;
  public booths: Booth[] = []; // Make public so it can be updated
  private boothBounds: Array<{id: string, x: number, y: number, width: number, height: number}> = [];
  private onBoothClick?: (boothId: string) => void;

  constructor(booths: Booth[], is3D: boolean = false, onBoothClick?: (boothId: string) => void) {
    super();
    this.booths = booths;
    this.is3D = is3D;
    this.onBoothClick = onBoothClick;
  }

  setView(is3D: boolean) {
    this.is3D = is3D;
    this._draw();
  }

  onAdd(map: L.Map) {
    this.map = map;
    
    // Create canvas element
    this.canvas = L.DomUtil.create('canvas', 'leaflet-canvas-layer');
    this.ctx = this.canvas.getContext('2d');
    
    // Set initial size
    const size = map.getSize();
    this.canvas.width = size.x;
    this.canvas.height = size.y;
    
    // Style canvas
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'auto';
    this.canvas.style.cursor = 'default';
    
    // Create a custom pane to ensure pointer events work reliably
    const paneName = 'boothCanvasPane';
    let pane = map.getPane(paneName);
    if (!pane) {
      pane = map.createPane(paneName);
      // Place above overlays but below tooltips/popups
      pane.style.zIndex = '650';
    }
    pane.style.pointerEvents = 'auto';

    // Add canvas to the custom pane
    pane.appendChild(this.canvas);
    
    // Prevent map interactions from swallowing canvas events
    L.DomEvent.disableClickPropagation(this.canvas as any);
    L.DomEvent.disableScrollPropagation(this.canvas as any);

    // Bind events
    map.on('viewreset', this._reset, this);
    map.on('zoom', this._reset, this);
    map.on('move', this._reset, this);
    map.on('resize', this._resize, this);
    
    // Add interaction handlers
    L.DomEvent.on(this.canvas, 'click', this._onClick, this);
    L.DomEvent.on(this.canvas, 'mousemove', this._onMouseMove, this);
    
    // Initial draw
    this._reset();
    
    return this;
  }

  onRemove(map: L.Map) {
    if (this.canvas) {
      L.DomEvent.off(this.canvas, 'click', this._onClick, this);
      L.DomEvent.off(this.canvas, 'mousemove', this._onMouseMove, this);
      // Remove from whichever pane it was added to
      if (this.canvas.parentElement) {
        this.canvas.parentElement.removeChild(this.canvas);
      }
    }
    
    map.off('viewreset', this._reset, this);
    map.off('zoom', this._reset, this);
    map.off('move', this._reset, this);
    map.off('resize', this._resize, this);
    
    return this;
  }

  private _resize = () => {
    if (!this.canvas || !this.map) return;
    
    const size = this.map.getSize();
    this.canvas.width = size.x;
    this.canvas.height = size.y;
    this._draw();
  };

  private _reset = () => {
    if (!this.canvas || !this.map) return;
    
    const topLeft = this.map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this.canvas, topLeft);
    this._draw();
  };

  public _draw = () => { // Make public so it can be called externally
    if (!this.ctx || !this.map) return;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas!.width, this.canvas!.height);
    this.boothBounds = [];
    
    // Get current zoom level for scaling
    const zoom = this.map.getZoom();
    const baseZoom = 17;
    const zoomScale = Math.pow(2, zoom - baseZoom);
    
    // Calculate minimum booth size for visibility
    const minBoothSize = Math.max(8, 20 * zoomScale);
    
    // Draw all booths from JSON data
    this.booths.forEach(booth => {
      // Convert booth coordinates to map coordinates - KEEP EXACT POSITIONS
      const baseLatLng = L.latLng(12.9715, 77.5945);
      const scaleFactor = 0.00001; // Fixed scale to maintain exact positions
      const boothLatLng = L.latLng(
        baseLatLng.lat + (booth.y - 300) * scaleFactor,
        baseLatLng.lng + (booth.x - 600) * scaleFactor
      );
      const boothPoint = this.map.latLngToContainerPoint(boothLatLng);
      
      // Scale booth dimensions based on zoom level with minimum size
      const scaledWidth = Math.max(minBoothSize, booth.width * zoomScale);
      const scaledHeight = Math.max(minBoothSize, booth.height * zoomScale);
      
      // KEEP EXACT POSITION - do not adjust for overlapping
      const x = boothPoint.x - scaledWidth/2;
      const y = boothPoint.y - scaledHeight/2;
      
      // Get booth color based on status
      let fillColor: string, strokeColor: string, labelColor: string;
      switch (booth.status) {
        case 'available':
          // ExpoFP green
          fillColor = '#10b981';
          strokeColor = '#059669';
          labelColor = '#ffffff';
          break;
        case 'occupied':
          // ExpoFP blue for occupied/sold
          fillColor = '#3b82f6';
          strokeColor = '#2563eb';
          labelColor = '#ffffff';
          break;
        case 'reserved':
          // ExpoFP amber
          fillColor = '#f59e0b';
          strokeColor = '#d97706';
          labelColor = '#ffffff';
          break;
        case 'onhold':
          // Neutral light
          fillColor = '#ffffff';
          strokeColor = '#dee2e6';
          labelColor = '#111827';
          break;
        default:
          fillColor = '#6c757d';
          strokeColor = '#6c757d';
          labelColor = '#ffffff';
      }
      
      if (this.is3D) {
        this.draw3DBooth(x, y, scaledWidth, scaledHeight, fillColor, strokeColor, booth.name || booth.id, zoomScale, labelColor);
      } else {
        this.draw2DBooth(x, y, scaledWidth, scaledHeight, fillColor, strokeColor, booth.name || booth.id, zoomScale, labelColor);
      }
      
      // Store booth bounds for click detection with scaled dimensions
      this.boothBounds.push({
        id: booth.id,
        x: x,
        y: y,
        width: scaledWidth,
        height: scaledHeight
      });
    });
  };

  private draw2DBooth(x: number, y: number, width: number, height: number, fillColor: string, strokeColor: string, label: string, zoomScale: number = 1, labelColor: string = '#ffffff') {
    if (!this.ctx) return;
    
    // Fill and stroke with ExpoFP colors
    this.ctx.fillStyle = fillColor;
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = Math.max(1, 2 * zoomScale);
    this.ctx.fillRect(x, y, width, height);
    this.ctx.strokeRect(x, y, width, height);
    
    // Label styling (ExpoFP bold, centered)
    const fontSize = Math.max(10, Math.min(16, 10 * zoomScale));
    this.ctx.font = `600 ${fontSize}px Inter, system-ui, -apple-system, BlinkMacSystemFont, Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = labelColor;
    
    if (width > 30 && height > 20) {
      this.ctx.fillText(label, x + width/2, y + height/2);
    }
  }

  private draw3DBooth(x: number, y: number, width: number, height: number, fillColor: string, strokeColor: string, label: string, zoomScale: number = 1, labelColor: string = '#ffffff') {
    if (!this.ctx) return;
    
    const depth = Math.max(5, 20 * zoomScale);
    
    // Draw shadow/depth
    this.ctx.fillStyle = this.darkenColor(fillColor, 0.25);
    this.ctx.fillRect(x + depth, y + depth, width, height);
    
    // Right side wall
    this.ctx.fillStyle = this.darkenColor(fillColor, 0.18);
    this.ctx.beginPath();
    this.ctx.moveTo(x + width, y);
    this.ctx.lineTo(x + width + depth, y + depth);
    this.ctx.lineTo(x + width + depth, y + height + depth);
    this.ctx.lineTo(x + width, y + height);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Bottom side wall
    this.ctx.fillStyle = this.darkenColor(fillColor, 0.12);
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + height);
    this.ctx.lineTo(x + depth, y + height + depth);
    this.ctx.lineTo(x + width + depth, y + height + depth);
    this.ctx.lineTo(x + width, y + height);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Top face
    this.ctx.fillStyle = fillColor;
    this.ctx.fillRect(x, y, width, height);
    
    // Border
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = Math.max(1, 2 * zoomScale);
    this.ctx.strokeRect(x, y, width, height);
    
    // Label
    const fontSize = Math.max(10, Math.min(16, 10 * zoomScale));
    this.ctx.font = `700 ${fontSize}px Inter, system-ui, -apple-system, BlinkMacSystemFont, Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = labelColor;
    
    if (width > 30 && height > 20) {
      this.ctx.fillText(label, x + width/2, y + height/2);
    }
  }

  private darkenColor(color: string, factor: number): string {
    // Simple color darkening for 3D effect
    if (color.startsWith('rgba')) {
      const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      if (match) {
        const r = Math.max(0, parseInt(match[1]) * (1 - factor));
        const g = Math.max(0, parseInt(match[2]) * (1 - factor));
        const b = Math.max(0, parseInt(match[3]) * (1 - factor));
        return `rgba(${r}, ${g}, ${b}, ${match[4]})`;
      }
    }
    return color;
  }

  private _onClick = (e: MouseEvent) => {
    if (!this.canvas) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Check all booth bounds
    for (const bounds of this.boothBounds) {
      if (clickX >= bounds.x && 
          clickX <= bounds.x + bounds.width &&
          clickY >= bounds.y && 
          clickY <= bounds.y + bounds.height) {
        const booth = this.booths.find(b => b.id === bounds.id);
        if (booth && this.onBoothClick) {
          this.onBoothClick(booth.id);
        }
        // Stop the event so the map doesn't handle it
        L.DomEvent.stop(e);
        break;
      }
    }
  };

  private _onMouseMove = (e: MouseEvent) => {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    let hovering = false;
    for (const b of this.boothBounds) {
      if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) {
        hovering = true;
        break;
      }
    }
    this.canvas.style.cursor = hovering ? 'pointer' : 'default';
  };
}

export const EnhancedMapView: React.FC<EnhancedMapViewProps> = ({ elements, onBoothClick, selectedBoothId, startIn3D = true }) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasLayerRef = useRef<FloorPlanCanvasLayer | null>(null);
  const [is3D, setIs3D] = useState(startIn3D);
  const [currentZoom, setCurrentZoom] = useState(17);

  // Convert canvas elements to booth data format
  const booths: Booth[] = elements
    .filter(el => el.type === 'booth')
    .map((element) => {
      const booth = element as BoothElement;
      const status: Booth['status'] =
        booth.status === 'available' ? 'available' :
        booth.status === 'on hold' ? 'onhold' :
        booth.status === 'sold' ? 'occupied' :
        'reserved';
      return {
        id: booth.id,
        name: booth.number || booth.id,
        status,
        x: booth.x,
        y: booth.y,
        width: booth.width,
        height: booth.height,
        section: 'exhibition'
      };
    });

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize map with better zoom controls
    const map = L.map(containerRef.current, {
      center: [12.9715, 77.5945],
      zoom: 17,
      zoomControl: true,
      minZoom: 15, // Prevent zooming out too far
      maxZoom: 20, // Allow detailed zoom
      zoomSnap: 0.5, // Smoother zoom transitions
    });
    mapRef.current = map;

    // Add CARTO Light basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    // Add custom canvas layer
    const canvasLayer = new FloorPlanCanvasLayer(booths, is3D, onBoothClick);
    canvasLayerRef.current = canvasLayer;
    canvasLayer.addTo(map);
    
    // Add zoom event listener to redraw on zoom changes
    map.on('zoomend', () => {
      if (canvasLayerRef.current) {
        canvasLayerRef.current._draw();
      }
      setCurrentZoom(map.getZoom());
    });
    
    // Add move event listener for smooth updates
    map.on('moveend', () => {
      if (canvasLayerRef.current) {
        canvasLayerRef.current._draw();
      }
    });
    
    // Set initial zoom
    setCurrentZoom(map.getZoom());

    // Cleanup
    return () => {
      map.remove();
      mapRef.current = null;
      canvasLayerRef.current = null;
    };
  }, [booths.length]); // Re-initialize when booth data changes
  
  // Update canvas layer when booths change
  useEffect(() => {
    if (canvasLayerRef.current && mapRef.current) {
      // Update booths data in canvas layer
      canvasLayerRef.current.booths = booths;
      canvasLayerRef.current._draw();
    }
  }, [booths]);

  // Update 3D view when is3D changes
  useEffect(() => {
    if (canvasLayerRef.current) {
      canvasLayerRef.current.setView(is3D);
    }
  }, [is3D]);

  const toggleView = () => {
    setIs3D(!is3D);
  };

  return (
    <div className="enhanced-map-container">
      <div 
        ref={containerRef} 
        className="leaflet-container"
      />
      
      {/* Control Panel */}
      <div className="map-control-panel">
        <button
          id="toggleView"
          onClick={toggleView}
          className="map-control-button"
        >
          {is3D ? '2D View' : '3D View'}
        </button>
        
        {/* Zoom Info */}
        <div className="zoom-info">
          Zoom: {currentZoom.toFixed(1)}
        </div>
      </div>
      
      {/* Legend */}
      <div className="map-legend">
        <div className="map-legend-title">Booth Status</div>
        <div className="map-legend-items">
          <div className="map-legend-item">
            <div className="map-legend-color" style={{ backgroundColor: 'rgba(144, 238, 144, 0.8)', border: '1px solid #7BC97B' }}></div>
            <span>Available</span>
          </div>
          <div className="map-legend-item">
            <div className="map-legend-color" style={{ backgroundColor: 'rgba(44, 85, 48, 0.8)', border: '1px solid #1e3a21' }}></div>
            <span>Reserved</span>
          </div>
          <div className="map-legend-item">
            <div className="map-legend-color" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid #dee2e6' }}></div>
            <span>On Hold</span>
          </div>
        </div>
      </div>
    </div>
  );
};
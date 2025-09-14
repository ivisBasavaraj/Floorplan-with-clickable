import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Booth {
  id: string;
  name: string;
  status: 'available' | 'onhold' | 'reserved';
  x: number;
  y: number;
  width: number;
  height: number;
  section?: string;
}

// Custom Canvas Layer class
class FloorPlanCanvasLayer extends L.Layer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private map: L.Map | null = null;
  private is3D: boolean = false;
  private booths: Booth[] = [];
  private boothBounds: Array<{id: string, x: number, y: number, width: number, height: number}> = [];

  constructor(booths: Booth[], is3D: boolean = false) {
    super();
    this.booths = booths;
    this.is3D = is3D;
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
    
    // Add to overlay pane
    map.getPanes().overlayPane.appendChild(this.canvas);
    
    // Bind events
    map.on('viewreset', this._reset, this);
    map.on('zoom', this._reset, this);
    map.on('move', this._reset, this);
    map.on('resize', this._resize, this);
    
    // Add click handler
    L.DomEvent.on(this.canvas, 'click', this._onClick, this);
    
    // Initial draw
    this._reset();
    
    return this;
  }

  onRemove(map: L.Map) {
    if (this.canvas) {
      L.DomEvent.off(this.canvas, 'click', this._onClick, this);
      map.getPanes().overlayPane.removeChild(this.canvas);
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

  private _draw = () => {
    if (!this.ctx || !this.map) return;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas!.width, this.canvas!.height);
    this.boothBounds = [];
    
    // Draw all booths from JSON data
    this.booths.forEach(booth => {
      // Convert booth coordinates to map coordinates
      // Using a base lat/lng and scaling the booth positions
      const baseLatLng = L.latLng(12.9715, 77.5945);
      const boothLatLng = L.latLng(
        baseLatLng.lat + (booth.y - 300) * 0.00001,
        baseLatLng.lng + (booth.x - 600) * 0.00001
      );
      const boothPoint = this.map.latLngToContainerPoint(boothLatLng);
      
      const x = boothPoint.x - booth.width/2;
      const y = boothPoint.y - booth.height/2;
      
      // Get booth color based on status
      let fillColor, strokeColor;
      switch (booth.status) {
        case 'available':
          fillColor = 'rgba(144, 238, 144, 0.8)';
          strokeColor = '#7BC97B';
          break;
        case 'onhold':
          fillColor = 'rgba(255, 255, 255, 0.8)';
          strokeColor = '#dee2e6';
          break;
        case 'reserved':
          fillColor = 'rgba(44, 85, 48, 0.8)';
          strokeColor = '#1e3a21';
          break;
        default:
          fillColor = 'rgba(108, 117, 125, 0.8)';
          strokeColor = '#6c757d';
      }
      
      if (this.is3D) {
        this.draw3DBooth(x, y, booth.width, booth.height, fillColor, strokeColor, booth.name || booth.id);
      } else {
        this.draw2DBooth(x, y, booth.width, booth.height, fillColor, strokeColor, booth.name || booth.id);
      }
      
      // Store booth bounds for click detection
      this.boothBounds.push({
        id: booth.id,
        x: x,
        y: y,
        width: booth.width,
        height: booth.height
      });
    });
  };

  private draw2DBooth(x: number, y: number, width: number, height: number, fillColor: string, strokeColor: string, label: string) {
    if (!this.ctx) return;
    
    this.ctx.fillStyle = fillColor;
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = 2;
    
    this.ctx.fillRect(x, y, width, height);
    this.ctx.strokeRect(x, y, width, height);
    
    // Add label
    this.ctx.fillStyle = '#2d3748';
    this.ctx.font = 'bold 10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(label, x + width/2, y + height/2);
  }

  private draw3DBooth(x: number, y: number, width: number, height: number, fillColor: string, strokeColor: string, label: string) {
    if (!this.ctx) return;
    
    const depth = 20;
    
    // Draw shadow/depth
    this.ctx.fillStyle = this.darkenColor(fillColor, 0.3);
    this.ctx.fillRect(x + depth, y + depth, width, height);
    
    // Draw right side wall
    this.ctx.fillStyle = this.darkenColor(fillColor, 0.2);
    this.ctx.beginPath();
    this.ctx.moveTo(x + width, y);
    this.ctx.lineTo(x + width + depth, y + depth);
    this.ctx.lineTo(x + width + depth, y + height + depth);
    this.ctx.lineTo(x + width, y + height);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Draw bottom side wall
    this.ctx.fillStyle = this.darkenColor(fillColor, 0.15);
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + height);
    this.ctx.lineTo(x + depth, y + height + depth);
    this.ctx.lineTo(x + width + depth, y + height + depth);
    this.ctx.lineTo(x + width, y + height);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Draw top face
    this.ctx.fillStyle = fillColor;
    this.ctx.fillRect(x, y, width, height);
    
    // Draw top face border
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);
    
    // Add label
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(label, x + width/2, y + height/2);
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
        alert(`You clicked ${booth?.name || booth?.id}!`);
        break;
      }
    }
  };
}

const EnhancedLeafletMap: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasLayerRef = useRef<FloorPlanCanvasLayer | null>(null);
  const [is3D, setIs3D] = useState(false);

  // Booth data from ExhibitionFloorPlan
  const booths: Booth[] = [
    { id: 'fertile', name: 'Fertile', status: 'reserved', x: 345, y: 140, width: 60, height: 40, section: 'sustainable' },
    { id: 'ecofin', name: 'EcoFin', status: 'reserved', x: 285, y: 165, width: 50, height: 35, section: 'sustainable' },
    { id: 'ecospa', name: 'EcoSpa', status: 'reserved', x: 395, y: 190, width: 50, height: 35, section: 'sustainable' },
    { id: 'smartte', name: 'SmartTe', status: 'reserved', x: 285, y: 230, width: 60, height: 35, section: 'sustainable' },
    { id: 'bioma', name: 'Bioma', status: 'reserved', x: 780, y: 65, width: 50, height: 35, section: 'waste' },
    { id: 'future', name: 'Future', status: 'reserved', x: 845, y: 65, width: 50, height: 35, section: 'waste' },
    { id: 'nexgo', name: 'NexGo', status: 'reserved', x: 780, y: 115, width: 50, height: 35, section: 'waste' },
    { id: 'terram', name: 'Terram', status: 'reserved', x: 875, y: 115, width: 50, height: 35, section: 'waste' },
    { id: 'available-1', name: '', status: 'available', x: 105, y: 145, width: 70, height: 50 },
    { id: 'available-2', name: '', status: 'available', x: 105, y: 200, width: 70, height: 50 },
    { id: 'onhold-1', name: '', status: 'onhold', x: 250, y: 140, width: 30, height: 30 },
    { id: 'onhold-2', name: '', status: 'onhold', x: 410, y: 140, width: 30, height: 30 },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize map
    const map = L.map(containerRef.current, {
      center: [12.9715, 77.5945],
      zoom: 17,
      zoomControl: true,
    });
    mapRef.current = map;

    // Add CARTO Light basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    // Add custom canvas layer
    const canvasLayer = new FloorPlanCanvasLayer(booths, is3D);
    canvasLayerRef.current = canvasLayer;
    canvasLayer.addTo(map);

    // Cleanup
    return () => {
      map.remove();
      mapRef.current = null;
      canvasLayerRef.current = null;
    };
  }, []);

  const toggleView = () => {
    const newIs3D = !is3D;
    setIs3D(newIs3D);
    if (canvasLayerRef.current) {
      canvasLayerRef.current.setView(newIs3D);
    }
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      <div 
        ref={containerRef} 
        style={{ height: '100%', width: '100%' }}
      />
      <button
        id="toggleView"
        onClick={toggleView}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        {is3D ? '2D View' : '3D View'}
      </button>
    </div>
  );
};

export default EnhancedLeafletMap;
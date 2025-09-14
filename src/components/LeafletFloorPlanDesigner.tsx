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
  color: string;
  section?: string;
}

class FloorPlanCanvasLayer extends L.Layer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private map: L.Map | null = null;
  private is3D: boolean = false;
  private booths: Booth[] = [];
  private boothBounds: Array<{id: string, x: number, y: number, width: number, height: number}> = [];
  private hoveredBooth: string | null = null;
  private onBoothClick: (booth: Booth) => void;
  private onBoothHover: (booth: Booth | null) => void;

  constructor(booths: Booth[], is3D: boolean, onBoothClick: (booth: Booth) => void, onBoothHover: (booth: Booth | null) => void) {
    super();
    this.booths = booths;
    this.is3D = is3D;
    this.onBoothClick = onBoothClick;
    this.onBoothHover = onBoothHover;
  }

  onAdd(map: L.Map) {
    this.map = map;
    
    this.canvas = L.DomUtil.create('canvas', 'leaflet-canvas-layer');
    this.ctx = this.canvas.getContext('2d');
    
    const size = map.getSize();
    this.canvas.width = size.x;
    this.canvas.height = size.y;
    
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'auto';
    
    map.getPanes().overlayPane.appendChild(this.canvas);
    
    map.on('viewreset', this._reset, this);
    map.on('zoom', this._reset, this);
    map.on('move', this._reset, this);
    map.on('resize', this._resize, this);
    
    L.DomEvent.on(this.canvas, 'click', this._onClick, this);
    L.DomEvent.on(this.canvas, 'mousemove', this._onMouseMove, this);
    L.DomEvent.on(this.canvas, 'mouseout', this._onMouseOut, this);
    
    this._reset();
    return this;
  }

  onRemove(map: L.Map) {
    if (this.canvas) {
      L.DomEvent.off(this.canvas, 'click', this._onClick, this);
      L.DomEvent.off(this.canvas, 'mousemove', this._onMouseMove, this);
      L.DomEvent.off(this.canvas, 'mouseout', this._onMouseOut, this);
      map.getPanes().overlayPane.removeChild(this.canvas);
    }
    
    map.off('viewreset', this._reset, this);
    map.off('zoom', this._reset, this);
    map.off('move', this._reset, this);
    map.off('resize', this._resize, this);
    
    return this;
  }

  setView(is3D: boolean) {
    this.is3D = is3D;
    this._draw();
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
    
    this.ctx.clearRect(0, 0, this.canvas!.width, this.canvas!.height);
    this.boothBounds = [];
    
    this.booths.forEach(booth => {
      const baseLatLng = L.latLng(12.9715, 77.5945);
      const boothLatLng = L.latLng(
        baseLatLng.lat + (booth.y - 300) * 0.00001,
        baseLatLng.lng + (booth.x - 600) * 0.00001
      );
      const boothPoint = this.map!.latLngToContainerPoint(boothLatLng);
      
      const x = boothPoint.x - booth.width/2;
      const y = boothPoint.y - booth.height/2;
      
      const isHovered = this.hoveredBooth === booth.id;
      let fillColor = booth.color;
      
      if (isHovered) {
        fillColor = this.lightenColor(booth.color, 0.3);
      }
      
      if (this.is3D) {
        this.draw3DBooth(x, y, booth.width, booth.height, fillColor, booth.color, booth.id);
      } else {
        this.draw2DBooth(x, y, booth.width, booth.height, fillColor, booth.color, booth.id);
      }
      
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
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(label, x + width/2, y + height/2);
  }

  private draw3DBooth(x: number, y: number, width: number, height: number, fillColor: string, strokeColor: string, label: string) {
    if (!this.ctx) return;
    
    const depth = Math.min(width, height) * 0.3;
    
    this.ctx.fillStyle = this.darkenColor(fillColor, 0.4);
    this.ctx.fillRect(x + depth, y + depth, width, height);
    
    this.ctx.fillStyle = this.darkenColor(fillColor, 0.2);
    this.ctx.beginPath();
    this.ctx.moveTo(x + width, y);
    this.ctx.lineTo(x + width + depth, y + depth);
    this.ctx.lineTo(x + width + depth, y + height + depth);
    this.ctx.lineTo(x + width, y + height);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.fillStyle = this.darkenColor(fillColor, 0.15);
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + height);
    this.ctx.lineTo(x + depth, y + height + depth);
    this.ctx.lineTo(x + width + depth, y + height + depth);
    this.ctx.lineTo(x + width, y + height);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.fillStyle = fillColor;
    this.ctx.fillRect(x, y, width, height);
    
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(label, x + width/2, y + height/2);
  }

  private lightenColor(color: string, factor: number): string {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = Math.min(255, parseInt(hex.slice(0, 2), 16) + (255 * factor));
      const g = Math.min(255, parseInt(hex.slice(2, 4), 16) + (255 * factor));
      const b = Math.min(255, parseInt(hex.slice(4, 6), 16) + (255 * factor));
      return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }
    return color;
  }

  private darkenColor(color: string, factor: number): string {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = Math.max(0, parseInt(hex.slice(0, 2), 16) * (1 - factor));
      const g = Math.max(0, parseInt(hex.slice(2, 4), 16) * (1 - factor));
      const b = Math.max(0, parseInt(hex.slice(4, 6), 16) * (1 - factor));
      return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }
    return color;
  }

  private _onClick = (e: MouseEvent) => {
    const booth = this.getBoothAtPoint(e);
    if (booth) {
      this.onBoothClick(booth);
    }
  };

  private _onMouseMove = (e: MouseEvent) => {
    const booth = this.getBoothAtPoint(e);
    if (booth?.id !== this.hoveredBooth) {
      this.hoveredBooth = booth?.id || null;
      this.onBoothHover(booth);
      this._draw();
    }
  };

  private _onMouseOut = () => {
    if (this.hoveredBooth) {
      this.hoveredBooth = null;
      this.onBoothHover(null);
      this._draw();
    }
  };

  private getBoothAtPoint(e: MouseEvent): Booth | null {
    if (!this.canvas) return null;
    
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    for (const bounds of this.boothBounds) {
      if (clickX >= bounds.x && 
          clickX <= bounds.x + bounds.width &&
          clickY >= bounds.y && 
          clickY <= bounds.y + bounds.height) {
        return this.booths.find(b => b.id === bounds.id) || null;
      }
    }
    return null;
  }
}

const LeafletFloorPlanDesigner: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasLayerRef = useRef<FloorPlanCanvasLayer | null>(null);
  const [is3D, setIs3D] = useState(false);
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  const [hoveredBooth, setHoveredBooth] = useState<Booth | null>(null);

  const booths: Booth[] = [
    { id: 'fertile', name: 'Fertile', status: 'reserved', x: 345, y: 140, width: 60, height: 40, color: '#2c5530', section: 'sustainable' },
    { id: 'ecofin', name: 'EcoFin', status: 'reserved', x: 285, y: 165, width: 50, height: 35, color: '#2c5530', section: 'sustainable' },
    { id: 'ecospa', name: 'EcoSpa', status: 'reserved', x: 395, y: 190, width: 50, height: 35, color: '#2c5530', section: 'sustainable' },
    { id: 'smartte', name: 'SmartTe', status: 'reserved', x: 285, y: 230, width: 60, height: 35, color: '#2c5530', section: 'sustainable' },
    { id: 'bioma', name: 'Bioma', status: 'reserved', x: 780, y: 65, width: 50, height: 35, color: '#2c5530', section: 'waste' },
    { id: 'future', name: 'Future', status: 'reserved', x: 845, y: 65, width: 50, height: 35, color: '#2c5530', section: 'waste' },
    { id: 'available-1', name: 'Available', status: 'available', x: 105, y: 145, width: 70, height: 50, color: '#90EE90' },
    { id: 'available-2', name: 'Available', status: 'available', x: 105, y: 200, width: 70, height: 50, color: '#90EE90' },
    { id: 'onhold-1', name: 'On Hold', status: 'onhold', x: 250, y: 140, width: 30, height: 30, color: '#ffffff' },
    { id: 'onhold-2', name: 'On Hold', status: 'onhold', x: 410, y: 140, width: 30, height: 30, color: '#ffffff' },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [12.9715, 77.5945],
      zoom: 17,
      zoomControl: true,
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    const canvasLayer = new FloorPlanCanvasLayer(booths, is3D, setSelectedBooth, setHoveredBooth);
    canvasLayerRef.current = canvasLayer;
    canvasLayer.addTo(map);

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
    <div style={{ position: 'relative', height: '100vh', width: '100%', display: 'flex' }}>
      <div 
        ref={containerRef} 
        style={{ flex: 1, height: '100%' }}
      />
      
      <button
        id="toggleView"
        onClick={toggleView}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
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

      {hoveredBooth && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            padding: '5px 10px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            borderRadius: '3px',
            fontSize: '12px',
            pointerEvents: 'none'
          }}
        >
          {hoveredBooth.id}
        </div>
      )}

      {selectedBooth && (
        <div
          style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '300px',
            height: '100%',
            backgroundColor: 'white',
            boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
            padding: '20px',
            zIndex: 1000,
            overflowY: 'auto'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Booth Details</h3>
            <button
              onClick={() => setSelectedBooth(null)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>ID:</strong> {selectedBooth.id}
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>Name:</strong> {selectedBooth.name || 'N/A'}
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>Status:</strong> 
            <span style={{ 
              marginLeft: '10px',
              padding: '2px 8px',
              borderRadius: '3px',
              backgroundColor: selectedBooth.color,
              color: 'white',
              fontSize: '12px'
            }}>
              {selectedBooth.status}
            </span>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>Dimensions:</strong> {selectedBooth.width} × {selectedBooth.height}
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>Position:</strong> ({selectedBooth.x}, {selectedBooth.y})
          </div>
          
          {selectedBooth.section && (
            <div style={{ marginBottom: '15px' }}>
              <strong>Section:</strong> {selectedBooth.section}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeafletFloorPlanDesigner;
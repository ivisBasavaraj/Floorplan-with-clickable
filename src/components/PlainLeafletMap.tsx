import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Ensure default marker icons resolve (optional safety)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Build transform helpers compatible with previous FloorPlanMap
function buildTransform(map: L.Map, imageBounds?: [[number, number], [number, number]]) {
  const zoom = map.getZoom();
  const bounds = imageBounds ? L.latLngBounds(imageBounds) : null;

  const project = (lat: number, lng: number, z: number = zoom) => map.project(L.latLng(lat, lng), z);
  const unproject = (point: any, z: number = zoom) => {
    const p = L.point(
      point.x ?? point[0] ?? point.lng ?? 0,
      point.y ?? point[1] ?? point.lat ?? 0
    );
    return map.unproject(p, z);
  };

  const overlayXYToLatLng = (x: number, y: number, width: number, height: number) => {
    if (!bounds || !width || !height) return null;

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    const pSW = project(sw.lat, sw.lng);
    const pNE = project(ne.lat, ne.lng);

    const pNW = L.point(pSW.x, pNE.y);
    const pSE = L.point(pNE.x, pSW.y);

    const u = x / width;
    const v = y / height;

    const px = pNW.x + u * (pSE.x - pNW.x);
    const py = pNW.y + v * (pSE.y - pNW.y);

    return unproject({ x: px, y: py });
  };

  const overlayXYToContainerPoint = (x: number, y: number, width: number, height: number) => {
    const ll = overlayXYToLatLng(x, y, width, height);
    if (!ll) return null as any;
    return map.latLngToContainerPoint(ll);
  };

  return {
    map,
    zoom,
    size: map.getSize(),
    metersPerPixel: (lat = map.getCenter().lat, z = zoom) =>
      156543.03392 * Math.cos((lat * Math.PI) / 180) / Math.pow(2, z),
    latLngToContainerPoint: (lat: number, lng: number) =>
      map.latLngToContainerPoint(L.latLng(lat, lng)),
    containerPointToLatLng: (x: number, y: number) =>
      map.containerPointToLatLng(L.point(x, y)),
    project,
    unproject,
    overlayBounds: bounds,
    overlay: {
      xyToLatLng: overlayXYToLatLng,
      xyToContainerPoint: overlayXYToContainerPoint,
    },
  };
}

export interface PlainLeafletMapProps {
  drawBooths: (ctx: CanvasRenderingContext2D, transform: any) => void;
  imageBounds?: [[number, number], [number, number]];
  center?: [number, number];
  zoom?: number;
}

const PlainLeafletMap: React.FC<PlainLeafletMapProps> = ({
  drawBooths,
  imageBounds,
  center = [12.9716, 77.5946],
  zoom = 16,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Init map
    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true,
    });
    mapRef.current = map;

    // Base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      attribution: '\u00A9 OpenStreetMap contributors',
      tileSize: 256,
    }).addTo(map);

    // Canvas overlay in overlay pane
    const canvas = L.DomUtil.create('canvas', 'leaflet-custom-canvas') as HTMLCanvasElement;
    const size = map.getSize();
    canvas.width = size.x;
    canvas.height = size.y;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    map.getPanes().overlayPane.appendChild(canvas);
    canvasRef.current = canvas;

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    const redraw = () => {
      if (!mapRef.current || !canvasRef.current) return;
      const sz = mapRef.current.getSize();
      canvasRef.current.width = sz.x;
      canvasRef.current.height = sz.y;
      ctx.clearRect(0, 0, sz.x, sz.y);
      const transform = buildTransform(mapRef.current, imageBounds);
      drawBooths(ctx, transform);
    };

    map.on('move', redraw);
    map.on('zoom', redraw);
    map.on('resize', redraw);
    redraw();

    return () => {
      map.off('move', redraw);
      map.off('zoom', redraw);
      map.off('resize', redraw);
      if (canvasRef.current && canvasRef.current.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current);
      }
      canvasRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [center.toString(), zoom, imageBounds, drawBooths]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default PlainLeafletMap;
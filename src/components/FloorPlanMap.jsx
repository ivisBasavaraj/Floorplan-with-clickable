import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Ensure Leaflet default marker icons load from CDN (optional safety)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/**
 * Build a transform object that your drawBooths(ctx, transform) can use.
 * Includes:
 * - latLng/container point conversions
 * - project/unproject using map CRS at current zoom
 * - metersPerPixel approximation
 * - overlay helpers to map your floor-plan local (x,y) to lat/lng or container pixels using imageBounds
 */
function buildTransform(map, imageBounds) {
  const zoom = map.getZoom();
  const bounds = imageBounds ? L.latLngBounds(imageBounds) : null;

  const project = (lat, lng, z = zoom) => map.project(L.latLng(lat, lng), z);
  const unproject = (point, z = zoom) => {
    const p = L.point(
      point.x ?? point[0] ?? point.lng ?? 0,
      point.y ?? point[1] ?? point.lat ?? 0
    );
    return map.unproject(p, z);
  };

  // Given overlay-local (x,y) in pixels and its native width/height,
  // map to lat/lng using linear interpolation in projected pixel space.
  const overlayXYToLatLng = (x, y, width, height) => {
    if (!bounds || !width || !height) return null;

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    // Project corners in pixel space at current zoom
    const pSW = project(sw.lat, sw.lng);
    const pNE = project(ne.lat, ne.lng);

    // Construct the other two corners in projected space
    const pNW = L.point(pSW.x, pNE.y);
    const pSE = L.point(pNE.x, pSW.y);

    // Normalize
    const u = x / width; // 0..1 left->right
    const v = y / height; // 0..1 top->bottom

    // Bilinear along rect (axis-aligned in projected web-mercator)
    const px = pNW.x + u * (pSE.x - pNW.x);
    const py = pNW.y + v * (pSE.y - pNW.y);

    return unproject({ x: px, y: py });
  };

  const overlayXYToContainerPoint = (x, y, width, height) => {
    const ll = overlayXYToLatLng(x, y, width, height);
    if (!ll) return null;
    return map.latLngToContainerPoint(ll);
  };

  return {
    map,
    zoom,
    size: map.getSize(),
    // Approximate meters per pixel at given latitude
    metersPerPixel: (lat = map.getCenter().lat, z = zoom) =>
      156543.03392 * Math.cos((lat * Math.PI) / 180) / Math.pow(2, z),

    // General conversions
    latLngToContainerPoint: (lat, lng) =>
      map.latLngToContainerPoint(L.latLng(lat, lng)),
    containerPointToLatLng: (x, y) =>
      map.containerPointToLatLng(L.point(x, y)),
    project,
    unproject,

    // Overlay bounds (SW-NE) and helpers
    overlayBounds: bounds,
    overlay: {
      xyToLatLng: overlayXYToLatLng,
      xyToContainerPoint: overlayXYToContainerPoint,
    },
  };
}

/**
 * Canvas overlay that calls your drawBooths(ctx, transform) on pan/zoom/resize.
 * Props:
 * - drawBooths: (ctx, transform) => void
 * - imageBounds: [[south, west], [north, east]] to georeference your floor plan
 */
const CanvasLayer = ({ drawBooths, imageBounds }) => {
  const map = useMap();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Create and add canvas to the overlay pane
    const canvas = L.DomUtil.create('canvas', 'leaflet-custom-canvas');
    const size = map.getSize();
    canvas.width = size.x;
    canvas.height = size.y;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none'; // allow map interactions through
    map.getPanes().overlayPane.appendChild(canvas);
    canvasRef.current = canvas;

    const ctx = canvas.getContext('2d');

    const redraw = () => {
      if (!canvasRef.current) return;
      const sz = map.getSize();
      // Resize canvas to map viewport
      canvasRef.current.width = sz.x;
      canvasRef.current.height = sz.y;

      // Clear and let your renderer draw
      ctx.clearRect(0, 0, sz.x, sz.y);
      const transform = buildTransform(map, imageBounds);
      // Call user's existing booth drawing code
      drawBooths(ctx, transform);
    };

    // Attach redraw handlers
    map.on('move', redraw);
    map.on('zoom', redraw);
    map.on('resize', redraw);

    // Initial draw
    redraw();

    return () => {
      map.off('move', redraw);
      map.off('zoom', redraw);
      map.off('resize', redraw);
      if (canvasRef.current && canvasRef.current.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current);
      }
      canvasRef.current = null;
    };
  }, [map, drawBooths, imageBounds]);

  return null;
};

/**
 * FloorPlanMap: OSM base + Canvas overlay.
 * Usage:
 *   <FloorPlanMap
 *     drawBooths={drawBooths}
 *     imageBounds={[[south, west], [north, east]]}
 *   />
 */
const FloorPlanMap = ({ drawBooths = () => {}, imageBounds }) => {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={16}
        style={{ height: '100vh', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />
        <CanvasLayer drawBooths={drawBooths} imageBounds={imageBounds} />
      </MapContainer>
    </div>
  );
};

export default FloorPlanMap;

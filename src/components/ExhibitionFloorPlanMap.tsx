import React, { useState } from 'react';
import PlainLeafletMap from './PlainLeafletMap';

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

const ExhibitionFloorPlanMap: React.FC = () => {
  const [selectedBooth, setSelectedBooth] = useState<string | null>(null);

  const booths: Booth[] = [
    // Sustainable Construction Section
    { id: 'fertile', name: 'Fertile', status: 'reserved', x: 345, y: 140, width: 60, height: 40, section: 'sustainable' },
    { id: 'ecofin', name: 'EcoFin', status: 'reserved', x: 285, y: 165, width: 50, height: 35, section: 'sustainable' },
    { id: 'ecospa', name: 'EcoSpa', status: 'reserved', x: 395, y: 190, width: 50, height: 35, section: 'sustainable' },
    { id: 'smartte', name: 'SmartTe', status: 'reserved', x: 285, y: 230, width: 60, height: 35, section: 'sustainable' },
    
    // Waste Management Section
    { id: 'bioma', name: 'Bioma', status: 'reserved', x: 780, y: 65, width: 50, height: 35, section: 'waste' },
    { id: 'future', name: 'Future', status: 'reserved', x: 845, y: 65, width: 50, height: 35, section: 'waste' },
    { id: 'nexgo', name: 'NexGo', status: 'reserved', x: 780, y: 115, width: 50, height: 35, section: 'waste' },
    { id: 'terram', name: 'Terram', status: 'reserved', x: 875, y: 115, width: 50, height: 35, section: 'waste' },
    { id: 'bioly', name: 'Bioly', status: 'reserved', x: 780, y: 165, width: 40, height: 30, section: 'waste' },
    { id: 'evergreen', name: 'EverGreen', status: 'reserved', x: 780, y: 230, width: 65, height: 35, section: 'waste' },
    { id: 'ecome-ecoso', name: 'EcoMe EcoSo', status: 'reserved', x: 850, y: 230, width: 75, height: 35, section: 'waste' },
    
    // Available booths
    { id: 'available-1', name: '', status: 'available', x: 105, y: 145, width: 70, height: 50 },
    { id: 'available-2', name: '', status: 'available', x: 105, y: 200, width: 70, height: 50 },
    { id: 'available-3', name: '', status: 'available', x: 180, y: 145, width: 70, height: 50 },
    { id: 'available-4', name: '', status: 'available', x: 180, y: 200, width: 70, height: 50 },
    { id: 'available-5', name: '', status: 'available', x: 520, y: 315, width: 80, height: 40 },
    
    // On hold booths
    { id: 'onhold-1', name: '', status: 'onhold', x: 250, y: 140, width: 30, height: 30 },
    { id: 'onhold-2', name: '', status: 'onhold', x: 410, y: 140, width: 30, height: 30 },
    { id: 'onhold-3', name: '', status: 'onhold', x: 450, y: 140, width: 30, height: 30 },
    { id: 'onhold-4', name: '', status: 'onhold', x: 490, y: 140, width: 30, height: 30 },
    { id: 'onhold-5', name: '', status: 'onhold', x: 250, y: 175, width: 30, height: 30 },
    { id: 'onhold-6', name: '', status: 'onhold', x: 410, y: 175, width: 30, height: 30 },
    { id: 'onhold-7', name: '', status: 'onhold', x: 450, y: 175, width: 30, height: 30 },
    { id: 'onhold-8', name: '', status: 'onhold', x: 490, y: 175, width: 30, height: 30 },
    { id: 'onhold-9', name: '', status: 'onhold', x: 410, y: 210, width: 30, height: 30 },
    { id: 'onhold-10', name: '', status: 'onhold', x: 450, y: 210, width: 30, height: 30 },
    { id: 'onhold-11', name: '', status: 'onhold', x: 490, y: 210, width: 30, height: 30 },
    
    // Reserved booths
    { id: 'reserved-1', name: '', status: 'reserved', x: 990, y: 225, width: 25, height: 40 },
  ];

  const drawFloorPlan = (ctx: CanvasRenderingContext2D, transform: any) => {
    const floorPlanWidth = 1200;
    const floorPlanHeight = 600;
    
    // Define floor plan bounds in lat/lng (adjust these coordinates as needed)
    const imageBounds = [[12.9700, 77.5930], [12.9730, 77.5960]];
    
    // Draw blue pathway
    const pathPoints = [
      [650, 0], [650, 180], [670, 200], [680, 200], [700, 220], 
      [700, 380], [680, 400], [520, 400], [500, 420], [500, 600]
    ];
    
    ctx.strokeStyle = '#4A90E2';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    
    pathPoints.forEach((point, index) => {
      const containerPoint = transform.overlay.xyToContainerPoint(
        point[0], point[1], floorPlanWidth, floorPlanHeight
      );
      if (containerPoint) {
        if (index === 0) {
          ctx.moveTo(containerPoint.x, containerPoint.y);
        } else {
          ctx.lineTo(containerPoint.x, containerPoint.y);
        }
      }
    });
    ctx.stroke();

    // Draw pathway circles
    const circles = [[680, 180], [500, 520]];
    circles.forEach(circle => {
      const containerPoint = transform.overlay.xyToContainerPoint(
        circle[0], circle[1], floorPlanWidth, floorPlanHeight
      );
      if (containerPoint) {
        ctx.fillStyle = '#4A90E2';
        ctx.beginPath();
        ctx.arc(containerPoint.x, containerPoint.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Draw booths
    booths.forEach(booth => {
      const topLeft = transform.overlay.xyToContainerPoint(
        booth.x, booth.y, floorPlanWidth, floorPlanHeight
      );
      const bottomRight = transform.overlay.xyToContainerPoint(
        booth.x + booth.width, booth.y + booth.height, floorPlanWidth, floorPlanHeight
      );
      
      if (topLeft && bottomRight) {
        const width = bottomRight.x - topLeft.x;
        const height = bottomRight.y - topLeft.y;
        
        // Set booth colors based on status
        let fillColor, borderColor, textColor = '#000';
        switch (booth.status) {
          case 'available':
            fillColor = '#90EE90';
            borderColor = '#7BC97B';
            break;
          case 'onhold':
            fillColor = '#ffffff';
            borderColor = '#dee2e6';
            break;
          case 'reserved':
            fillColor = '#2c5530';
            borderColor = '#1e3a21';
            textColor = '#fff';
            break;
        }
        
        // Draw booth rectangle
        ctx.fillStyle = fillColor;
        ctx.fillRect(topLeft.x, topLeft.y, width, height);
        
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(topLeft.x, topLeft.y, width, height);
        
        // Draw booth label
        if (booth.name) {
          ctx.fillStyle = textColor;
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            booth.name,
            topLeft.x + width / 2,
            topLeft.y + height / 2
          );
        }
      }
    });

    // Draw section labels
    const sections = [
      { text: 'Sustainable Construction', x: 250, y: 100 },
      { text: 'Waste Management', x: 850, y: 280 },
      { text: 'PIAZZA', x: 595, y: 470 },
      { text: 'HALL 3.1', x: 327, y: 520 }
    ];
    
    sections.forEach(section => {
      const containerPoint = transform.overlay.xyToContainerPoint(
        section.x, section.y, floorPlanWidth, floorPlanHeight
      );
      if (containerPoint) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 1;
        
        const textWidth = ctx.measureText(section.text).width + 20;
        const textHeight = 30;
        
        ctx.fillRect(
          containerPoint.x - textWidth/2, 
          containerPoint.y - textHeight/2, 
          textWidth, 
          textHeight
        );
        ctx.strokeRect(
          containerPoint.x - textWidth/2, 
          containerPoint.y - textHeight/2, 
          textWidth, 
          textHeight
        );
        
        ctx.fillStyle = '#495057';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(section.text, containerPoint.x, containerPoint.y);
      }
    });
  };

  // Define the bounds for the floor plan overlay
  const imageBounds: [[number, number], [number, number]] = [[12.9700, 77.5930], [12.9730, 77.5960]];

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <PlainLeafletMap
        drawBooths={drawFloorPlan}
        imageBounds={imageBounds}
        center={[12.9715, 77.5945]}
        zoom={17}
      />
    </div>
  );
};

export default ExhibitionFloorPlanMap;
import React, { useState, useEffect } from 'react';
import { Canvas } from '../components/canvas/Canvas';
import { useCanvasStore } from '../store/canvasStore';

export const PreviewPage: React.FC = () => {
  const [view, setView] = useState<'2d' | '3d'>('2d');
  const { loadFloorPlan } = useCanvasStore();

  useEffect(() => {
    const previewData = localStorage.getItem('previewData');
    if (previewData) {
      const data = JSON.parse(previewData);
      loadFloorPlan(data);
    }
  }, [loadFloorPlan]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="h-16 bg-white border-b flex items-center justify-between px-6">
        <h1 className="text-xl font-semibold">Floor Plan Preview</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('2d')}
            className={`px-4 py-2 rounded ${view === '2d' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            2D View
          </button>
          <button
            onClick={() => setView('3d')}
            className={`px-4 py-2 rounded ${view === '3d' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            3D View
          </button>
        </div>
      </div>
      
      <div className="flex-1">
        {view === '2d' ? (
          <Canvas />
        ) : (
          <div className="h-full bg-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="mb-8">
                <div className="w-64 h-48 mx-auto bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg shadow-2xl transform perspective-1000 rotate-x-12">
                  <div className="p-4 grid grid-cols-3 gap-2 h-full">
                    {Array.from({length: 9}).map((_, i) => (
                      <div key={i} className="bg-blue-500 rounded shadow-lg flex items-center justify-center text-xs">
                        B{i+1}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">3D Floor Plan</h2>
              <p className="text-gray-400">Interactive 3D view of your floor plan</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
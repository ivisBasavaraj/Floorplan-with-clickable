import React, { useMemo } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { BoothElement } from '../../types/canvas';

interface PathSelectorProps {
  startBoothId: string | null;
  endBoothId: string | null;
  onStartBoothSelect: (boothId: string) => void;
  onEndBoothSelect: (boothId: string) => void;
  disabled?: boolean;
}

export const PathSelector: React.FC<PathSelectorProps> = ({
  startBoothId,
  endBoothId,
  onStartBoothSelect,
  onEndBoothSelect,
  disabled = false
}) => {
  const { elements } = useCanvasStore();
  
  // Filter only booth elements and sort them by booth number
  const boothElements = useMemo(() => {
    return elements
      .filter((element): element is BoothElement => element.type === 'booth')
      .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
  }, [elements]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-col">
        <label htmlFor="start-booth-select" className="text-xs text-gray-600 mb-1">
          Start Booth
        </label>
        <select
          id="start-booth-select"
          className="px-2 py-1 rounded-md text-sm border border-gray-300 bg-white"
          value={startBoothId || ''}
          onChange={(e) => onStartBoothSelect(e.target.value)}
          disabled={disabled}
        >
          <option value="">Select start booth</option>
          {boothElements.map((booth) => (
            <option key={booth.id} value={booth.id}>
              {booth.number} - {booth.dimensions.imperial}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label htmlFor="end-booth-select" className="text-xs text-gray-600 mb-1">
          End Booth
        </label>
        <select
          id="end-booth-select"
          className="px-2 py-1 rounded-md text-sm border border-gray-300 bg-white"
          value={endBoothId || ''}
          onChange={(e) => onEndBoothSelect(e.target.value)}
          disabled={disabled}
        >
          <option value="">Select end booth</option>
          {boothElements.map((booth) => (
            <option key={booth.id} value={booth.id}>
              {booth.number} - {booth.dimensions.imperial}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
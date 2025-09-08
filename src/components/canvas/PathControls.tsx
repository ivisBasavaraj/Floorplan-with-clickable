import React from 'react';
import { PathSelector } from './PathSelector';

interface PathControlsProps {
  pathMode: boolean;
  startBoothId: string | null;
  endBoothId: string | null;
  togglePathMode: () => void;
  clearPath: () => void;
  selectStartBooth?: (boothId: string) => void;
  selectEndBooth?: (boothId: string) => void;
}

export const PathControls: React.FC<PathControlsProps> = ({
  pathMode,
  startBoothId,
  endBoothId,
  togglePathMode,
  clearPath,
  selectStartBooth,
  selectEndBooth
}) => {
  return (
    <div className="bg-white p-3 rounded-md shadow-md flex flex-col gap-3 w-64">

      
      {pathMode && (
        <>
          {selectStartBooth && selectEndBooth ? (
            <PathSelector
              startBoothId={startBoothId}
              endBoothId={endBoothId}
              onStartBoothSelect={selectStartBooth}
              onEndBoothSelect={selectEndBooth}
            />
          ) : (
            <div className="text-xs text-gray-600 mt-1">
              <div>Start Booth: {startBoothId || 'Not selected'}</div>
              <div>End Booth: {endBoothId || 'Not selected'}</div>
            </div>
          )}
          
          <button
            className="px-3 py-1 rounded-md text-sm font-medium bg-gray-200 text-gray-700"
            onClick={clearPath}
            disabled={!startBoothId && !endBoothId}
          >
            Clear Path
          </button>
          
          <div className="text-xs text-gray-500 italic mt-1">
            {selectStartBooth && selectEndBooth 
              ? 'Select booths from the dropdown or click directly on booths'
              : 'Click on booths to select start and end points'}
          </div>
        </>
      )}
    </div>
  );
};
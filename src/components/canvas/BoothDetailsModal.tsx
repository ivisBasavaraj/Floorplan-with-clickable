import React from 'react';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';

interface BoothData {
  boothNo: string;
  boothName: string;
  owner: string;
  size: string;
  otherDetails: string;
}

interface BoothDetailsModalProps {
  boothData: BoothData;
  onClose: () => void;
}

export const BoothDetailsModal: React.FC<BoothDetailsModalProps> = ({ boothData, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FontAwesomeIcon icon="fas fa-info-circle" className="text-blue-600 mr-2" size={20} />
              Booth Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <FontAwesomeIcon icon="fas fa-hashtag" className="text-blue-600 mr-3" size={16} />
              <div>
                <div className="text-sm font-medium text-gray-700">Booth No</div>
                <div className="text-lg font-semibold text-gray-900">{boothData.boothNo}</div>
              </div>
            </div>
            
            {boothData.boothName && (
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <FontAwesomeIcon icon="fas fa-store" className="text-green-600 mr-3" size={16} />
                <div>
                  <div className="text-sm font-medium text-gray-700">Booth Name</div>
                  <div className="text-gray-900">{boothData.boothName}</div>
                </div>
              </div>
            )}
            
            {boothData.owner && (
              <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                <FontAwesomeIcon icon="fas fa-user" className="text-purple-600 mr-3" size={16} />
                <div>
                  <div className="text-sm font-medium text-gray-700">Owner</div>
                  <div className="text-gray-900">{boothData.owner}</div>
                </div>
              </div>
            )}
            
            {boothData.size && (
              <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                <FontAwesomeIcon icon="fas fa-ruler-combined" className="text-orange-600 mr-3" size={16} />
                <div>
                  <div className="text-sm font-medium text-gray-700">Size</div>
                  <div className="text-gray-900">{boothData.size}</div>
                </div>
              </div>
            )}
            
            {boothData.otherDetails && (
              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <FontAwesomeIcon icon="fas fa-clipboard-list" className="text-gray-600 mr-3 mt-1" size={16} />
                <div>
                  <div className="text-sm font-medium text-gray-700">Other Details</div>
                  <div className="text-gray-900">{boothData.otherDetails}</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
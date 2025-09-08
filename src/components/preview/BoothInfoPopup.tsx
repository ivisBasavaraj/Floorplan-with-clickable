import React from 'react';
import { BoothElement } from '../../types/canvas';
import { useFloorPlanViewerStore } from '../../store/floorPlanViewerStore';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';

interface BoothInfoPopupProps {
  boothId: string;
  onClose: () => void;
}

export const BoothInfoPopup: React.FC<BoothInfoPopupProps> = ({ boothId, onClose }) => {
  const { getCompanyByBoothId } = useFloorPlanViewerStore();
  const company = getCompanyByBoothId(boothId);

  if (!company) {
    return null;
  }

  // Convert company data to booth-like structure for compatibility
  const booth = {
    number: company.boothNumber,
    status: 'occupied' as const,
    dimensions: {
      imperial: '10\' x 8\'',
      metric: '3m x 2.4m'
    },
    exhibitor: {
      companyName: company.name,
      description: company.description,
      category: company.category,
      contact: company.contact,
      logo: company.logo
    },
    website: company.website,
    description: company.description
  };
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'reserved':
        return 'bg-orange-100 text-orange-800';
      case 'sold':
        return 'bg-red-100 text-red-800';
      case 'on-hold':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {/* Company Logo */}
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 
                flex items-center justify-center text-white font-bold text-xl
                ${company.logo ? 'hidden' : ''}`}>
                {company.name.charAt(0).toUpperCase()}
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900">{company.name}</h3>
                <p className="text-gray-600">Booth #{booth.number}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booth.status)}`}>
                    {booth.status.charAt(0).toUpperCase() + booth.status.slice(1)}
                  </div>
                  {company.featured && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs 
                      font-medium bg-purple-100 text-purple-800">
                      Featured
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FontAwesomeIcon icon="times" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Company Description */}
          {booth.description && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">About</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{booth.description}</p>
            </div>
          )}

          {/* Booth Details */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Booth Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-500 block mb-1">Booth Number</span>
                <p className="font-medium text-gray-900">{booth.number}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-500 block mb-1">Floor Level</span>
                <p className="font-medium text-gray-900">Level {company.floor}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-500 block mb-1">Category</span>
                <p className="font-medium text-gray-900">{company.category}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-500 block mb-1">Dimensions</span>
                <p className="font-medium text-gray-900">{booth.dimensions.imperial}</p>
                <p className="text-xs text-gray-500">{booth.dimensions.metric}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          {booth.exhibitor?.contact && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
              <div className="space-y-3">
                {booth.exhibitor.contact.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FontAwesomeIcon icon="phone" className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{booth.exhibitor.contact.phone}</p>
                    </div>
                  </div>
                )}
                {booth.exhibitor.contact.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <FontAwesomeIcon icon="envelope" className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a 
                        href={`mailto:${booth.exhibitor.contact.email}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {booth.exhibitor.contact.email}
                      </a>
                    </div>
                  </div>
                )}
                {(booth.exhibitor.contact.website || booth.website) && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FontAwesomeIcon icon="globe" className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Website</p>
                      <a 
                        href={booth.exhibitor.contact.website || booth.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {booth.exhibitor.contact.website || booth.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 
              transition-colors font-medium text-sm flex items-center justify-center gap-2">
              <FontAwesomeIcon icon="info-circle" className="w-4 h-4" />
              More Info
            </button>
            {booth.exhibitor?.contact?.email && (
              <button 
                onClick={() => window.open(`mailto:${booth.exhibitor?.contact?.email}`, '_blank')}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 
                  transition-colors font-medium text-sm flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon="envelope" className="w-4 h-4" />
                Contact
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
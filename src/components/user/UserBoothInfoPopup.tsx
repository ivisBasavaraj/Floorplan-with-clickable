import React from 'react';
import { BoothElement } from '../../types/canvas';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';

interface Company {
  id: string;
  name: string;
  booth_number: string;
  floor: number;
  status: 'available' | 'sold' | 'reserved';
  category: string;
  description?: string;
  logo?: string;
  featured: boolean;
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  website?: string;
}

interface UserBoothInfoPopupProps {
  booth: BoothElement;
  company?: Company;
  onClose: () => void;
}

export const UserBoothInfoPopup: React.FC<UserBoothInfoPopupProps> = ({ booth, company, onClose }) => {
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'reserved':
        return 'bg-orange-100 text-orange-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      case 'occupied':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'reserved':
        return 'Reserved';
      case 'sold':
        return 'Occupied';
      case 'occupied':
        return 'Occupied';
      case 'on-hold':
        return 'On Hold';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="glass-panel max-w-lg w-full max-h-[90vh] overflow-y-auto animate-float">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {/* Company Logo */}
              {company?.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-white border-opacity-30 shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br from-white to-gray-100 
                flex items-center justify-center text-purple-600 font-bold text-xl shadow-lg
                ${company?.logo ? 'hidden' : ''}`}>
                {company?.name?.charAt(0).toUpperCase() || booth.number.charAt(0)}
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white">
                  {company?.name || `Booth ${booth.number}`}
                </h3>
                <p className="text-white text-opacity-90">Stand #{booth.number}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-white bg-opacity-20 text-white border border-white border-opacity-30`}>
                    {getStatusText(company?.status || 'available')}
                  </div>
                  {company?.featured && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs 
                      font-bold bg-yellow-400 text-yellow-900">
                      <FontAwesomeIcon icon="fas fa-star" size={10} className="mr-1" />
                      Destacado
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white text-opacity-70 hover:text-white p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <FontAwesomeIcon icon="fas fa-times" size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Company Description */}
          {company?.description && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <FontAwesomeIcon icon="fas fa-info-circle" size={16} className="mr-2 text-purple-500" />
                About the Company
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">{company.description}</p>
            </div>
          )}

          {/* Booth Details - removed for simplified user view */}

          {/* Contact Information */}
          {company?.contact && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <FontAwesomeIcon icon="fas fa-address-book" size={16} className="mr-2 text-green-500" />
                Contact Information
              </h4>
              <div className="space-y-3">
                {company.contact.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                      <FontAwesomeIcon icon="fas fa-phone" size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Phone</p>
                      <a 
                        href={`tel:${company.contact.phone}`}
                        className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {company.contact.phone}
                      </a>
                    </div>
                  </div>
                )}
                {company.contact.email && (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                      <FontAwesomeIcon icon="fas fa-envelope" size={14} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-medium">Email</p>
                      <a 
                        href={`mailto:${company.contact.email}`}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {company.contact.email}
                      </a>
                    </div>
                  </div>
                )}
                {(company.contact.website || company.website) && (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                      <FontAwesomeIcon icon="fas fa-globe" size={14} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Sitio Web</p>
                      <a 
                        href={company.contact.website || company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {(company.contact.website || company.website)?.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Location Details - removed for simplified user view */}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            {company?.contact?.website || company?.website ? (
              <button 
                onClick={() => window.open(company.contact?.website || company.website, '_blank')}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-blue-700 
                  transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transform hover:scale-105"
              >
                <FontAwesomeIcon icon="fas fa-external-link-alt" size={14} />
                Visit Website
              </button>
            ) : (
              <button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-blue-700 
                transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transform hover:scale-105">
                <FontAwesomeIcon icon="fas fa-info-circle" size={14} />
                More Information
              </button>
            )}
            {company?.contact?.email && (
              <button 
                onClick={() => window.open(`mailto:${company.contact?.email}`, '_blank')}
                className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:from-gray-200 hover:to-gray-300 
                  transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2 shadow-md transform hover:scale-105 border border-gray-300"
              >
                <FontAwesomeIcon icon="fas fa-envelope" size={14} />
                Contact
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
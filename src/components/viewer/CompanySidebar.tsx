import React, { useState, useMemo } from 'react';
import { useFloorPlanViewerStore } from '../../store/floorPlanViewerStore';
import { Company } from '../../types/floorPlanViewer';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';

interface CompanySidebarProps {
  collapsed: boolean;
  onCompanySelect?: (company: Company) => void;
}

export const CompanySidebar: React.FC<CompanySidebarProps> = ({
  collapsed,
  onCompanySelect
}) => {
  const {
    searchFilters,
    updateSearchFilters,
    clearSearch,
    toggleSidebar,
    getFilteredCompanies,
    setSelectedBooth,
    selectedBoothId
  } = useFloorPlanViewerStore();

  const [searchFocused, setSearchFocused] = useState(false);
  const filteredCompanies = useMemo(() => getFilteredCompanies(), [getFilteredCompanies]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSearchFilters({ term: e.target.value });
  };

  const handleCompanyClick = (company: Company) => {
    setSelectedBooth(company.id);
    onCompanySelect?.(company);
  };

  const handleClearSearch = () => {
    clearSearch();
  };

  if (collapsed) {
    return (
      <div className="w-12 bg-white border-r border-gray-200 flex flex-col items-center py-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Expand sidebar"
        >
          <FontAwesomeIcon icon="bars" className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Collapse sidebar"
          >
            <FontAwesomeIcon icon="bars" className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Companies</h2>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon 
              icon="search" 
              className="w-4 h-4 text-gray-400" 
            />
          </div>
          <input
            type="text"
            value={searchFilters.term}
            onChange={handleSearchChange}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search company, booth or category"
            className={`w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent 
              transition-all duration-200 ${searchFocused ? 'shadow-md' : ''}`}
          />
          {searchFilters.term && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <FontAwesomeIcon 
                icon="times" 
                className="w-4 h-4 text-gray-400 hover:text-gray-600" 
              />
            </button>
          )}
        </div>
        
        {/* Search Results Count */}
        {searchFilters.term && (
          <p className="text-sm text-gray-500 mt-2">
            {filteredCompanies.length} result{filteredCompanies.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Company List */}
      <div className="flex-1 overflow-y-auto">
        {filteredCompanies.length === 0 ? (
          <div className="p-6 text-center">
            <FontAwesomeIcon 
              icon="search" 
              className="w-12 h-12 text-gray-300 mx-auto mb-3" 
            />
            <p className="text-gray-500 mb-2">No companies found</p>
            <p className="text-sm text-gray-400">
              Try adjusting your search terms
            </p>
          </div>
        ) : (
          <div className="p-2">
            {filteredCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                isSelected={selectedBoothId === company.id}
                onClick={() => handleCompanyClick(company)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface CompanyCardProps {
  company: Company;
  isSelected: boolean;
  onClick: () => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  isSelected,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 mb-2
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }`}
    >
      <div className="flex items-center gap-3">
        {/* Company Avatar/Logo */}
        <div className="flex-shrink-0">
          {company.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 
            flex items-center justify-center text-white font-semibold text-sm
            ${company.logo ? 'hidden' : ''}`}>
            {company.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Company Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900 truncate">
              {company.name}
            </h3>
            {company.featured && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs 
                font-medium bg-purple-100 text-purple-800">
                Featured
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="font-medium">{company.boothNumber}</span>
            <span>Level {company.floor}</span>
          </div>
          
          {company.category && (
            <p className="text-xs text-gray-400 mt-1">{company.category}</p>
          )}
        </div>

        {/* Arrow Icon */}
        <div className="flex-shrink-0">
          <FontAwesomeIcon 
            icon="chevron-right" 
            className={`w-4 h-4 transition-colors ${
              isSelected ? 'text-blue-500' : 'text-gray-400'
            }`} 
          />
        </div>
      </div>
    </div>
  );
};
import React, { useRef, useEffect, useState } from 'react';
import { useFloorPlanViewerStore } from '../../store/floorPlanViewerStore';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';

export const SponsorHeader: React.FC = () => {
  const { sponsors } = useFloorPlanViewerStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, [sponsors]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleSponsorClick = (sponsor: any) => {
    if (sponsor.website) {
      window.open(sponsor.website, '_blank', 'noopener,noreferrer');
    }
  };

  if (sponsors.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="relative">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 
              w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 
              flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Scroll left"
          >
            <FontAwesomeIcon icon="chevron-left" className="w-4 h-4 text-gray-600" />
          </button>
        )}

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 
              w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 
              flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Scroll right"
          >
            <FontAwesomeIcon icon="chevron-right" className="w-4 h-4 text-gray-600" />
          </button>
        )}

        {/* Sponsors Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 px-8 py-4 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {sponsors.map((sponsor) => (
            <SponsorCard
              key={sponsor.id}
              sponsor={sponsor}
              onClick={() => handleSponsorClick(sponsor)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface SponsorCardProps {
  sponsor: any;
  onClick: () => void;
}

const SponsorCard: React.FC<SponsorCardProps> = ({ sponsor, onClick }) => {
  const [imageError, setImageError] = useState(false);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return 'border-gray-300 bg-gradient-to-r from-gray-100 to-gray-200';
      case 'gold':
        return 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-yellow-100';
      case 'silver':
        return 'border-gray-400 bg-gradient-to-r from-gray-50 to-gray-100';
      case 'bronze':
        return 'border-orange-300 bg-gradient-to-r from-orange-50 to-orange-100';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`flex-shrink-0 relative group cursor-pointer transition-all duration-200 
        hover:scale-105 hover:shadow-lg rounded-lg border-2 p-3 ${getTierColor(sponsor.tier)}`}
      title={`${sponsor.name} - ${sponsor.tier} sponsor`}
    >
      {/* Tier Badge */}
      <div className="absolute -top-2 -right-2 z-10">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
          ${sponsor.tier === 'platinum' ? 'bg-gray-800 text-white' :
            sponsor.tier === 'gold' ? 'bg-yellow-500 text-white' :
            sponsor.tier === 'silver' ? 'bg-gray-500 text-white' :
            'bg-orange-500 text-white'}`}>
          {sponsor.tier.charAt(0).toUpperCase() + sponsor.tier.slice(1)}
        </span>
      </div>

      {/* Logo */}
      <div className="w-32 h-16 flex items-center justify-center">
        {!imageError ? (
          <img
            src={sponsor.logo}
            alt={sponsor.name}
            className="max-w-full max-h-full object-contain filter group-hover:brightness-110 transition-all"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
            <span className="text-gray-500 text-sm font-medium truncate px-2">
              {sponsor.name}
            </span>
          </div>
        )}
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 
        rounded-lg transition-all duration-200" />
    </div>
  );
};
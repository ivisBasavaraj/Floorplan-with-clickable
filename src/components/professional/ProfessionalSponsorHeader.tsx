import React, { useRef, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';
import { generateSVGPlaceholder, PLACEHOLDER_CONFIGS } from '../../utils/placeholderUtils';

interface SponsorLogo {
  id: string;
  name: string;
  logo: string;
  website?: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
}

interface ProfessionalSponsorHeaderProps {
  sponsors: SponsorLogo[];
}

export const ProfessionalSponsorHeader: React.FC<ProfessionalSponsorHeaderProps> = ({ sponsors }) => {
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

  const handleSponsorClick = (sponsor: SponsorLogo) => {
    if (sponsor.website) {
      window.open(sponsor.website, '_blank', 'noopener,noreferrer');
    }
  };

  const getTierGradient = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return 'from-gray-200 to-gray-400';
      case 'gold':
        return 'from-yellow-200 to-yellow-400';
      case 'silver':
        return 'from-gray-100 to-gray-300';
      case 'bronze':
        return 'from-orange-200 to-orange-400';
      default:
        return 'from-gray-100 to-gray-200';
    }
  };

  const getTierBorder = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return 'border-gray-400';
      case 'gold':
        return 'border-yellow-400';
      case 'silver':
        return 'border-gray-300';
      case 'bronze':
        return 'border-orange-400';
      default:
        return 'border-gray-200';
    }
  };

  if (!sponsors || sponsors.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-900 border-b border-gray-700 py-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-900 to-black opacity-50"></div>
      
      <div className="relative">
        {/* Left scroll button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 
              w-12 h-12 bg-gray-800 border border-gray-600 rounded-full shadow-lg 
              hover:shadow-xl transition-all duration-200 flex items-center justify-center
              hover:scale-105 hover:bg-gray-700"
            aria-label="Scroll left"
          >
            <FontAwesomeIcon icon="fas fa-chevron-left" size={16} className="text-white" />
          </button>
        )}

        {/* Right scroll button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 
              w-12 h-12 bg-gray-800 border border-gray-600 rounded-full shadow-lg 
              hover:shadow-xl transition-all duration-200 flex items-center justify-center
              hover:scale-105 hover:bg-gray-700"
            aria-label="Scroll right"
          >
            <FontAwesomeIcon icon="fas fa-chevron-right" size={16} className="text-white" />
          </button>
        )}

        {/* Sponsors container */}
        <div 
          ref={scrollContainerRef}
          className="flex space-x-4 px-16 overflow-x-auto scrollbar-hide py-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="flex-shrink-0 relative group cursor-pointer transition-all duration-300 
                hover:scale-105 hover:shadow-xl rounded-xl bg-gray-800 border border-gray-600 
                p-4 hover:bg-gray-700"
              onClick={() => handleSponsorClick(sponsor)}
              title={`${sponsor.name} - ${sponsor.tier} sponsor`}
            >
              {/* Tier Badge */}
              <div className="absolute -top-3 -right-3 z-10">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold
                  ${sponsor.tier === 'platinum' ? 'bg-gray-200 text-gray-800' :
                    sponsor.tier === 'gold' ? 'bg-yellow-400 text-gray-900' :
                    sponsor.tier === 'silver' ? 'bg-gray-300 text-gray-800' :
                    'bg-orange-400 text-white'} shadow-lg`}>
                  {sponsor.tier.charAt(0).toUpperCase() + sponsor.tier.slice(1)}
                </span>
              </div>

              {/* Logo */}
              <div className="w-36 h-16 flex items-center justify-center bg-white rounded-lg p-3 
                shadow-inner border border-gray-200">
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 
                    group-hover:brightness-110 transition-all duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // Prevent infinite error loops
                    if (target.src.startsWith('data:image/svg+xml')) {
                      return;
                    }
                    target.src = generateSVGPlaceholder({
                      ...PLACEHOLDER_CONFIGS.sponsor,
                      text: sponsor.name
                    });
                  }}
                />
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-transparent 
                opacity-0 group-hover:opacity-10 rounded-xl transition-all duration-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
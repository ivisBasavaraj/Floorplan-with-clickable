import React, { useRef, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';
import { SafeImage } from '../common/SafeImage';

interface SponsorLogo {
  id: string;
  name: string;
  logo: string;
  website?: string;
}

interface UserSponsorHeaderProps {
  sponsors: SponsorLogo[];
}

export const UserSponsorHeader: React.FC<UserSponsorHeaderProps> = ({ sponsors }) => {
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

  if (!sponsors || sponsors.length === 0) {
    return null;
  }

  return (
    <div className="sponsor-carousel-container">
      <div className="sponsor-carousel-strip">
        <div className="relative">
          {/* Left scroll button */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 sponsor-scroll-btn sponsor-scroll-btn-left"
              aria-label="Scroll left"
            >
              <FontAwesomeIcon icon="fas fa-chevron-left" size={14} className="text-gray-600" />
            </button>
          )}

          {/* Right scroll button */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 sponsor-scroll-btn sponsor-scroll-btn-right"
              aria-label="Scroll right"
            >
              <FontAwesomeIcon icon="fas fa-chevron-right" size={14} className="text-gray-600" />
            </button>
          )}

          {/* Sponsors container */}
          <div 
            ref={scrollContainerRef}
            className="sponsor-logos-container"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {sponsors.map((sponsor, index) => (
              <div
                key={sponsor.id}
                className="sponsor-logo-card"
                onClick={() => sponsor.website && window.open(sponsor.website, '_blank')}
                title={`Visit ${sponsor.name}`}
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  '--index': index 
                } as React.CSSProperties}
              >
                <div className="sponsor-logo-wrapper">
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="sponsor-logo-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // Fallback to a simple inline SVG with the sponsor name
                      const svg = `<svg width="140" height="50" xmlns="http://www.w3.org/2000/svg"><rect width="140" height="50" fill="#667eea" rx="8"/><text x="70" y="30" font-family="Arial,sans-serif" font-size="14" font-weight="600" fill="#ffffff" text-anchor="middle">${sponsor.name}</text></svg>`;
                      target.src = `data:image/svg+xml;base64,${btoa(svg)}`;
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
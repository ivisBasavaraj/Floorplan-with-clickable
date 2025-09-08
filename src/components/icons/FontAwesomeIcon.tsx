import React from 'react';

interface FontAwesomeIconProps {
  icon: string;
  className?: string;
  size?: number;
}

export const FontAwesomeIcon: React.FC<FontAwesomeIconProps> = ({ 
  icon, 
  className = '', 
  size = 16 
}) => {
  return (
    <i 
      className={`${icon} ${className}`} 
      style={{ fontSize: `${size}px` }}
    />
  );
};
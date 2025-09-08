/**
 * SafeImage component with automatic error handling and fallback generation
 */

import React from 'react';
import { SafeImageProps, getImageErrorHandler, preprocessImageURL } from '../../utils/imageErrorHandler';

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  fallbackText,
  fallbackType = 'company',
  preprocessUrl = true,
  onError,
  ...props
}) => {
  // Preprocess the URL to replace known problematic services
  const processedSrc = preprocessUrl && src ? preprocessImageURL(src) : src;
  
  // Debug logging
  console.log('SafeImage rendering:', { 
    originalSrc: src, 
    processedSrc: processedSrc?.substring(0, 100) + '...', 
    fallbackText, 
    fallbackType 
  });
  
  // Get the appropriate error handler
  const errorHandler = getImageErrorHandler(fallbackType, fallbackText);
  
  // Combine custom onError with our error handler
  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log('SafeImage error occurred for:', fallbackText);
    
    // Call custom error handler first if provided
    if (onError) {
      onError(event);
    }
    
    // Then apply our fallback
    errorHandler(event);
  };
  
  return (
    <img
      {...props}
      src={processedSrc}
      onError={handleError}
      onLoad={() => console.log('SafeImage loaded successfully:', fallbackText)}
    />
  );
};

export default SafeImage;
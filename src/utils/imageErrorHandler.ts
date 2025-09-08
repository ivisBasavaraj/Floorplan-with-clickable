/**
 * Global image error handler utility
 * Provides consistent fallback behavior for failed image loads
 */

import { generateSVGPlaceholder, PLACEHOLDER_CONFIGS, replacePlaceholderURL } from './placeholderUtils';

export interface ImageErrorHandlerOptions {
  fallbackText?: string;
  backgroundColor?: string;
  textColor?: string;
  width?: number;
  height?: number;
  preventLoop?: boolean;
}

/**
 * Handle image loading errors with consistent fallback behavior
 */
export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  options: ImageErrorHandlerOptions = {}
) => {
  const target = event.currentTarget;
  
  // Prevent infinite error loops
  if (options.preventLoop !== false && target.src.startsWith('data:image/svg+xml')) {
    console.warn('Image error handler: Preventing infinite loop for', target.src);
    return;
  }
  
  const {
    fallbackText = 'Image',
    backgroundColor = '#667eea',
    textColor = '#ffffff',
    width = 120,
    height = 40
  } = options;
  
  // Generate a fallback SVG
  const fallbackSrc = generateSVGPlaceholder({
    width,
    height,
    backgroundColor,
    textColor,
    text: fallbackText,
    fontSize: Math.min(width / 8, height / 2, 14)
  });
  
  console.log(`Image failed to load: ${target.src}, using fallback`);
  target.src = fallbackSrc;
};

/**
 * Create an image error handler with predefined options
 */
export const createImageErrorHandler = (options: ImageErrorHandlerOptions) => {
  return (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    handleImageError(event, options);
  };
};

/**
 * Predefined error handlers for common use cases
 */
export const imageErrorHandlers = {
  sponsor: createImageErrorHandler({
    ...PLACEHOLDER_CONFIGS.sponsor,
    fallbackText: 'Sponsor'
  }),
  
  company: createImageErrorHandler({
    ...PLACEHOLDER_CONFIGS.company,
    fallbackText: 'Co'
  }),
  
  booth: createImageErrorHandler({
    ...PLACEHOLDER_CONFIGS.booth,
    fallbackText: 'B'
  }),
  
  avatar: createImageErrorHandler({
    width: 40,
    height: 40,
    backgroundColor: '#4a5568',
    textColor: '#ffffff',
    fallbackText: 'U'
  })
};

/**
 * Preprocess image URLs to replace known problematic services
 */
export const preprocessImageURL = (url: string): string => {
  if (!url) return '';
  
  // Replace via.placeholder.com URLs with local equivalents
  if (url.includes('via.placeholder.com')) {
    return replacePlaceholderURL(url);
  }
  
  return url;
};

/**
 * Enhanced image component props with automatic error handling
 */
export interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
  fallbackType?: 'sponsor' | 'company' | 'booth' | 'avatar';
  preprocessUrl?: boolean;
}

/**
 * Get the appropriate error handler for an image type
 */
export const getImageErrorHandler = (
  type: SafeImageProps['fallbackType'] = 'company',
  fallbackText?: string
) => {
  const baseHandler = imageErrorHandlers[type];
  
  if (fallbackText) {
    return createImageErrorHandler({
      ...PLACEHOLDER_CONFIGS[type] || PLACEHOLDER_CONFIGS.company,
      fallbackText
    });
  }
  
  return baseHandler;
};
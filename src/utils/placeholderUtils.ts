/**
 * Utility functions for generating placeholder images without external dependencies
 */

export interface PlaceholderOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  textColor?: string;
  text?: string;
  fontSize?: number;
}

/**
 * Generate a data URL for an SVG placeholder image
 */
export const generateSVGPlaceholder = (options: PlaceholderOptions): string => {
  const {
    width = 120,
    height = 40,
    backgroundColor = '#667eea',
    textColor = '#ffffff',
    text = 'Logo',
    fontSize = 12
  } = options;

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${backgroundColor}" rx="4"/>
      <text x="${width / 2}" y="${height / 2 + fontSize / 3}" 
            font-family="Arial, sans-serif" 
            font-size="${fontSize}" 
            fill="${textColor}" 
            text-anchor="middle"
            dominant-baseline="middle">${text}</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Generate a placeholder URL that mimics the via.placeholder.com format
 * but uses local SVG generation instead
 */
export const createPlaceholderURL = (
  dimensions: string, // e.g., "120x40"
  backgroundColor: string = '667eea',
  textColor: string = 'ffffff',
  text?: string
): string => {
  const [widthStr, heightStr] = dimensions.split('x');
  const width = parseInt(widthStr, 10);
  const height = parseInt(heightStr, 10);
  
  // Remove # from color codes if present
  const bgColor = backgroundColor.startsWith('#') ? backgroundColor : `#${backgroundColor}`;
  const txtColor = textColor.startsWith('#') ? textColor : `#${textColor}`;
  
  return generateSVGPlaceholder({
    width,
    height,
    backgroundColor: bgColor,
    textColor: txtColor,
    text: text || 'Logo',
    fontSize: Math.min(width / 8, height / 2, 14)
  });
};

/**
 * Replace via.placeholder.com URLs with local SVG equivalents
 */
export const replacePlaceholderURL = (url: string): string => {
  if (!url.includes('via.placeholder.com')) {
    return url;
  }

  try {
    // Parse via.placeholder.com URL format
    // Example: https://via.placeholder.com/120x40/667eea/ffffff?text=Logo
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const dimensions = pathParts[1]; // "120x40"
    const backgroundColor = pathParts[2] || '667eea';
    const textColor = pathParts[3] || 'ffffff';
    const text = urlObj.searchParams.get('text') || 'Logo';

    return createPlaceholderURL(dimensions, backgroundColor, textColor, text);
  } catch (error) {
    console.warn('Failed to parse placeholder URL:', url, error);
    // Fallback to a simple placeholder
    return generateSVGPlaceholder({ text: 'Logo' });
  }
};

/**
 * Common placeholder configurations
 */
export const PLACEHOLDER_CONFIGS = {
  sponsor: {
    width: 120,
    height: 40,
    backgroundColor: '#667eea',
    textColor: '#ffffff',
    fontSize: 12
  },
  company: {
    width: 40,
    height: 40,
    backgroundColor: '#4a5568',
    textColor: '#ffffff',
    fontSize: 14
  },
  booth: {
    width: 48,
    height: 48,
    backgroundColor: '#48bb78',
    textColor: '#ffffff',
    fontSize: 16
  }
};
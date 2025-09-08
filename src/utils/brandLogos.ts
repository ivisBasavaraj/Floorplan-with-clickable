/**
 * Brand logo SVGs for major companies
 * These are simplified, recognizable versions that avoid trademark issues
 */

export const BRAND_LOGOS = {
  // Technology Companies
  microsoft: `data:image/svg+xml;base64,${btoa(`
    <svg width="140" height="50" xmlns="http://www.w3.org/2000/svg">
      <rect width="140" height="50" fill="white" rx="8"/>
      <g transform="translate(12, 12)">
        <!-- Microsoft squares logo -->
        <rect x="0" y="0" width="11" height="11" fill="#f25022"/>
        <rect x="13" y="0" width="11" height="11" fill="#7fba00"/>
        <rect x="0" y="13" width="11" height="11" fill="#00a4ef"/>
        <rect x="13" y="13" width="11" height="11" fill="#ffb900"/>
      </g>
      <text x="42" y="30" font-family="Segoe UI, Arial, sans-serif" font-size="14" fill="#0078d4" font-weight="600">Microsoft</text>
    </svg>
  `)}`,

  google: `data:image/svg+xml;base64,${btoa(`
    <svg width="140" height="50" xmlns="http://www.w3.org/2000/svg">
      <rect width="140" height="50" fill="white" rx="8" stroke="#e0e0e0"/>
      <g transform="translate(12, 15)">
        <!-- Google G logo -->
        <circle cx="10" cy="10" r="9" fill="#4285f4"/>
        <circle cx="10" cy="10" r="6" fill="white"/>
        <path d="M10 7v6h6v-2h-4v-4z" fill="#4285f4"/>
      </g>
      <text x="42" y="30" font-family="Product Sans, Arial, sans-serif" font-size="14" fill="#5f6368" font-weight="500">Google</text>
    </svg>
  `)}`,

  apple: `data:image/svg+xml;base64,${btoa(`
    <svg width="140" height="50" xmlns="http://www.w3.org/2000/svg">
      <rect width="140" height="50" fill="white" rx="8"/>
      <g transform="translate(12, 10)">
        <!-- Apple logo -->
        <path d="M15 5c-1.5 0-3 1.2-3 3 0 2.5-2 4.5-4.5 4.5S3 10.5 3 8c0-1.8 1.5-3 3-3s3 1.2 3 3c0 2.5 2 4.5 4.5 4.5S18 10.5 18 8c0-1.8-1.5-3-3-3z" fill="#000"/>
        <circle cx="12" cy="3" r="2" fill="#000"/>
      </g>
      <text x="42" y="30" font-family="SF Pro Display, Arial, sans-serif" font-size="14" fill="#000" font-weight="500">Apple</text>
    </svg>
  `)}`,

  // Flooring & Construction Companies
  mohawk: `data:image/svg+xml;base64,${btoa(`
    <svg width="140" height="50" xmlns="http://www.w3.org/2000/svg">
      <rect width="140" height="50" fill="white" rx="8"/>
      <g transform="translate(12, 12)">
        <!-- Mohawk M logo -->
        <path d="M0 0v26h4V10l6 16h4l6-16v16h4V0h-6l-6 16L6 0H0z" fill="#8B4513"/>
      </g>
      <text x="42" y="30" font-family="Arial, sans-serif" font-size="14" fill="#8B4513" font-weight="700">MOHAWK</text>
    </svg>
  `)}`,

  shaw: `data:image/svg+xml;base64,${btoa(`
    <svg width="140" height="50" xmlns="http://www.w3.org/2000/svg">
      <rect width="140" height="50" fill="white" rx="8"/>
      <g transform="translate(12, 15)">
        <!-- Shaw S logo -->
        <path d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10h10V15H10c-2.8 0-5-2.2-5-5s2.2-5 5-5h10V0H10z" fill="#2E8B57"/>
      </g>
      <text x="42" y="30" font-family="Arial, sans-serif" font-size="14" fill="#2E8B57" font-weight="700">SHAW</text>
    </svg>
  `)}`,

  armstrong: `data:image/svg+xml;base64,${btoa(`
    <svg width="140" height="50" xmlns="http://www.w3.org/2000/svg">
      <rect width="140" height="50" fill="white" rx="8"/>
      <g transform="translate(12, 12)">
        <!-- Armstrong A logo -->
        <path d="M13 0L0 26h5l2-5h12l2 5h5L13 0zm0 8l3 8H10l3-8z" fill="#B8860B"/>
      </g>
      <text x="42" y="30" font-family="Arial, sans-serif" font-size="12" fill="#B8860B" font-weight="700">ARMSTRONG</text>
    </svg>
  `)}`,

  mannington: `data:image/svg+xml;base64,${btoa(`
    <svg width="140" height="50" xmlns="http://www.w3.org/2000/svg">
      <rect width="140" height="50" fill="white" rx="8"/>
      <g transform="translate(12, 12)">
        <!-- Mannington M logo -->
        <rect x="0" y="0" width="4" height="26" fill="#4682B4"/>
        <rect x="8" y="0" width="4" height="26" fill="#4682B4"/>
        <rect x="16" y="0" width="4" height="26" fill="#4682B4"/>
        <path d="M0 0l10 13L20 0" stroke="#4682B4" stroke-width="2" fill="none"/>
      </g>
      <text x="42" y="30" font-family="Arial, sans-serif" font-size="11" fill="#4682B4" font-weight="700">MANNINGTON</text>
    </svg>
  `)}`,

  // Design & Architecture
  greenleaf: `data:image/svg+xml;base64,${btoa(`
    <svg width="140" height="50" xmlns="http://www.w3.org/2000/svg">
      <rect width="140" height="50" fill="#000000" rx="8"/>
      <g transform="translate(12, 15)">
        <!-- Leaf logo -->
        <path d="M10 0C15 5 20 10 15 20C10 15 5 10 10 0z" fill="#32CD32"/>
        <path d="M10 0C5 5 0 10 5 20C10 15 15 10 10 0z" fill="#228B22"/>
      </g>
      <text x="42" y="30" font-family="Arial, sans-serif" font-size="11" fill="white" font-weight="600">GreenLeaf Interiors</text>
    </svg>
  `)}`,

  designstudio: `data:image/svg+xml;base64,${btoa(`
    <svg width="140" height="50" xmlns="http://www.w3.org/2000/svg">
      <rect width="140" height="50" fill="white" rx="8"/>
      <g transform="translate(12, 12)">
        <!-- Design compass -->
        <circle cx="13" cy="13" r="12" stroke="#FF6B6B" stroke-width="2" fill="none"/>
        <path d="M13 1v24M1 13h24" stroke="#FF6B6B" stroke-width="1"/>
        <circle cx="13" cy="13" r="3" fill="#FF6B6B"/>
      </g>
      <text x="42" y="30" font-family="Arial, sans-serif" font-size="12" fill="#FF6B6B" font-weight="600">Design Studio</text>
    </svg>
  `)}`,

  // Construction & Building
  buildtech: `data:image/svg+xml;base64,${btoa(`
    <svg width="140" height="50" xmlns="http://www.w3.org/2000/svg">
      <rect width="140" height="50" fill="white" rx="8"/>
      <g transform="translate(12, 12)">
        <!-- Building blocks -->
        <rect x="0" y="16" width="8" height="10" fill="#FF8C00"/>
        <rect x="9" y="8" width="8" height="18" fill="#FF8C00"/>
        <rect x="18" y="0" width="8" height="26" fill="#FF8C00"/>
      </g>
      <text x="42" y="30" font-family="Arial, sans-serif" font-size="13" fill="#FF8C00" font-weight="700">BuildTech</text>
    </svg>
  `)}`,

  floormaster: `data:image/svg+xml;base64,${btoa(`
    <svg width="140" height="50" xmlns="http://www.w3.org/2000/svg">
      <rect width="140" height="50" fill="white" rx="8"/>
      <g transform="translate(12, 15)">
        <!-- Floor pattern -->
        <rect x="0" y="0" width="6" height="20" fill="#8B4513" stroke="white" stroke-width="1"/>
        <rect x="7" y="0" width="6" height="20" fill="#A0522D" stroke="white" stroke-width="1"/>
        <rect x="14" y="0" width="6" height="20" fill="#8B4513" stroke="white" stroke-width="1"/>
        <rect x="21" y="0" width="5" height="20" fill="#A0522D" stroke="white" stroke-width="1"/>
      </g>
      <text x="42" y="30" font-family="Arial, sans-serif" font-size="12" fill="#8B4513" font-weight="700">FloorMaster</text>
    </svg>
  `)}`,
};

/**
 * Get a brand logo by name
 */
export const getBrandLogo = (brandName: string): string => {
  const normalizedName = brandName.toLowerCase().replace(/\s+/g, '');
  return BRAND_LOGOS[normalizedName as keyof typeof BRAND_LOGOS] || createGenericBrandLogo(brandName);
};

/**
 * Create a generic brand logo for unknown brands
 */
export const createGenericBrandLogo = (brandName: string, backgroundColor: string = '#667eea'): string => {
  const initials = brandName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 3);

  return `data:image/svg+xml;base64,${btoa(`
    <svg width="120" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="40" fill="${backgroundColor}" rx="4"/>
      <circle cx="20" cy="20" r="12" fill="rgba(255,255,255,0.2)"/>
      <text x="20" y="25" font-family="Arial, sans-serif" font-size="10" fill="white" text-anchor="middle" font-weight="600">${initials}</text>
      <text x="40" y="24" font-family="Arial, sans-serif" font-size="11" fill="white" font-weight="500">${brandName}</text>
    </svg>
  `)}`;
};
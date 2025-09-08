// Define TypeScript interfaces for the icon paths and colors
interface IconPathsType {
  [key: string]: string;
  booth: string;
  furniture: string;
  door: string;
  plant: string;
  wall: string;
  line: string;
  text: string;
  meeting: string;
  restroom: string;
  emergency: string;
  medical: string;
  childcare: string;
  accessible: string;
  restaurant: string;
  cafeteria: string;
  info: string;
  atm: string;
  elevator: string;
  transportation: string;
  "no-smoking": string;
  baggage: string;
  // Additional common element types
  shape: string;
  circle: string;
  "family-services": string;
  "info-point": string;
  "lost-found": string;
  "senior-assistance": string;
  "first-aid": string;
  "mens-restroom": string;
  "womens-restroom": string;
  "nursing-room": string;
  "wheelchair-accessible": string;
  "emergency-exit": string;
  "meeting-room": string;
}

interface IconColorsType {
  [key: string]: string;
  booth: string;
  furniture: string;
  door: string;
  plant: string;
  wall: string;
  line: string;
  text: string;
  shape: string;
  meeting: string;
  restroom: string;
  emergency: string;
  medical: string;
  childcare: string;
  accessible: string;
  restaurant: string;
  cafeteria: string;
  info: string;
  atm: string;
  elevator: string;
  transportation: string;
  "no-smoking": string;
  baggage: string;
  // Additional color mappings
  circle: string;
  "family-services": string;
  "info-point": string;
  "lost-found": string;
  "senior-assistance": string;
  "first-aid": string;
  "mens-restroom": string;
  "womens-restroom": string;
  "nursing-room": string;
  "wheelchair-accessible": string;
  "emergency-exit": string;
  "meeting-room": string;
}

// Enhanced SVG path data for various element icons - designed for better visibility and scaling
export const IconPaths: IconPathsType = {
  // Booth icon - exhibition booth with display panels
  booth: "M6,8 L6,32 L10,32 L10,28 L30,28 L30,32 L34,32 L34,8 L30,8 L30,12 L10,12 L10,8 Z M12,14 L28,14 L28,26 L12,26 Z M18,18 L22,18 M18,20 L22,20 M18,22 L22,22",
  
  // Furniture icon - modern chair/sofa with cushions
  furniture: "M8,18 L8,30 L32,30 L32,18 L28,18 L28,14 L12,14 L12,18 Z M10,20 L14,20 M18,20 L22,20 M26,20 L30,20 M14,24 L26,24",
  
  // Door icon - door with handle and frame
  door: "M8,6 L32,6 L32,34 L8,34 Z M12,10 L28,10 L28,30 L12,30 Z M24,18 C26,18 26,22 24,22 C22,22 22,18 24,18",
  
  // Plant icon - potted plant with leaves
  plant: "M20,8 Q16,12 12,16 Q16,12 20,8 Q24,12 28,16 Q24,12 20,8 M20,16 L20,28 M16,28 L24,28 L24,32 L16,32 Z M18,20 Q20,18 22,20",
  
  // Wall icon - brick pattern wall
  wall: "M6,6 L34,6 L34,34 L6,34 Z M6,14 L34,14 M6,22 L34,22 M6,30 L34,30 M14,6 L14,14 M22,14 L22,22 M30,22 L30,30",
  
  // Line icon - construction line with endpoints
  line: "M6,6 L34,34 M4,4 L8,8 M32,32 L36,36",
  
  // Text icon - document with text lines
  text: "M10,8 L30,8 L30,32 L10,32 Z M14,14 L26,14 M14,18 L26,18 M14,22 L22,22 M14,26 L24,26",
  
  // Meeting/Conference icon - conference table with chairs
  meeting: "M8,18 L32,18 L32,22 L8,22 Z M12,14 C12,12 14,12 14,14 L14,18 M18,14 C18,12 20,12 20,14 L20,18 M22,14 C22,12 24,12 24,14 L24,18 M26,14 C26,12 28,12 28,14 L28,18 M10,22 L10,26 M14,22 L14,26 M18,22 L18,26 M22,22 L22,26 M26,22 L26,26 M30,22 L30,26",
  
  // Restroom icon - male and female figures side by side
  restroom: "M14,8 C14,6 16,6 16,8 C16,10 14,10 14,8 M15,10 L15,20 L13,20 L13,26 M15,20 L17,20 L17,26 M24,8 C24,6 26,6 26,8 C26,10 24,10 24,8 M25,10 L25,16 Q23,18 23,22 L23,26 M25,16 Q27,18 27,22 L27,26 M23,18 L27,18",
  
  // Emergency exit icon - running person with arrow
  emergency: "M16,8 C16,6 18,6 18,8 C18,10 16,10 16,8 M17,10 L17,18 L19,18 L21,22 M17,14 L21,16 M25,12 L31,18 L25,24 M25,18 L31,18",
  
  // Medical/First Aid icon - medical cross in circle
  medical: "M20,6 C27,6 33,12 33,20 C33,28 27,34 20,34 C13,34 7,28 7,20 C7,12 13,6 20,6 M17,13 L23,13 L23,17 L27,17 L27,23 L23,23 L23,27 L17,27 L17,23 L13,23 L13,17 L17,17 Z",
  
  // Childcare icon - adult and child figures
  childcare: "M12,8 C12,6 14,6 14,8 C14,10 12,10 12,8 M13,10 L13,18 L11,18 L11,24 M13,18 L15,18 L15,24 M22,12 C22,10 24,10 24,12 C24,14 22,14 22,12 M23,14 L23,20 L21,20 L21,24 M23,20 L25,20 L25,24",
  
  // Accessible icon - detailed wheelchair symbol
  accessible: "M18,8 C18,6 20,6 20,8 C20,10 18,10 18,8 M19,10 L19,16 L14,16 L14,18 L24,18 L24,20 C26,20 28,22 28,24 C28,26 26,28 24,28 C22,28 20,26 20,24 C20,22 22,20 24,20 M14,18 L16,26 M19,16 L22,14",
  
  // Restaurant icon - plate with fork and knife
  restaurant: "M20,8 C25,8 29,12 29,17 C29,22 25,26 20,26 C15,26 11,22 11,17 C11,12 15,8 20,8 M16,30 L16,34 M14,32 L18,32 M24,30 L24,34 M22,32 L26,32 M24,30 C24,28 24,26 22,26",
  cafeteria: "M20,8 C25,8 29,12 29,17 C29,22 25,26 20,26 C15,26 11,22 11,17 C11,12 15,8 20,8 M8,30 L32,30 L32,34 L8,34 Z M12,32 L28,32",
  
  // Information icon - "i" in circle
  info: "M20,6 C27,6 33,12 33,20 C33,28 27,34 20,34 C13,34 7,28 7,20 C7,12 13,6 20,6 M18,12 L22,12 L22,14 L20,14 L20,24 L22,24 L22,28 L18,28 L18,24 L20,24 L20,14 L18,14 Z",
  
  // ATM icon - ATM machine with card slot and screen
  atm: "M8,8 L32,8 L32,32 L8,32 Z M12,12 L28,12 L28,20 L12,20 Z M10,24 L30,24 L30,26 L10,26 Z M14,28 L26,28 M20,16 C22,16 22,16 22,16",
  
  // Elevator icon - elevator shaft with up/down arrows
  elevator: "M10,6 L30,6 L30,34 L10,34 Z M14,10 L26,10 L26,30 L14,30 Z M20,14 L17,18 L23,18 Z M20,26 L17,22 L23,22 Z M16,20 L24,20",
  
  // Transportation icon - modern car with wheels
  transportation: "M8,18 Q8,14 12,14 L28,14 Q32,14 32,18 L32,24 L28,24 Q28,28 24,28 Q20,28 20,24 Q20,28 16,28 Q12,28 12,24 L8,24 Z M14,20 C16,20 16,22 14,22 C12,22 12,20 14,22 M26,20 C28,20 28,22 26,22 C24,22 24,20 26,20",
  
  // No Smoking icon - cigarette with prohibition symbol
  "no-smoking": "M20,6 C27,6 33,12 33,20 C33,28 27,34 20,34 C13,34 7,28 7,20 C7,12 13,6 20,6 M12,12 L28,28 M16,18 L24,18 L24,20 L22,20 L22,22 L16,22 Z",
  
  // Baggage icon - detailed suitcase with handle
  baggage: "M10,16 L30,16 L30,30 L10,30 Z M15,16 L15,12 L25,12 L25,16 M18,12 L22,12 M20,8 L20,12 M12,20 L28,20 M14,24 L26,24 M20,32 L20,34",
  
  // Additional specialized icons
  shape: "M8,8 L32,8 L32,32 L8,32 Z M12,12 L28,12 L28,28 L12,28 Z", // Generic shape
  circle: "M20,6 C28,6 34,12 34,20 C34,28 28,34 20,34 C12,34 6,28 6,20 C6,12 12,6 20,6", // Circle shape
  "family-services": "M12,8 C12,6 14,6 14,8 C14,10 12,10 12,8 M13,10 L13,18 L11,18 L11,24 M13,18 L15,18 L15,24 M22,10 C22,8 24,8 24,10 C24,12 22,12 22,10 M23,12 L23,20 L21,20 L21,26 M23,20 L25,20 L25,26 M28,14 C28,12 30,12 30,14 C30,16 28,16 28,14 M29,16 L29,22 L27,22 L27,26 M29,22 L31,22 L31,26", // Family group
  "info-point": "M20,6 C27,6 33,12 33,20 C33,28 27,34 20,34 C13,34 7,28 7,20 C7,12 13,6 20,6 M18,12 L22,12 L22,14 L20,14 L20,24 L22,24 L22,28 L18,28 L18,24 L20,24 L20,14 L18,14 Z M16,30 L24,30", // Info with base
  "lost-found": "M12,10 L28,10 L28,26 L12,26 Z M16,14 L24,14 M16,18 L24,18 M16,22 L20,22 M20,6 C22,6 22,8 20,8 C18,8 18,6 20,6 M20,30 L20,34", // Box with question
  "senior-assistance": "M16,8 C16,6 18,6 18,8 C18,10 16,10 16,8 M17,10 L17,18 L15,18 L15,24 M17,18 L19,18 L19,24 M24,8 C24,6 26,6 26,8 C26,10 24,10 24,8 M25,10 L25,18 L23,18 L23,24 M25,18 L27,18 L27,24 M12,24 L30,24", // Two people with support line
  "first-aid": "M20,6 C27,6 33,12 33,20 C33,28 27,34 20,34 C13,34 7,28 7,20 C7,12 13,6 20,6 M17,13 L23,13 L23,17 L27,17 L27,23 L23,23 L23,27 L17,27 L17,23 L13,23 L13,17 L17,17 Z M20,4 L20,8 M20,32 L20,36", // Enhanced medical cross
  "mens-restroom": "M20,8 C20,6 22,6 22,8 C22,10 20,10 20,8 M21,10 L21,18 L19,18 L19,26 M21,18 L23,18 L23,26 M16,14 L26,14", // Male figure with indicator
  "womens-restroom": "M20,8 C20,6 22,6 22,8 C22,10 20,10 20,8 M21,10 L21,16 Q19,18 19,22 L19,26 M21,16 Q23,18 23,22 L23,26 M19,18 L23,18 M14,14 L28,14", // Female figure with indicator
  "nursing-room": "M16,8 C16,6 18,6 18,8 C18,10 16,10 16,8 M17,10 L17,18 L15,18 L15,24 M17,18 L19,18 L19,24 M24,12 C24,10 26,10 26,12 C26,14 24,14 24,12 M25,14 L25,20 L23,20 L23,24 M25,20 L27,20 L27,24 M20,24 L30,24 L30,28 L20,28 Z", // Parent with child and support
  "wheelchair-accessible": "M18,8 C18,6 20,6 20,8 C20,10 18,10 18,8 M19,10 L19,16 L14,16 L14,18 L24,18 L24,20 C26,20 28,22 28,24 C28,26 26,28 24,28 C22,28 20,26 20,24 C20,22 22,20 24,20 M14,18 L16,26 M19,16 L22,14 M12,26 C14,26 14,28 12,28 C10,28 10,26 12,26 M16,26 C18,26 18,28 16,28 C14,28 14,26 16,26", // Enhanced wheelchair symbol
  "emergency-exit": "M16,8 C16,6 18,6 18,8 C18,10 16,10 16,8 M17,10 L17,18 L19,18 L21,22 M17,14 L21,16 M25,12 L31,18 L25,24 M25,18 L31,18 M8,30 L32,30 M8,6 L32,6", // Running figure with arrow and exit lines
  "meeting-room": "M8,18 L32,18 L32,22 L8,22 Z M12,14 C12,12 14,12 14,14 L14,18 M18,14 C18,12 20,12 20,14 L20,18 M22,14 C22,12 24,12 24,14 L24,18 M26,14 C26,12 28,12 28,14 L28,18 M10,22 L10,26 M14,22 L14,26 M18,22 L18,26 M22,22 L22,26 M26,22 L26,26 M30,22 L30,26 M6,26 L34,26"  // Conference table with many chairs
};

// Enhanced icon colors for different element types - more vibrant and distinguishable
export const IconColors: IconColorsType = {
  booth: "#1E88E5",          // Bright Blue - Primary exhibition color
  furniture: "#6D4C41",      // Rich Brown - Furniture wood tone
  door: "#D32F2F",           // Bold Red - Clear door indication
  plant: "#388E3C",          // Forest Green - Natural plant color
  wall: "#5D4037",           // Dark Brown - Structural element
  line: "#424242",           // Charcoal - Neutral but visible
  text: "#1A237E",           // Deep Blue - Professional text
  shape: "#F57C00",          // Vibrant Orange - Attention-grabbing
  meeting: "#3F51B5",        // Professional Indigo - Business setting
  restroom: "#7B1FA2",       // Purple - Universal restroom color
  emergency: "#E53935",      // Emergency Red - High visibility
  medical: "#C62828",        // Medical Red - Health services
  childcare: "#FFB74D",      // Warm Orange - Child-friendly
  accessible: "#00ACC1",     // Accessibility Blue - Standard accessible color
  restaurant: "#FF7043",     // Restaurant Orange - Food service
  cafeteria: "#FFA726",      // Amber - Casual dining
  info: "#2196F3",           // Information Blue - Help/guidance
  atm: "#43A047",            // Money Green - Financial services
  elevator: "#8E24AA",       // Elevator Purple - Transportation
  transportation: "#546E7A", // Steel Blue - Vehicles/transport
  "no-smoking": "#757575",   // Prohibition Gray - Restricted area
  baggage: "#8D6E63",        // Luggage Brown - Travel services
  
  // Additional specialized colors
  circle: "#9C27B0",              // Purple - Shape element
  "family-services": "#FF8A65",   // Coral - Family warmth
  "info-point": "#03A9F4",        // Light Blue - Information
  "lost-found": "#FF7043",        // Orange - Attention for lost items
  "senior-assistance": "#AB47BC", // Light Purple - Senior care
  "first-aid": "#F44336",         // Red - Medical emergency
  "mens-restroom": "#1976D2",     // Blue - Male
  "womens-restroom": "#E91E63",   // Pink - Female
  "nursing-room": "#FFC107",      // Yellow - Caring/nurturing
  "wheelchair-accessible": "#00BCD4", // Cyan - Accessibility standard
  "emergency-exit": "#F44336",    // Red - Emergency
  "meeting-room": "#3F51B5"       // Indigo - Professional meeting
};
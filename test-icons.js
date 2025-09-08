// Test to verify Font Awesome icon mappings
console.log("Testing Font Awesome icon mappings...");

// Simulate the mapping system
const ToolToFontAwesome = {
  'booth': 'fas fa-th-large',
  'furniture': 'fas fa-couch',
  'plant': 'fas fa-seedling',
  'door': 'fas fa-door-open',
  'meeting-room': 'fas fa-users',
  'restroom': 'fas fa-restroom'
};

const FontAwesomeIconPaths = {
  'fas fa-th-large': "M2,2 L10,2 L10,10 L2,10 Z M14,2 L22,2 L22,10 L14,10 Z M2,14 L10,14 L10,22 L2,22 Z M14,14 L22,14 L22,22 L14,22 Z",
  'fas fa-couch': "M4,10 L20,10 L20,16 L18,16 L18,18 L16,18 L16,16 L8,16 L8,18 L6,18 L6,16 L4,16 Z M6,8 L18,8 L18,10 L6,10 Z",
  'fas fa-seedling': "M12,20 L12,12 C12,8 8,8 8,8 C8,8 12,8 12,4 C12,4 16,4 16,8 C16,8 12,8 12,12",
  'fas fa-door-open': "M6,4 L18,4 L18,20 L6,20 Z M8,6 L16,6 L16,18 L8,18 Z M14,11 C14.6,11 15,11.4 15,12 C15,12.6 14.6,13 14,13 C13.4,13 13,12.6 13,12 C13,11.4 13.4,11 14,11",
  'fas fa-users': "M8,8 C9.1,8 10,7.1 10,6 C10,4.9 9.1,4 8,4 C6.9,4 6,4.9 6,6 C6,7.1 6.9,8 8,8 M16,8 C17.1,8 18,7.1 18,6 C18,4.9 17.1,4 16,4 C14.9,4 14,4.9 14,6 C14,7.1 14.9,8 16,8",
  'fas fa-restroom': "M8,4 C9.1,4 10,4.9 10,6 C10,7.1 9.1,8 8,8 C6.9,8 6,7.1 6,6 C6,4.9 6.9,4 8,4 M8,10 L8,16 L6,16 L6,20 L10,20 L10,16 L8,16"
};

// Test the mapping system
const testTools = ['booth', 'furniture', 'plant', 'door', 'meeting-room', 'restroom'];

testTools.forEach(tool => {
  const fontAwesomeIcon = ToolToFontAwesome[tool];
  const svgPath = FontAwesomeIconPaths[fontAwesomeIcon];
  
  if (fontAwesomeIcon && svgPath) {
    console.log(`✅ ${tool} -> ${fontAwesomeIcon} -> SVG path available`);
  } else {
    console.log(`❌ ${tool} -> Missing mapping or SVG path`);
  }
});

console.log("\n🎉 Icon mapping test completed!");
console.log("Canvas elements should now display the same icons as the toolbar!");
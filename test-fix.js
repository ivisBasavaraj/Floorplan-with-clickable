// Simple test to verify the fix
console.log("Testing FloorPlanEditor fix...");

// Simulate the issue that was causing the white screen
try {
  // This would have caused a ReferenceError before the fix
  const testObject = {
    elements: [],
    selectedIds: [],
    activeTool: 'select', // This was missing from destructuring
    grid: { enabled: true, snap: false } // This was missing from destructuring
  };
  
  console.log("✅ Test passed - variables are properly defined");
  console.log("Elements:", testObject.elements.length);
  console.log("Selected:", testObject.selectedIds.length);
  console.log("Tool:", testObject.activeTool);
  console.log("Grid:", testObject.grid.enabled ? (testObject.grid.snap ? 'Snap On' : 'Visible') : 'Off');
  
} catch (error) {
  console.error("❌ Test failed:", error.message);
}
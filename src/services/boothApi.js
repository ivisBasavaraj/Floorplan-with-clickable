// Mock API service for booth data
export const mockBoothData = [
  {
    boothId: "B12",
    name: "Company X",
    description: "Leading technology solutions provider",
    coords: [[77.5946, 12.9716], [77.5948, 12.9716], [77.5948, 12.9718], [77.5946, 12.9718]]
  },
  {
    boothId: "B13", 
    name: "Company Y",
    description: "Innovative software development",
    coords: [[77.5950, 12.9716], [77.5952, 12.9716], [77.5952, 12.9718], [77.5950, 12.9718]]
  },
  {
    boothId: "B14",
    name: "Company Z", 
    description: "Digital transformation experts",
    coords: [[77.5946, 12.9720], [77.5948, 12.9720], [77.5948, 12.9722], [77.5946, 12.9722]]
  },
  {
    boothId: "B15",
    name: "Tech Corp",
    description: "Cloud computing solutions",
    coords: [[77.5950, 12.9720], [77.5952, 12.9720], [77.5952, 12.9722], [77.5950, 12.9722]]
  },
  {
    boothId: "B16",
    name: "Innovation Labs",
    description: "AI and machine learning research",
    coords: [[77.5954, 12.9716], [77.5956, 12.9716], [77.5956, 12.9718], [77.5954, 12.9718]]
  }
];

// Simulate API call with delay
export const fetchBoothData = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockBoothData);
    }, 1000);
  });
};

// Simulate API call for specific booth
export const fetchBoothById = async (boothId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const booth = mockBoothData.find(b => b.boothId === boothId);
      if (booth) {
        resolve(booth);
      } else {
        reject(new Error(`Booth ${boothId} not found`));
      }
    }, 500);
  });
};
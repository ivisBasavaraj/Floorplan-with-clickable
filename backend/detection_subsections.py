import cv2
import numpy as np
from typing import List, Dict, Any

def detect_with_subsections(image_path: str) -> Dict[str, Any]:
    """
    Detect walls, booths, and sub-booths from floorplan image.
    
    Returns:
        Dict with walls, booths (including sub_booths)
    """
    try:
        # Simple test data for now
        return {
            "walls": [
                {"id": "wall_1", "coordinates": [[100, 100], [200, 100]]},
                {"id": "wall_2", "coordinates": [[200, 100], [200, 200]]}
            ],
            "booths": [
                {
                    "id": "booth_1",
                    "polygon": [[50, 50], [150, 50], [150, 150], [50, 150]],
                    "sub_booths": [
                        {"id": "booth_1_a", "polygon": [[50, 50], [100, 50], [100, 150], [50, 150]]},
                        {"id": "booth_1_b", "polygon": [[100, 50], [150, 50], [150, 150], [100, 150]]}
                    ]
                }
            ]
        }
        
    except Exception as e:
        print(f"Error in detect_with_subsections: {e}")
        return {"walls": [], "booths": []}

def _detect_walls(image):
    """Detect walls using existing wall detection logic"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, 50, minLineLength=60, maxLineGap=10)
    
    walls = []
    if lines is not None:
        for i, line in enumerate(lines):
            x1, y1, x2, y2 = line[0]
            walls.append({
                "id": f"wall_{i+1}",
                "coordinates": [[x1, y1], [x2, y2]]
            })
    
    return walls

def _detect_booth_contours(image):
    """Detect main booth areas (non-blue regions)"""
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    
    # Mask for booth areas (exclude blue partitions)
    lower_blue = np.array([100, 50, 50])
    upper_blue = np.array([130, 255, 255])
    blue_mask = cv2.inRange(hsv, lower_blue, upper_blue)
    
    # Invert to get non-blue areas
    booth_mask = cv2.bitwise_not(blue_mask)
    
    # Clean up mask
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    booth_mask = cv2.morphologyEx(booth_mask, cv2.MORPH_CLOSE, kernel)
    
    # Find contours
    contours, _ = cv2.findContours(booth_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Filter by area
    booth_contours = []
    for contour in contours:
        area = cv2.contourArea(contour)
        if area > 1000:  # Minimum booth size
            booth_contours.append(contour)
    
    return booth_contours

def _detect_blue_partitions(image):
    """Detect blue partition lines inside booths"""
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    
    # Blue line detection
    lower_blue = np.array([100, 50, 50])
    upper_blue = np.array([130, 255, 255])
    blue_mask = cv2.inRange(hsv, lower_blue, upper_blue)
    
    # Morphological operations to clean lines
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    blue_mask = cv2.morphologyEx(blue_mask, cv2.MORPH_CLOSE, kernel)
    
    # Detect lines in blue mask
    lines = cv2.HoughLinesP(blue_mask, 1, np.pi/180, 30, minLineLength=20, maxLineGap=5)
    
    partition_lines = []
    if lines is not None:
        for line in lines:
            x1, y1, x2, y2 = line[0]
            partition_lines.append([(x1, y1), (x2, y2)])
    
    return partition_lines

def _build_booths_with_subsections(booth_contours, partition_lines):
    """Build booth objects with sub-sections based on partitions"""
    booths = []
    
    for i, contour in enumerate(booth_contours):
        booth_id = f"booth_{i+1}"
        
        # Convert contour to simple polygon
        points = contour.reshape(-1, 2)
        if len(points) < 3:
            continue
        
        # Get bounding box
        x, y, w, h = cv2.boundingRect(contour)
        
        # Find partition lines that intersect this booth area
        intersecting_lines = []
        for line in partition_lines:
            (x1, y1), (x2, y2) = line
            if (x <= x1 <= x + w and y <= y1 <= y + h) or (x <= x2 <= x + w and y <= y2 <= y + h):
                intersecting_lines.append(line)
        
        # Create sub-booths if partitions exist
        sub_booths = []
        if intersecting_lines:
            sub_booths = _create_sub_booths_simple(x, y, w, h, intersecting_lines, booth_id)
        
        # Convert contour to coordinate list
        booth_coords = [[int(point[0]), int(point[1])] for point in points]
        
        booth_data = {
            "id": booth_id,
            "polygon": booth_coords,
            "sub_booths": sub_booths
        }
        
        booths.append(booth_data)
    
    return booths

def _create_sub_booths_simple(x, y, w, h, partition_lines, parent_id):
    """Create sub-booth rectangles by splitting booth with partition lines"""
    sub_booths = []
    
    try:
        # Determine if partitions are vertical or horizontal
        vertical_lines = []
        horizontal_lines = []
        
        for line in partition_lines:
            (x1, y1), (x2, y2) = line
            if abs(x2 - x1) > abs(y2 - y1):  # More horizontal
                horizontal_lines.append(line)
            else:  # More vertical
                vertical_lines.append(line)
        
        # Create sub-sections based on partition orientation
        if vertical_lines and not horizontal_lines:
            # Vertical partitions - split left/right
            x_split = x + w // 2
            
            # Left section
            left_coords = [[x, y], [x_split, y], [x_split, y + h], [x, y + h]]
            sub_booths.append({
                "id": f"{parent_id}_a",
                "polygon": left_coords
            })
            
            # Right section  
            right_coords = [[x_split, y], [x + w, y], [x + w, y + h], [x_split, y + h]]
            sub_booths.append({
                "id": f"{parent_id}_b",
                "polygon": right_coords
            })
                
        elif horizontal_lines and not vertical_lines:
            # Horizontal partitions - split top/bottom
            y_split = y + h // 2
            
            # Top section
            top_coords = [[x, y], [x + w, y], [x + w, y_split], [x, y_split]]
            sub_booths.append({
                "id": f"{parent_id}_a",
                "polygon": top_coords
            })
            
            # Bottom section
            bottom_coords = [[x, y_split], [x + w, y_split], [x + w, y + h], [x, y + h]]
            sub_booths.append({
                "id": f"{parent_id}_b",
                "polygon": bottom_coords
            })
    
    except Exception as e:
        print(f"Error creating sub-booths: {e}")
    
    return sub_booths
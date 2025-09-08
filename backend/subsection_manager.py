import cv2
import numpy as np
from typing import List, Dict, Any

def detect_blue_divisions_in_booth(image_path: str, booth_bounds: Dict) -> List[Dict]:
    """
    Detect blue line divisions within a specific booth area.
    
    Args:
        image_path: Path to floor plan image
        booth_bounds: {"x": int, "y": int, "width": int, "height": int}
    
    Returns:
        List of subsection coordinates
    """
    try:
        image = cv2.imread(image_path)
        if image is None:
            return []
        
        # Extract booth area
        x, y, w, h = booth_bounds["x"], booth_bounds["y"], booth_bounds["width"], booth_bounds["height"]
        booth_roi = image[y:y+h, x:x+w]
        
        # Detect blue lines in HSV
        hsv = cv2.cvtColor(booth_roi, cv2.COLOR_BGR2HSV)
        lower_blue = np.array([100, 50, 50])
        upper_blue = np.array([130, 255, 255])
        blue_mask = cv2.inRange(hsv, lower_blue, upper_blue)
        
        # Find blue lines
        lines = cv2.HoughLinesP(blue_mask, 1, np.pi/180, 30, minLineLength=20, maxLineGap=5)
        
        if lines is None or len(lines) == 0:
            return []
        
        # Determine division type (vertical or horizontal)
        vertical_lines = []
        horizontal_lines = []
        
        for line in lines:
            x1, y1, x2, y2 = line[0]
            if abs(x2 - x1) > abs(y2 - y1):  # More horizontal
                horizontal_lines.append(line[0])
            else:  # More vertical
                vertical_lines.append(line[0])
        
        subsections = []
        
        if vertical_lines:
            # Split booth vertically
            x_split = w // 2  # Simple middle split
            subsections = [
                {"x": 0, "y": 0, "width": x_split, "height": h},
                {"x": x_split, "y": 0, "width": w - x_split, "height": h}
            ]
        elif horizontal_lines:
            # Split booth horizontally
            y_split = h // 2  # Simple middle split
            subsections = [
                {"x": 0, "y": 0, "width": w, "height": y_split},
                {"x": 0, "y": y_split, "width": w, "height": h - y_split}
            ]
        
        # Convert relative coordinates to absolute
        for subsection in subsections:
            subsection["x"] += x
            subsection["y"] += y
        
        return subsections
        
    except Exception as e:
        print(f"Error detecting blue divisions: {e}")
        return []

def create_subsection_ids(parent_booth_id: str, count: int) -> List[str]:
    """Generate subsection IDs like B1A, B1B, etc."""
    letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return [f"{parent_booth_id}{letters[i]}" for i in range(count)]
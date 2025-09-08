import cv2
import numpy as np
from typing import List, Dict, Any, Optional

def detect_rects_with_hierarchy(image_path: str, min_area: int = 400, 
                               hsv_lower: List[int] = [95, 40, 40], 
                               hsv_upper: List[int] = [140, 255, 255], 
                               kernel_size: int = 9) -> List[Dict[str, Any]]:
    """
    Detect blue rectangles with parent-child hierarchy using contour tree structure.
    
    Args:
        image_path: Path to input image
        min_area: Minimum contour area to consider
        hsv_lower: Lower HSV threshold for blue detection
        hsv_upper: Upper HSV threshold for blue detection  
        kernel_size: Morphological operations kernel size
    
    Returns:
        List of rect dicts with hierarchy: {"id", "x", "y", "w", "h", "score", "parent_id"}
    
    Tuning parameters:
    - hsv_lower/hsv_upper: Adjust for different blue shades
    - kernel_size: Larger values = more aggressive noise cleanup
    - min_area: Filter out small contours (increase to reduce noise)
    """
    try:
        # Load and convert image
        image = cv2.imread(image_path)
        if image is None:
            return []
        
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        # Create blue mask
        lower_blue = np.array(hsv_lower)
        upper_blue = np.array(hsv_upper)
        mask = cv2.inRange(hsv, lower_blue, upper_blue)
        
        # Morphological operations
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (kernel_size, kernel_size))
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
        
        # Find contours with hierarchy
        contours, hierarchy = cv2.findContours(mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        
        if hierarchy is None:
            return []
        
        # Build candidate rects
        candidates = []
        try:
            blue_lines = _detect_blue_lines_in_image(image)
        except:
            blue_lines = []
        
        for i, contour in enumerate(contours):
            area = cv2.contourArea(contour)
            if area >= min_area:
                x, y, w, h = cv2.boundingRect(contour)
                rect_area = w * h
                area_ratio = area / rect_area if rect_area > 0 else 0
                score = min(1.0, area_ratio * (area / min_area))
                
                # Check for blue lines inside this booth
                try:
                    sub_booths = _detect_sub_booths_in_rect(x, y, w, h, blue_lines)
                except:
                    sub_booths = []
                
                candidates.append({
                    "contour_idx": i,
                    "id": len(candidates) + 1,
                    "x": int(x),
                    "y": int(y), 
                    "w": int(w),
                    "h": int(h),
                    "score": round(score, 3),
                    "area": area,
                    "parent_id": None,
                    "sub_booths": sub_booths
                })
        
        # Map hierarchy relationships
        idx_to_candidate = {c["contour_idx"]: c for c in candidates}
        
        for candidate in candidates:
            contour_idx = candidate["contour_idx"]
            parent_idx = hierarchy[0][contour_idx][3]  # Parent index
            
            if parent_idx != -1 and parent_idx in idx_to_candidate:
                parent_candidate = idx_to_candidate[parent_idx]
                candidate["parent_id"] = parent_candidate["id"]
        
        # Post-filter: remove parent relationship if child is too large
        for candidate in candidates:
            if candidate["parent_id"]:
                parent = next(c for c in candidates if c["id"] == candidate["parent_id"])
                child_bbox_area = candidate["w"] * candidate["h"]
                parent_bbox_area = parent["w"] * parent["h"]
                
                if child_bbox_area >= 0.9 * parent_bbox_area:
                    candidate["parent_id"] = None
        
        # Clean up and sort
        rects = []
        for candidate in candidates:
            rect = {k: v for k, v in candidate.items() if k not in ["contour_idx", "area", "sub_booths"]}
            rects.append(rect)
            
            # Add sub-booths as separate rects
            try:
                for sub_booth in candidate.get("sub_booths", []):
                    rects.append(sub_booth)
            except:
                pass
        
        # Sort by position (top to bottom, left to right)
        rects.sort(key=lambda r: (r["y"], r["x"]))
        
        return rects
        
    except Exception as e:
        print(f"Error in detect_rects_with_hierarchy: {e}")
        return []

def build_groups(rects: List[Dict[str, Any]]) -> Dict[str, List[int]]:
    """
    Build parent-child groupings from rect hierarchy.
    
    Args:
        rects: List of rect dicts with parent_id field
        
    Returns:
        Dict mapping parent IDs to lists of child IDs: {"1": [2,3], ...}
    """
    groups = {}
    
    for rect in rects:
        parent_id = rect.get("parent_id")
        if parent_id:
            parent_key = str(parent_id)
            if parent_key not in groups:
                groups[parent_key] = []
            groups[parent_key].append(rect["id"])
    
    return groups

def _detect_blue_lines_in_image(image):
    """Detect blue lines in the entire image"""
    try:
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        # Broader blue range to catch more blue lines
        lower_blue = np.array([90, 30, 30])
        upper_blue = np.array([150, 255, 255])
        blue_mask = cv2.inRange(hsv, lower_blue, upper_blue)
        
        # Dilate to make lines thicker for better detection
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        blue_mask = cv2.dilate(blue_mask, kernel, iterations=1)
        
        lines = cv2.HoughLinesP(blue_mask, 1, np.pi/180, 20, minLineLength=15, maxLineGap=10)
        print(f"Detected {len(lines) if lines is not None else 0} blue lines")
        return lines if lines is not None else []
    except Exception as e:
        print(f"Error detecting blue lines: {e}")
        return []

def _detect_sub_booths_in_rect(x, y, w, h, blue_lines):
    """Detect sub-booths within a rectangle based on blue lines"""
    try:
        sub_booths = []
        
        if not blue_lines or len(blue_lines) == 0:
            print(f"No blue lines found for booth at ({x}, {y})")
            return sub_booths
        
        # Find blue lines that are inside this rectangle (with some tolerance)
        internal_lines = []
        margin = 10  # Allow some margin for line detection
        
        for line in blue_lines:
            try:
                x1, y1, x2, y2 = line[0]
                # Check if line is inside the booth rectangle (with margin)
                if ((x - margin <= x1 <= x + w + margin) and (y - margin <= y1 <= y + h + margin)) or \
                   ((x - margin <= x2 <= x + w + margin) and (y - margin <= y2 <= y + h + margin)):
                    internal_lines.append(line[0])
                    print(f"Found internal line in booth ({x},{y}): ({x1},{y1}) to ({x2},{y2})")
            except:
                continue
        
        print(f"Found {len(internal_lines)} internal lines for booth at ({x}, {y})")
        
        if len(internal_lines) > 0:
            # Always create divisions if we find blue lines
            print(f"Creating sub-booths for booth at ({x}, {y})")
            
            # Check if lines are more vertical or horizontal
            vertical_count = 0
            horizontal_count = 0
            
            for line in internal_lines:
                x1, y1, x2, y2 = line
                if abs(x2 - x1) < abs(y2 - y1):  # More vertical
                    vertical_count += 1
                else:
                    horizontal_count += 1
            
            if vertical_count > horizontal_count:
                # Split vertically
                x_split = x + w // 2
                sub_booths = [
                    {"id": "A", "x": x, "y": y, "w": w//2, "h": h, "score": 1.0, "parent_id": None},
                    {"id": "B", "x": x_split, "y": y, "w": w//2, "h": h, "score": 1.0, "parent_id": None}
                ]
                print(f"Created vertical split: A({x},{y}) B({x_split},{y})")
            else:
                # Split horizontally
                y_split = y + h // 2
                sub_booths = [
                    {"id": "A", "x": x, "y": y, "w": w, "h": h//2, "score": 1.0, "parent_id": None},
                    {"id": "B", "x": x, "y": y_split, "w": w, "h": h//2, "score": 1.0, "parent_id": None}
                ]
                print(f"Created horizontal split: A({x},{y}) B({x},{y_split})")
        
        return sub_booths
    except Exception as e:
        print(f"Error in _detect_sub_booths_in_rect: {e}")
        return []

def draw_overlay_with_hierarchy(image_path: str, rects: List[Dict], out_path: str) -> bool:
    """
    Draw hierarchical rectangles with distinct styles for parents vs children.
    
    Args:
        image_path: Input image path
        rects: List of rect dicts with hierarchy
        out_path: Output overlay path
        
    Returns:
        True if successful, False otherwise
    """
    try:
        image = cv2.imread(image_path)
        if image is None:
            return False
        
        overlay = image.copy()
        
        # Draw rectangles with hierarchy-aware styling
        for rect in rects:
            x, y, w, h = rect["x"], rect["y"], rect["w"], rect["h"]
            rect_id = rect["id"]
            is_parent = any(r.get("parent_id") == rect_id for r in rects)
            is_child = rect.get("parent_id") is not None
            
            if is_parent:
                # Parent booth: thicker green border, lighter fill
                cv2.rectangle(overlay, (x, y), (x + w, y + h), (0, 255, 0), -1)
                cv2.rectangle(overlay, (x, y), (x + w, y + h), (0, 200, 0), 3)
                text_color = (0, 0, 0)
            elif is_child:
                # Child booth: blue border, semi-transparent fill
                cv2.rectangle(overlay, (x, y), (x + w, y + h), (255, 100, 0), -1)
                cv2.rectangle(overlay, (x, y), (x + w, y + h), (255, 0, 0), 2)
                text_color = (255, 255, 255)
            else:
                # Standalone booth: standard green
                cv2.rectangle(overlay, (x, y), (x + w, y + h), (0, 255, 0), -1)
                cv2.rectangle(overlay, (x, y), (x + w, y + h), (0, 200, 0), 2)
                text_color = (0, 0, 0)
            
            # Draw ID
            text = str(rect_id)
            text_size = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)[0]
            text_x = x + (w - text_size[0]) // 2
            text_y = y + (h + text_size[1]) // 2
            cv2.putText(overlay, text, (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.7, text_color, 2)
        
        # Blend with original
        result = cv2.addWeighted(image, 0.6, overlay, 0.4, 0)
        cv2.imwrite(out_path, result)
        return True
        
    except Exception as e:
        print(f"Error in draw_overlay_with_hierarchy: {e}")
        return False
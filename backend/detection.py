import cv2
import numpy as np
import math
from typing import List, Dict, Tuple, Any

def detect_rects_by_color(image_path: str, min_area: int = 800, 
                         hsv_lower: List[int] = [90, 30, 30], 
                         hsv_upper: List[int] = [150, 255, 255], 
                         kernel_size: int = 5) -> List[Dict[str, Any]]:
    """
    Detect blue-filled booths and rectangles without color via multiple detection methods.
    
    Args:
        image_path: Path to the input image
        min_area: Minimum contour area to consider as a booth
        hsv_lower: Lower HSV threshold for blue color [H, S, V]
        hsv_upper: Upper HSV threshold for blue color [H, S, V]
        kernel_size: Size of morphological operations kernel
    
    Returns:
        List of booth dictionaries with id, x, y, w, h, score
    
    Tuning parameters:
    - Adjusted hsv_lower/hsv_upper for broader blue detection
    - Reduced min_area to catch smaller booths
    - Added grayscale rectangle detection for non-colored rectangles
    """
    try:
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            return []
        
        rects = []
        
        # Method 1: Blue Color Detection (HSV + LAB, more tolerant to lighting)
        # Smooth a little to reduce pixel noise while keeping edges
        image_blur = cv2.GaussianBlur(image, (3, 3), 0)
        hsv = cv2.cvtColor(image_blur, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(image_blur, cv2.COLOR_BGR2LAB)

        # HSV: broadened blue ranges with lower S/V thresholds to capture light/dark blues
        blue_ranges = [
            ([85, 15, 40], [135, 255, 255]),  # broad blue/cyan
            ([95, 20, 50], [130, 255, 255]),  # classic blue
            ([105, 10, 30], [150, 255, 255])  # very desaturated dark/sky blues
        ]

        hsv_mask = np.zeros(hsv.shape[:2], dtype=np.uint8)
        for lower, upper in blue_ranges:
            lower_blue = np.array(lower, dtype=np.uint8)
            upper_blue = np.array(upper, dtype=np.uint8)
            mask = cv2.inRange(hsv, lower_blue, upper_blue)
            hsv_mask = cv2.bitwise_or(hsv_mask, mask)

        # LAB: blue has lower b-channel values (toward 0). Combine with HSV mask to be robust.
        b_channel = lab[:, :, 2]
        lab_mask = cv2.inRange(b_channel, 0, 140)  # 0..140 tends to capture blues (tuneable)

        combined_mask = cv2.bitwise_or(hsv_mask, lab_mask)

        # Clean up the mask
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (kernel_size, kernel_size))
        combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_CLOSE, kernel)
        combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_OPEN, kernel)

        # Find blue contours
        contours, _ = cv2.findContours(combined_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        for i, contour in enumerate(contours):
            area = cv2.contourArea(contour)
            if area >= min_area:
                x, y, w, h = cv2.boundingRect(contour)
                rect_area = w * h
                rectangularity = area / rect_area if rect_area > 0 else 0

                # Higher score for blue rectangles
                score = min(1.0, rectangularity * (area / min_area) * 1.2)

                rects.append({
                    "id": len(rects) + 1,
                    "x": int(x),
                    "y": int(y),
                    "w": int(w),
                    "h": int(h),
                    "score": round(score, 3),
                    "type": "blue"
                })
        
        # Method 2: Edge-based Rectangle Detection for non-colored rectangles
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply adaptive threshold to handle varying lighting
        thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        
        # Find contours in thresholded image
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            area = cv2.contourArea(contour)
            if area >= min_area:
                # Approximate contour to polygon
                epsilon = 0.02 * cv2.arcLength(contour, True)
                approx = cv2.approxPolyDP(contour, epsilon, True)
                
                # Check if it's roughly rectangular (4 corners)
                if len(approx) >= 4:
                    x, y, w, h = cv2.boundingRect(contour)
                    rect_area = w * h
                    rectangularity = area / rect_area if rect_area > 0 else 0
                    
                    # Check if this rectangle overlaps with existing blue rectangles
                    overlaps = False
                    for existing_rect in rects:
                        if (abs(x - existing_rect['x']) < 20 and 
                            abs(y - existing_rect['y']) < 20 and
                            abs(w - existing_rect['w']) < 40 and
                            abs(h - existing_rect['h']) < 40):
                            overlaps = True
                            break
                    
                    if not overlaps and rectangularity > 0.7:  # Good rectangularity
                        score = min(1.0, rectangularity * (area / min_area))
                        
                        rects.append({
                            "id": len(rects) + 1,
                            "x": int(x),
                            "y": int(y),
                            "w": int(w),
                            "h": int(h),
                            "score": round(score, 3),
                            "type": "edge"
                        })
        
        # Method 3: Canny Edge Detection for outlined rectangles
        edges = cv2.Canny(gray, 50, 150)
        
        # Dilate edges to close gaps
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        edges = cv2.dilate(edges, kernel, iterations=1)
        
        # Find contours in edge image
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            area = cv2.contourArea(contour)
            if area >= min_area:
                epsilon = 0.02 * cv2.arcLength(contour, True)
                approx = cv2.approxPolyDP(contour, epsilon, True)
                
                if len(approx) >= 4:
                    x, y, w, h = cv2.boundingRect(contour)
                    rect_area = w * h
                    rectangularity = area / rect_area if rect_area > 0 else 0
                    
                    # Check for overlaps
                    overlaps = False
                    for existing_rect in rects:
                        if (abs(x - existing_rect['x']) < 30 and 
                            abs(y - existing_rect['y']) < 30 and
                            abs(w - existing_rect['w']) < 50 and
                            abs(h - existing_rect['h']) < 50):
                            overlaps = True
                            break
                    
                    if not overlaps and rectangularity > 0.6:
                        score = min(1.0, rectangularity * (area / min_area) * 0.8)
                        
                        rects.append({
                            "id": len(rects) + 1,
                            "x": int(x),
                            "y": int(y),
                            "w": int(w),
                            "h": int(h),
                            "score": round(score, 3),
                            "type": "canny"
                        })
        
        # Sort by score and re-assign IDs
        rects.sort(key=lambda r: r['score'], reverse=True)
        for i, rect in enumerate(rects):
            rect['id'] = i + 1
        
        print(f"Detected {len(rects)} rectangles using multiple methods")
        return rects
    
    except Exception as e:
        print(f"Error in detect_rects_by_color: {e}")
        return []

def detect_walls_by_lines(image_path: str, canny1: int = 50, canny2: int = 150,
                         min_line_len: int = 60, max_line_gap: int = 10,
                         hough_thresh: int = 50, merge_angle_deg: float = 8,
                         merge_dist_px: float = 15) -> List[Dict[str, Any]]:
    """
    Detect walls via Canny edge detection + HoughLinesP and merge near-collinear segments.
    
    Args:
        image_path: Path to the input image
        canny1: Lower threshold for Canny edge detection
        canny2: Upper threshold for Canny edge detection
        min_line_len: Minimum line length for HoughLinesP
        max_line_gap: Maximum gap between line segments to connect them
        hough_thresh: Threshold for HoughLinesP
        merge_angle_deg: Maximum angle difference (degrees) to consider lines collinear
        merge_dist_px: Maximum distance (pixels) to merge nearby collinear lines
    
    Returns:
        List of wall dictionaries with id, x1, y1, x2, y2, length, angle
    
    Tuning parameters:
    - Adjust canny1/canny2 for edge sensitivity (lower = more edges)
    - Increase min_line_len to filter short segments
    - Adjust hough_thresh for line detection sensitivity
    - Increase merge_angle_deg/merge_dist_px for more aggressive merging
    """
    try:
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            return []
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Canny edge detection
        edges = cv2.Canny(blurred, canny1, canny2)
        
        # Dilate edges to connect nearby segments
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        edges = cv2.dilate(edges, kernel, iterations=1)
        
        # HoughLinesP to detect line segments
        lines = cv2.HoughLinesP(edges, 1, np.pi/180, hough_thresh, 
                               minLineLength=min_line_len, maxLineGap=max_line_gap)
        
        if lines is None:
            return []
        
        # Convert to list of line segments
        segments = []
        for line in lines:
            x1, y1, x2, y2 = line[0]
            segments.append([x1, y1, x2, y2])
        
        # Merge near-collinear segments
        merged_walls = _merge_collinear_segments(segments, merge_angle_deg, merge_dist_px)
        
        # Format output
        walls = []
        for i, (x1, y1, x2, y2) in enumerate(merged_walls):
            length = math.sqrt((x2 - x1)**2 + (y2 - y1)**2)
            angle = math.degrees(math.atan2(y2 - y1, x2 - x1))
            
            walls.append({
                "id": i + 1,
                "x1": int(x1),
                "y1": int(y1),
                "x2": int(x2),
                "y2": int(y2),
                "length": round(length, 2),
                "angle": round(angle, 2)
            })
        
        return walls
    
    except Exception as e:
        print(f"Error in detect_walls_by_lines: {e}")
        return []

def _merge_collinear_segments(segments: List[List[int]], angle_threshold: float, 
                             distance_threshold: float) -> List[List[int]]:
    """
    Greedy merge of near-collinear nearby segments.
    
    Args:
        segments: List of [x1, y1, x2, y2] line segments
        angle_threshold: Maximum angle difference in degrees
        distance_threshold: Maximum distance in pixels
    
    Returns:
        List of merged line segments
    """
    if not segments:
        return []
    
    merged = []
    used = [False] * len(segments)
    
    for i, seg1 in enumerate(segments):
        if used[i]:
            continue
        
        # Start with current segment
        current_seg = seg1[:]
        used[i] = True
        
        # Try to merge with other segments
        merged_any = True
        while merged_any:
            merged_any = False
            for j, seg2 in enumerate(segments):
                if used[j]:
                    continue
                
                if _can_merge_segments(current_seg, seg2, angle_threshold, distance_threshold):
                    current_seg = _merge_two_segments(current_seg, seg2)
                    used[j] = True
                    merged_any = True
        
        merged.append(current_seg)
    
    return merged

def _can_merge_segments(seg1: List[int], seg2: List[int], 
                       angle_threshold: float, distance_threshold: float) -> bool:
    """Check if two segments can be merged based on angle and distance."""
    # Calculate angles
    angle1 = math.atan2(seg1[3] - seg1[1], seg1[2] - seg1[0])
    angle2 = math.atan2(seg2[3] - seg2[1], seg2[2] - seg2[0])
    
    # Normalize angles to [0, π]
    angle1 = abs(angle1)
    angle2 = abs(angle2)
    if angle1 > math.pi/2:
        angle1 = math.pi - angle1
    if angle2 > math.pi/2:
        angle2 = math.pi - angle2
    
    # Check angle difference
    angle_diff = abs(angle1 - angle2)
    if angle_diff > math.radians(angle_threshold):
        return False
    
    # Check if segments are close enough
    points1 = [(seg1[0], seg1[1]), (seg1[2], seg1[3])]
    points2 = [(seg2[0], seg2[1]), (seg2[2], seg2[3])]
    
    min_dist = float('inf')
    for p1 in points1:
        for p2 in points2:
            dist = math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)
            min_dist = min(min_dist, dist)
    
    return min_dist <= distance_threshold

def _merge_two_segments(seg1: List[int], seg2: List[int]) -> List[int]:
    """Merge two segments by finding the endpoints that are farthest apart."""
    points = [(seg1[0], seg1[1]), (seg1[2], seg1[3]), (seg2[0], seg2[1]), (seg2[2], seg2[3])]
    
    max_dist = 0
    best_pair = (points[0], points[1])
    
    for i in range(len(points)):
        for j in range(i + 1, len(points)):
            dist = math.sqrt((points[i][0] - points[j][0])**2 + (points[i][1] - points[j][1])**2)
            if dist > max_dist:
                max_dist = dist
                best_pair = (points[i], points[j])
    
    return [best_pair[0][0], best_pair[0][1], best_pair[1][0], best_pair[1][1]]

def draw_overlay(image_path: str, rects: List[Dict], walls: List[Dict], out_path: str) -> None:
    """
    Draw semi-transparent rectangles (green) and wall lines (red) on the image.
    
    Args:
        image_path: Path to the input image
        rects: List of rectangle dictionaries from detect_rects_by_color
        walls: List of wall dictionaries from detect_walls_by_lines
        out_path: Path to save the overlay image
    """
    try:
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            return
        
        # Create overlay
        overlay = image.copy()
        
        # Draw rectangles (green, semi-transparent)
        for rect in rects:
            x, y, w, h = rect['x'], rect['y'], rect['w'], rect['h']
            
            # Draw filled rectangle with transparency
            cv2.rectangle(overlay, (x, y), (x + w, y + h), (0, 255, 0), -1)
            
            # Draw border
            cv2.rectangle(overlay, (x, y), (x + w, y + h), (0, 200, 0), 2)
            
            # Draw ID text
            text = str(rect['id'])
            text_size = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)[0]
            text_x = x + (w - text_size[0]) // 2
            text_y = y + (h + text_size[1]) // 2
            cv2.putText(overlay, text, (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        # Draw walls (red lines)
        for wall in walls:
            x1, y1, x2, y2 = wall['x1'], wall['y1'], wall['x2'], wall['y2']
            
            # Draw line
            cv2.line(overlay, (x1, y1), (x2, y2), (0, 0, 255), 3)
            
            # Draw endpoints
            cv2.circle(overlay, (x1, y1), 4, (0, 0, 200), -1)
            cv2.circle(overlay, (x2, y2), 4, (0, 0, 200), -1)
            
            # Draw ID text at midpoint
            mid_x = (x1 + x2) // 2
            mid_y = (y1 + y2) // 2
            text = str(wall['id'])
            cv2.putText(overlay, text, (mid_x - 10, mid_y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
        
        # Blend with original image (30% overlay, 70% original)
        result = cv2.addWeighted(image, 0.7, overlay, 0.3, 0)
        
        # Save result
        cv2.imwrite(out_path, result)
        
    except Exception as e:
        print(f"Error in draw_overlay: {e}")
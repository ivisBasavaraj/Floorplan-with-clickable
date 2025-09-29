from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
import uuid
import cv2
import numpy as np
from datetime import datetime
from auth import admin_required
from pymongo import MongoClient
from bson import ObjectId

hierarchical_bp = Blueprint('hierarchical', __name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_db():
    client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/imtma_flooring'))
    return client.get_default_database()

@hierarchical_bp.route('/admin/floorplans/area-upload', methods=['POST'])
@admin_required
def upload_area_floorplan():
    """Upload main area floor plan and detect halls automatically"""
    try:
        if 'file' not in request.files:
            return jsonify({'message': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'message': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'message': 'Invalid file type'}), 400
        
        # Generate unique filename
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        unique_filename = f"{uuid.uuid4().hex}_{name}{ext}"
        
        # Ensure upload directory exists
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        # Save file
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(file_path)
        
        # Detect halls using computer vision
        detected_halls = detect_halls_in_area(file_path)
        
        # Create area floor plan record
        db = get_db()
        current_user_id = get_jwt_identity()
        
        area_plan = {
            'name': request.form.get('name', f'Area Plan {datetime.now().strftime("%Y-%m-%d")}'),
            'description': request.form.get('description', 'Main area floor plan'),
            'type': 'area',
            'image_url': f'/uploads/{unique_filename}',
            'detected_halls': detected_halls,
            'created_by': current_user_id,
            'created_at': datetime.utcnow(),
            'status': 'draft'
        }
        
        result = db.area_floorplans.insert_one(area_plan)
        area_plan['id'] = str(result.inserted_id)
        area_plan.pop('_id', None)
        
        return jsonify({
            'success': True,
            'area_plan': area_plan,
            'detected_halls': detected_halls,
            'upload_url': f'/uploads/{unique_filename}'
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Upload failed', 'error': str(e)}), 500

@hierarchical_bp.route('/admin/floorplans/hall-upload/<hall_id>', methods=['POST'])
@admin_required
def upload_hall_floorplan(hall_id):
    """Upload floor plan for a specific hall"""
    try:
        if 'file' not in request.files:
            return jsonify({'message': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'message': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'message': 'Invalid file type'}), 400
        
        # Verify hall exists
        db = get_db()
        hall = db.halls.find_one({'_id': ObjectId(hall_id)})
        if not hall:
            return jsonify({'message': 'Hall not found'}), 404
        
        # Generate unique filename
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        unique_filename = f"{uuid.uuid4().hex}_hall_{hall_id}_{name}{ext}"
        
        # Save file
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(file_path)
        
        # Process hall floor plan
        booth_detection = detect_booths_in_hall(file_path)
        
        # Create hall floor plan record
        current_user_id = get_jwt_identity()
        
        hall_plan = {
            'name': request.form.get('name', f'Hall {hall["name"]} Floor Plan'),
            'description': request.form.get('description', f'Floor plan for {hall["name"]}'),
            'type': 'hall',
            'hall_id': hall_id,
            'area_plan_id': request.form.get('area_plan_id'),
            'image_url': f'/uploads/{unique_filename}',
            'booth_detection': booth_detection,
            'created_by': current_user_id,
            'created_at': datetime.utcnow(),
            'status': 'draft',
            'state': {
                'elements': booth_detection.get('booths', []),
                'canvasSize': {'width': booth_detection.get('imageWidth', 1200), 'height': booth_detection.get('imageHeight', 800)},
                'zoom': 1,
                'offset': {'x': 0, 'y': 0},
                'grid': {'enabled': True, 'size': 20, 'snap': True, 'opacity': 0.3}
            }
        }
        
        result = db.hall_floorplans.insert_one(hall_plan)
        hall_plan['id'] = str(result.inserted_id)
        hall_plan.pop('_id', None)
        
        return jsonify({
            'success': True,
            'hall_plan': hall_plan,
            'booth_detection': booth_detection
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Upload failed', 'error': str(e)}), 500

@hierarchical_bp.route('/admin/area-plans', methods=['GET'])
@admin_required
def get_area_plans():
    """Get all area floor plans"""
    try:
        db = get_db()
        current_user_id = get_jwt_identity()
        
        # Admin can see all area plans
        area_plans = list(db.area_floorplans.find().sort('created_at', -1))
        
        for plan in area_plans:
            plan['id'] = str(plan['_id'])
            plan.pop('_id', None)
        
        return jsonify({
            'success': True,
            'area_plans': area_plans
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get area plans', 'error': str(e)}), 500

@hierarchical_bp.route('/admin/hall-plans/<hall_id>', methods=['GET'])
@admin_required
def get_hall_plans(hall_id):
    """Get floor plans for a specific hall"""
    try:
        db = get_db()
        
        # Get hall plans for specific hall
        hall_plans = list(db.hall_floorplans.find({'hall_id': hall_id}).sort('created_at', -1))
        
        for plan in hall_plans:
            plan['id'] = str(plan['_id'])
            plan.pop('_id', None)
        
        return jsonify({
            'success': True,
            'hall_plans': hall_plans
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get hall plans', 'error': str(e)}), 500

@hierarchical_bp.route('/admin/halls/<hall_id>/assign-plan', methods=['POST'])
@admin_required
def assign_plan_to_hall(hall_id):
    """Assign a floor plan to a specific hall"""
    try:
        data = request.get_json()
        plan_id = data.get('plan_id')
        
        if not plan_id:
            return jsonify({'message': 'Plan ID is required'}), 400
        
        db = get_db()
        
        # Verify hall exists
        hall = db.halls.find_one({'_id': ObjectId(hall_id)})
        if not hall:
            return jsonify({'message': 'Hall not found'}), 404
        
        # Update hall with assigned plan
        db.halls.update_one(
            {'_id': ObjectId(hall_id)},
            {
                '$set': {
                    'assigned_plan_id': plan_id,
                    'last_modified': datetime.utcnow()
                }
            }
        )
        
        return jsonify({
            'success': True,
            'message': 'Plan assigned to hall successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to assign plan', 'error': str(e)}), 500

def detect_halls_in_area(image_path):
    """
    Advanced computer vision algorithm to detect hall spaces in area floor plans
    """
    try:
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            return []
        
        h, w = image.shape[:2]
        
        # Convert to different color spaces for better detection
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        detected_halls = []
        
        # Method 1: Detect large rectangular areas (potential halls)
        # Apply adaptive threshold
        thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        
        # Find contours
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter contours by area and rectangularity
        min_hall_area = (w * h) * 0.05  # Minimum 5% of image area
        
        for i, contour in enumerate(contours):
            area = cv2.contourArea(contour)
            
            if area >= min_hall_area:
                # Check rectangularity
                epsilon = 0.02 * cv2.arcLength(contour, True)
                approx = cv2.approxPolyDP(contour, epsilon, True)
                
                if len(approx) >= 4:  # Roughly rectangular
                    x, y, w_rect, h_rect = cv2.boundingRect(contour)
                    
                    # Calculate rectangularity score
                    rect_area = w_rect * h_rect
                    rectangularity = area / rect_area if rect_area > 0 else 0
                    
                    if rectangularity > 0.7:  # Good rectangularity
                        hall_data = {
                            'id': f'hall_{i + 1}',
                            'name': f'Hall {i + 1}',
                            'bounds': {
                                'x': int(x),
                                'y': int(y),
                                'width': int(w_rect),
                                'height': int(h_rect)
                            },
                            'area': int(area),
                            'confidence': round(rectangularity, 3),
                            'detection_method': 'contour_analysis'
                        }
                        detected_halls.append(hall_data)
        
        # Method 2: Color-based hall detection
        # Detect distinct colored regions that might represent different halls
        color_halls = detect_halls_by_color(image, hsv)
        
        # Merge results and remove duplicates
        all_halls = detected_halls + color_halls
        merged_halls = merge_overlapping_halls(all_halls)
        
        # Sort by area (largest first) and limit to reasonable number
        merged_halls.sort(key=lambda h: h['area'], reverse=True)
        
        return merged_halls[:10]  # Maximum 10 halls
        
    except Exception as e:
        print(f"Error in hall detection: {e}")
        return []

def detect_halls_by_color(image, hsv):
    """Detect halls based on distinct color regions"""
    halls = []
    
    try:
        # Define color ranges for different hall types
        color_ranges = [
            # Blue halls
            ([100, 50, 50], [130, 255, 255], 'blue'),
            # Green halls  
            ([40, 50, 50], [80, 255, 255], 'green'),
            # Red halls
            ([0, 50, 50], [20, 255, 255], 'red'),
            # Yellow halls
            ([20, 50, 50], [40, 255, 255], 'yellow'),
        ]
        
        hall_counter = 1
        
        for lower, upper, color_name in color_ranges:
            lower_bound = np.array(lower)
            upper_bound = np.array(upper)
            
            # Create mask for this color range
            mask = cv2.inRange(hsv, lower_bound, upper_bound)
            
            # Clean up mask
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
            
            # Find contours in color mask
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            for contour in contours:
                area = cv2.contourArea(contour)
                
                # Minimum area threshold for halls
                if area >= 5000:
                    x, y, w, h = cv2.boundingRect(contour)
                    
                    hall_data = {
                        'id': f'hall_{color_name}_{hall_counter}',
                        'name': f'{color_name.title()} Hall {hall_counter}',
                        'bounds': {
                            'x': int(x),
                            'y': int(y),
                            'width': int(w),
                            'height': int(h)
                        },
                        'area': int(area),
                        'confidence': 0.8,
                        'detection_method': f'color_{color_name}',
                        'color': color_name
                    }
                    halls.append(hall_data)
                    hall_counter += 1
        
        return halls
        
    except Exception as e:
        print(f"Error in color-based hall detection: {e}")
        return []

def merge_overlapping_halls(halls):
    """Merge overlapping hall detections"""
    if not halls:
        return []
    
    merged = []
    used = set()
    
    for i, hall1 in enumerate(halls):
        if i in used:
            continue
        
        current_hall = hall1.copy()
        used.add(i)
        
        # Check for overlaps with remaining halls
        for j, hall2 in enumerate(halls[i+1:], i+1):
            if j in used:
                continue
            
            if halls_overlap(hall1['bounds'], hall2['bounds']):
                # Merge the halls
                current_hall = merge_two_halls(current_hall, hall2)
                used.add(j)
        
        merged.append(current_hall)
    
    return merged

def halls_overlap(bounds1, bounds2, threshold=0.3):
    """Check if two hall bounds overlap significantly"""
    x1, y1, w1, h1 = bounds1['x'], bounds1['y'], bounds1['width'], bounds1['height']
    x2, y2, w2, h2 = bounds2['x'], bounds2['y'], bounds2['width'], bounds2['height']
    
    # Calculate intersection
    left = max(x1, x2)
    top = max(y1, y2)
    right = min(x1 + w1, x2 + w2)
    bottom = min(y1 + h1, y2 + h2)
    
    if left < right and top < bottom:
        intersection_area = (right - left) * (bottom - top)
        area1 = w1 * h1
        area2 = w2 * h2
        
        # Check if intersection is significant
        overlap_ratio = intersection_area / min(area1, area2)
        return overlap_ratio > threshold
    
    return False

def merge_two_halls(hall1, hall2):
    """Merge two overlapping halls"""
    bounds1 = hall1['bounds']
    bounds2 = hall2['bounds']
    
    # Calculate merged bounds
    min_x = min(bounds1['x'], bounds2['x'])
    min_y = min(bounds1['y'], bounds2['y'])
    max_x = max(bounds1['x'] + bounds1['width'], bounds2['x'] + bounds2['width'])
    max_y = max(bounds1['y'] + bounds1['height'], bounds2['y'] + bounds2['height'])
    
    merged_hall = {
        'id': hall1['id'],  # Keep first hall's ID
        'name': hall1['name'],
        'bounds': {
            'x': min_x,
            'y': min_y,
            'width': max_x - min_x,
            'height': max_y - min_y
        },
        'area': (max_x - min_x) * (max_y - min_y),
        'confidence': (hall1['confidence'] + hall2['confidence']) / 2,
        'detection_method': 'merged',
        'merged_from': [hall1['id'], hall2['id']]
    }
    
    return merged_hall

def detect_booths_in_hall(image_path):
    """Detect booths within a hall floor plan"""
    try:
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            return {'booths': [], 'imageWidth': 0, 'imageHeight': 0}
        
        h, w = image.shape[:2]
        
        # Use existing booth detection logic
        from detection import detect_rects_by_color
        from yolo_detect import detect_booths
        
        # Try YOLO detection first
        try:
            booths = detect_booths(image_path, conf=0.3, iou=0.5)
        except:
            # Fallback to OpenCV detection
            booths = detect_rects_by_color(image_path, min_area=800)
        
        # Convert booth format for hall floor plans
        hall_booths = []
        for i, booth in enumerate(booths):
            hall_booth = {
                'id': f'booth_{i + 1}',
                'type': 'booth',
                'x': booth['x'],
                'y': booth['y'],
                'width': booth['w'],
                'height': booth['h'],
                'rotation': 0,
                'fill': '#FFFFFF',
                'stroke': '#000000',
                'strokeWidth': 2,
                'draggable': True,
                'selected': False,
                'layer': 1,
                'customProperties': {},
                'number': f'H{i + 1:03d}',
                'status': 'available',
                'dimensions': {
                    'imperial': f'{int(booth["w"]/10)}\' x {int(booth["h"]/10)}\'',
                    'metric': f'{booth["w"]/40:.1f}m x {booth["h"]/40:.1f}m'
                }
            }
            hall_booths.append(hall_booth)
        
        return {
            'booths': hall_booths,
            'imageWidth': w,
            'imageHeight': h,
            'detection_count': len(hall_booths)
        }
        
    except Exception as e:
        print(f"Error detecting booths in hall: {e}")
        return {'booths': [], 'imageWidth': 0, 'imageHeight': 0}

@hierarchical_bp.route('/public/area-plans', methods=['GET'])
def get_public_area_plans():
    """Get published area floor plans for public viewing"""
    try:
        db = get_db()
        
        # Only published area plans
        area_plans = list(db.area_floorplans.find({'status': 'published'}).sort('created_at', -1))
        
        for plan in area_plans:
            plan['id'] = str(plan['_id'])
            plan.pop('_id', None)
            # Remove sensitive data
            plan.pop('created_by', None)
        
        return jsonify({
            'success': True,
            'area_plans': area_plans
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get public area plans', 'error': str(e)}), 500

@hierarchical_bp.route('/public/hall-plans/<hall_id>', methods=['GET'])
def get_public_hall_plans(hall_id):
    """Get published hall floor plans for public viewing"""
    try:
        db = get_db()
        
        # Only published hall plans for this hall
        hall_plans = list(db.hall_floorplans.find({
            'hall_id': hall_id,
            'status': 'published'
        }).sort('created_at', -1))
        
        for plan in hall_plans:
            plan['id'] = str(plan['_id'])
            plan.pop('_id', None)
            # Remove sensitive data
            plan.pop('created_by', None)
        
        return jsonify({
            'success': True,
            'hall_plans': hall_plans
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get public hall plans', 'error': str(e)}), 500
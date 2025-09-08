from flask import Flask, jsonify, request, send_from_directory
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from pymongo import MongoClient
import os
import uuid
import cv2
from datetime import datetime
from PIL import Image

# Import configuration and routes
from config import Config
from routes.auth_routes import auth_bp
from routes.floorplan_routes import floorplan_bp
from routes.dashboard_routes import dashboard_bp
from routes.area_map_routes import area_map_bp
from routes.public_routes import public_bp
from detection import detect_rects_by_color, detect_walls_by_lines, draw_overlay
from detection_hierarchy import detect_rects_with_hierarchy, build_groups, draw_overlay_with_hierarchy
from detection_subsections import detect_with_subsections
from subsection_manager import detect_blue_divisions_in_booth, create_subsection_ids

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    jwt = JWTManager(app)
    CORS(app, origins=Config.CORS_ORIGINS)
    
    # Upload directory
    UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads')
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Test MongoDB connection
    try:
        client = MongoClient(Config.MONGODB_URI)
        db = client.get_default_database()
        # Test connection
        db.command('ping')
        print("✅ MongoDB connection successful")
        
        # Create indexes for better performance
        db.users.create_index([("username", 1)], unique=True)
        db.users.create_index([("email", 1)], unique=True)
        db.floorplans.create_index([("name", 1)])
        db.floorplans.create_index([("user_id", 1)])
        db.floorplans.create_index([("event_id", 1)])
        db.floorplans.create_index([("last_modified", -1)])
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return None
    
    # Register API blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(floorplan_bp, url_prefix='/api')
    app.register_blueprint(area_map_bp, url_prefix='/api')
    app.register_blueprint(public_bp, url_prefix='/api/public')
    
    # Register dashboard blueprint
    app.register_blueprint(dashboard_bp, url_prefix='/dashboard')
    
    # Detection endpoints
    @app.route('/detect-from-upload', methods=['POST'])
    def detect_from_upload():
        try:
            data = request.get_json()
            if not data or 'filename' not in data:
                return jsonify({'message': 'Filename is required'}), 400
            
            filename = data['filename']
            file_path = os.path.join(UPLOAD_DIR, filename)
            
            # Validate file exists
            if not os.path.exists(file_path):
                return jsonify({'message': 'File not found'}), 400
            
            # Get image dimensions
            try:
                with Image.open(file_path) as img:
                    image_width, image_height = img.size
            except Exception:
                return jsonify({'message': 'Invalid image file'}), 400
            
            # Run detection
            try:
                rects = detect_rects_by_color(file_path, min_area=1500)
                walls = detect_walls_by_lines(file_path)
                
                # Generate overlay
                overlay_filename = f"{uuid.uuid4()}_overlay.png"
                overlay_path = os.path.join(UPLOAD_DIR, overlay_filename)
                draw_overlay(file_path, rects, walls, overlay_path)
                
                return jsonify({
                    'rects': rects,
                    'walls': walls,
                    'imageWidth': image_width,
                    'imageHeight': image_height,
                    'overlay': f'/uploads/{overlay_filename}',
                    'filename': filename
                }), 200
                
            except Exception as e:
                print(f"Detection error: {e}")
                # Return empty results on detection error
                return jsonify({
                    'rects': [],
                    'walls': [],
                    'imageWidth': image_width,
                    'imageHeight': image_height,
                    'overlay': None,
                    'filename': filename,
                    'message': 'Detection failed, but image uploaded successfully'
                }), 200
                
        except Exception as e:
            return jsonify({'message': 'Server error', 'error': str(e)}), 500
    
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(UPLOAD_DIR, filename)
    
    @app.route('/upload', methods=['POST'])
    def upload_file():
        try:
            if 'file' not in request.files:
                return jsonify({'message': 'No file provided'}), 400
            
            file = request.files['file']
            if file.filename == '':
                return jsonify({'message': 'No file selected'}), 400
            
            # Generate unique filename
            file_ext = os.path.splitext(file.filename)[1]
            filename = f"{uuid.uuid4()}{file_ext}"
            file_path = os.path.join(UPLOAD_DIR, filename)
            
            # Save file
            file.save(file_path)
            
            return jsonify({
                'filename': filename,
                'url': f'/uploads/{filename}'
            }), 200
            
        except Exception as e:
            return jsonify({'message': 'Upload failed', 'error': str(e)}), 500
    
    @app.route('/detect-hierarchy-from-upload', methods=['POST'])
    def detect_hierarchy_from_upload():
        try:
            data = request.get_json()
            if not data or 'filename' not in data:
                return jsonify({'error': 'filename is required'}), 400
            
            filename = data['filename']
            file_path = os.path.join(UPLOAD_DIR, filename)
            
            if not os.path.exists(file_path):
                return jsonify({'error': 'file not found'}), 400
            
            # Get image dimensions
            image = cv2.imread(file_path)
            if image is None:
                return jsonify({'error': 'invalid image file'}), 400
            
            h, w = image.shape[:2]
            
            # Run hierarchy detection
            rects = detect_rects_with_hierarchy(file_path, min_area=400)
            groups = build_groups(rects)
            
            if not rects:
                return jsonify({
                    'rects': [],
                    'groups': {},
                    'imageWidth': w,
                    'imageHeight': h,
                    'overlay': None,
                    'filename': filename,
                    'message': 'No booth hierarchies detected'
                }), 200
            
            # Generate overlay
            overlay_name = f"{uuid.uuid4().hex}_hier_overlay.png"
            overlay_path = os.path.join(UPLOAD_DIR, overlay_name)
            
            if draw_overlay_with_hierarchy(file_path, rects, overlay_path):
                overlay_url = f"/uploads/{overlay_name}"
            else:
                overlay_url = None
            
            return jsonify({
                'rects': rects,
                'groups': groups,
                'imageWidth': w,
                'imageHeight': h,
                'overlay': overlay_url,
                'filename': filename
            }), 200
            
        except Exception as e:
            return jsonify({'message': 'Server error', 'error': str(e)}), 500
    
    @app.route('/detect-subsections', methods=['POST'])
    def detect_subsections():
        try:
            data = request.get_json()
            if not data or 'filename' not in data:
                return jsonify({'error': 'filename is required'}), 400
            
            filename = data['filename']
            file_path = os.path.join(UPLOAD_DIR, filename)
            
            if not os.path.exists(file_path):
                return jsonify({'error': 'file not found'}), 400
            
            # Run subsection detection
            result = detect_with_subsections(file_path)
            
            # Get image dimensions
            image = cv2.imread(file_path)
            h, w = image.shape[:2]
            
            return jsonify({
                'walls': result['walls'],
                'booths': result['booths'],
                'imageWidth': w,
                'imageHeight': h,
                'filename': filename
            }), 200
            
        except Exception as e:
            return jsonify({'error': 'Server error', 'details': str(e)}), 500
    
    @app.route('/detect-booth-subsections', methods=['POST'])
    def detect_booth_subsections():
        try:
            data = request.get_json()
            filename = data.get('filename')
            booth_bounds = data.get('boothBounds')  # {x, y, width, height}
            parent_booth_id = data.get('parentBoothId')
            
            if not all([filename, booth_bounds, parent_booth_id]):
                return jsonify({'error': 'Missing required fields'}), 400
            
            file_path = os.path.join(UPLOAD_DIR, filename)
            if not os.path.exists(file_path):
                return jsonify({'error': 'File not found'}), 400
            
            # Detect subsections
            subsections = detect_blue_divisions_in_booth(file_path, booth_bounds)
            
            if not subsections:
                return jsonify({'subsections': [], 'message': 'No divisions detected'}), 200
            
            # Generate subsection IDs
            subsection_ids = create_subsection_ids(parent_booth_id, len(subsections))
            
            # Combine coordinates with IDs
            result_subsections = []
            for i, subsection in enumerate(subsections):
                result_subsections.append({
                    'id': subsection_ids[i],
                    'parentId': parent_booth_id,
                    'x': subsection['x'],
                    'y': subsection['y'],
                    'width': subsection['width'],
                    'height': subsection['height']
                })
            
            return jsonify({'subsections': result_subsections}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/save-subsections', methods=['POST'])
    def save_subsections():
        try:
            data = request.get_json()
            # In a real app, save to database
            # For now, just return success
            return jsonify({'message': 'Subsections saved successfully'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/get-subsections/<booth_id>', methods=['GET'])
    def get_subsections(booth_id):
        try:
            # In a real app, fetch from database
            # For now, return empty array
            return jsonify({'subsections': []}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/save-layout', methods=['POST'])
    def save_layout():
        # Placeholder endpoint for saving layout
        data = request.get_json()
        return jsonify({'message': 'Layout saved successfully'}), 200
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        try:
            # Test database connection
            client = MongoClient(Config.MONGODB_URI)
            db = client.get_default_database()
            db.command('ping')
            
            return jsonify({
                'status': 'healthy',
                'timestamp': datetime.utcnow().isoformat(),
                'database': 'connected',
                'version': '1.0.0'
            }), 200
        except Exception as e:
            return jsonify({
                'status': 'unhealthy',
                'timestamp': datetime.utcnow().isoformat(),
                'database': 'disconnected',
                'error': str(e)
            }), 500
    
    # Root endpoint
    @app.route('/')
    def root():
        return jsonify({
            'message': 'IMTMA Flooring Backend API',
            'version': '1.0.0',
            'endpoints': {
                'auth': '/api/auth',
                'floorplans': '/api/floorplans',
                'dashboard': '/dashboard',
                'health': '/health'
            }
        })
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'message': 'Endpoint not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'message': 'Internal server error'}), 500
    
    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'message': 'Token has expired'}), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'message': 'Invalid token'}), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'message': 'Authorization token is required'}), 401
    
    return app

if __name__ == '__main__':
    app = create_app()
    if app:
        print("🚀 Starting IMTMA Flooring Backend...")
        print(f"📊 Dashboard available at: http://localhost:5000/dashboard")
        print(f"🔗 API available at: http://localhost:5000/api")
        print(f"💚 Health check: http://localhost:5000/health")
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        print("❌ Failed to start application - check MongoDB connection")
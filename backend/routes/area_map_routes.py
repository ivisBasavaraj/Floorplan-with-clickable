from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime
from auth import admin_required

area_map_bp = Blueprint('area_map', __name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@area_map_bp.route('/area-maps/upload', methods=['POST'])
@admin_required
def upload_area_map():
    """Upload a new area map image"""
    try:
        if 'file' not in request.files:
            return jsonify({'message': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'message': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'message': 'Invalid file type. Allowed: png, jpg, jpeg, gif, bmp, webp'}), 400
        
        # Generate unique filename
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        unique_filename = f"{uuid.uuid4().hex}_{name}{ext}"
        
        # Ensure upload directory exists
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        # Save file
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(file_path)
        
        # Return file info
        return jsonify({
            'success': True,
            'url': f'/uploads/{unique_filename}',
            'filename': unique_filename,
            'original_name': filename,
            'uploaded_at': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Upload failed', 'error': str(e)}), 500

@area_map_bp.route('/area-maps', methods=['GET'])
@jwt_required()
def get_area_maps():
    """Get list of available area maps"""
    try:
        # In a real implementation, this would query a database
        # For now, return a simple list of uploaded files
        area_maps = []
        
        if os.path.exists(UPLOAD_FOLDER):
            for filename in os.listdir(UPLOAD_FOLDER):
                if allowed_file(filename):
                    file_path = os.path.join(UPLOAD_FOLDER, filename)
                    stat = os.stat(file_path)
                    
                    area_maps.append({
                        'id': filename,
                        'name': filename.replace('_', ' ').rsplit('.', 1)[0],
                        'url': f'/uploads/{filename}',
                        'created': datetime.fromtimestamp(stat.st_ctime).isoformat(),
                        'size': stat.st_size
                    })
        
        return jsonify({
            'success': True,
            'area_maps': sorted(area_maps, key=lambda x: x['created'], reverse=True)
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get area maps', 'error': str(e)}), 500

@area_map_bp.route('/area-maps/<filename>', methods=['DELETE'])
@admin_required
def delete_area_map(filename):
    """Delete an area map"""
    try:
        # Validate filename
        if not allowed_file(filename):
            return jsonify({'message': 'Invalid filename'}), 400
        
        file_path = os.path.join(UPLOAD_FOLDER, secure_filename(filename))
        
        if not os.path.exists(file_path):
            return jsonify({'message': 'File not found'}), 404
        
        # Delete file
        os.remove(file_path)
        
        return jsonify({
            'success': True,
            'message': 'Area map deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to delete area map', 'error': str(e)}), 500

# Serve uploaded files
@area_map_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded area map files"""
    return send_from_directory(UPLOAD_FOLDER, filename)
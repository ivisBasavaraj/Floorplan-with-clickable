from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from pymongo import MongoClient
from bson import ObjectId
import os

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            
            # Get MongoDB connection
            client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/imtma_flooring'))
            db = client.get_default_database()
            
            user = db.users.find_one({'_id': ObjectId(current_user_id)})
            if not user or user.get('role') != 'admin':
                return jsonify({'message': 'Admin access required'}), 403
                
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'message': 'Authentication failed', 'error': str(e)}), 401
    
    return decorated_function

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'message': 'Authentication required', 'error': str(e)}), 401
    
    return decorated_function

def get_current_user():
    """Get current user data from JWT token"""
    try:
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        
        # Get MongoDB connection
        client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/imtma_flooring'))
        db = client.get_default_database()
        
        user = db.users.find_one({'_id': ObjectId(current_user_id)})
        if user:
            user['_id'] = str(user['_id'])
            user.pop('password_hash', None)  # Remove sensitive data
            return user
        return None
    except:
        return None
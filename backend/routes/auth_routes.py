from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
from models import User

auth_bp = Blueprint('auth', __name__)

# Get MongoDB connection
def get_db():
    client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/imtma_flooring'))
    return client.get_default_database()

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ('username', 'email', 'password')):
            return jsonify({'message': 'Username, email, and password are required'}), 400
        
        db = get_db()
        
        # Check if user already exists
        if db.users.find_one({'$or': [{'email': data['email']}, {'username': data['username']}]}):
            return jsonify({'message': 'User with this email or username already exists'}), 400
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            role=data.get('role', 'user')
        )
        
        # Insert user into database
        result = db.users.insert_one({
            'username': user.username,
            'email': user.email,
            'password_hash': user.password_hash,
            'role': user.role,
            'created_at': user.created_at,
            'last_login': user.last_login
        })
        
        # Create access token
        access_token = create_access_token(identity=str(result.inserted_id))
        
        return jsonify({
            'message': 'User created successfully',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Registration failed', 'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ('username', 'password')):
            return jsonify({'message': 'Username and password are required'}), 400
        
        db = get_db()
        
        # Find user by username or email
        user_doc = db.users.find_one({
            '$or': [
                {'username': data['username']},
                {'email': data['username']}
            ]
        })
        
        if not user_doc:
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Create User object to check password
        user = User.__new__(User)
        user.password_hash = user_doc['password_hash']
        
        if not user.check_password(data['password']):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Update last login
        db.users.update_one(
            {'_id': user_doc['_id']},
            {'$set': {'last_login': datetime.utcnow()}}
        )
        
        # Create access token
        access_token = create_access_token(identity=str(user_doc['_id']))
        
        # Prepare user data (without sensitive info)
        user_data = {
            'id': str(user_doc['_id']),
            'username': user_doc['username'],
            'email': user_doc['email'],
            'role': user_doc['role'],
            'created_at': user_doc['created_at']
        }
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': user_data
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Login failed', 'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        current_user_id = get_jwt_identity()
        db = get_db()
        
        user_doc = db.users.find_one({'_id': ObjectId(current_user_id)})
        if not user_doc:
            return jsonify({'message': 'User not found'}), 404
        
        user_data = {
            'id': str(user_doc['_id']),
            'username': user_doc['username'],
            'email': user_doc['email'],
            'role': user_doc['role'],
            'created_at': user_doc['created_at'],
            'last_login': user_doc.get('last_login')
        }
        
        return jsonify({'user': user_data}), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get profile', 'error': str(e)}), 500

@auth_bp.route('/verify', methods=['GET'])
@jwt_required()
def verify_token():
    try:
        current_user_id = get_jwt_identity()
        return jsonify({
            'valid': True,
            'user_id': current_user_id
        }), 200
    except Exception as e:
        return jsonify({'valid': False, 'error': str(e)}), 401
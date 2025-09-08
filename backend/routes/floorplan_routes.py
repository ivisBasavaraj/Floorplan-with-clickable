from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
from models import FloorPlan, FloorPlanStats
from auth import login_required, admin_required

floorplan_bp = Blueprint('floorplan', __name__)

# Get MongoDB connection
def get_db():
    client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/imtma_flooring'))
    return client.get_default_database()

@floorplan_bp.route('/floorplans', methods=['GET'])
@login_required
def get_floorplans():
    try:
        db = get_db()
        current_user_id = get_jwt_identity()
        
        # Get query parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        search = request.args.get('search', '')
        event_id = request.args.get('event_id')
        
        # Build query
        query = {}
        if search:
            query['$or'] = [
                {'name': {'$regex': search, '$options': 'i'}},
                {'description': {'$regex': search, '$options': 'i'}}
            ]
        if event_id:
            query['event_id'] = event_id
        
        # Get user role to determine access
        user = db.users.find_one({'_id': ObjectId(current_user_id)})
        if user.get('role') != 'admin':
            # Regular users can only see published/active floorplans
            query['status'] = {'$in': ['active', 'published']}
        
        # Calculate skip
        skip = (page - 1) * limit
        
        # Get floor plans
        cursor = db.floorplans.find(query).sort('last_modified', -1).skip(skip).limit(limit)
        floorplans = []
        
        for fp in cursor:
            fp_data = {
                'id': str(fp['_id']),
                'name': fp['name'],
                'description': fp.get('description'),
                'created': fp['created'],
                'last_modified': fp['last_modified'],
                'version': fp['version'],
                'event_id': fp.get('event_id'),
                'floor': fp.get('floor', 1),
                'layer': fp.get('layer', 0),
                'user_id': fp.get('user_id'),
                'status': fp.get('status', 'draft')
            }
            
            # Add booth statistics
            stats = FloorPlanStats.calculate_booth_stats(fp)
            fp_data['stats'] = stats
            
            floorplans.append(fp_data)
        
        # Get total count for pagination
        total = db.floorplans.count_documents(query)
        
        return jsonify({
            'floorplans': floorplans,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get floor plans', 'error': str(e)}), 500

@floorplan_bp.route('/floorplans', methods=['POST'])
@admin_required
def create_floorplan():
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        if not data or 'name' not in data:
            return jsonify({'message': 'Floor plan name is required'}), 400
        
        db = get_db()
        
        # Create new floor plan
        floorplan = FloorPlan(
            name=data['name'],
            description=data.get('description'),
            event_id=data.get('event_id'),
            floor=data.get('floor', 1),
            layer=data.get('layer', 0),
            state=data.get('state'),
            user_id=current_user_id,
            status=data.get('status', 'draft')
        )
        
        # Insert into database
        result = db.floorplans.insert_one({
            'name': floorplan.name,
            'description': floorplan.description,
            'created': floorplan.created,
            'last_modified': floorplan.last_modified,
            'state': floorplan.state,
            'version': floorplan.version,
            'event_id': floorplan.event_id,
            'floor': floorplan.floor,
            'layer': floorplan.layer,
            'user_id': floorplan.user_id,
            'status': floorplan.status
        })
        
        # Return created floor plan
        fp_data = floorplan.to_dict()
        fp_data['id'] = str(result.inserted_id)
        
        return jsonify({
            'message': 'Floor plan created successfully',
            'floorplan': fp_data
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Failed to create floor plan', 'error': str(e)}), 500

@floorplan_bp.route('/floorplans/<floorplan_id>', methods=['GET'])
@login_required
def get_floorplan(floorplan_id):
    try:
        db = get_db()
        current_user_id = get_jwt_identity()
        
        # Get floor plan
        floorplan = db.floorplans.find_one({'_id': ObjectId(floorplan_id)})
        if not floorplan:
            return jsonify({'message': 'Floor plan not found'}), 404
        
        # Check access permissions
        user = db.users.find_one({'_id': ObjectId(current_user_id)})
        if user.get('role') != 'admin':
            # Regular users can only view published/active floor plans
            if floorplan.get('status') not in ['active', 'published']:
                return jsonify({'message': 'Access denied'}), 403
        
        # Prepare response data
        fp_data = {
            'id': str(floorplan['_id']),
            'name': floorplan['name'],
            'description': floorplan.get('description'),
            'created': floorplan['created'],
            'last_modified': floorplan['last_modified'],
            'state': floorplan['state'],
            'version': floorplan['version'],
            'event_id': floorplan.get('event_id'),
            'floor': floorplan.get('floor', 1),
            'layer': floorplan.get('layer', 0),
            'user_id': floorplan.get('user_id'),
            'status': floorplan.get('status', 'draft')
        }
        
        # Add detailed booth information
        booth_details = FloorPlanStats.get_booth_details(floorplan)
        fp_data['booth_details'] = booth_details
        
        # Add statistics
        stats = FloorPlanStats.calculate_booth_stats(floorplan)
        fp_data['stats'] = stats
        
        return jsonify({'floorplan': fp_data}), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get floor plan', 'error': str(e)}), 500

@floorplan_bp.route('/floorplans/<floorplan_id>', methods=['PUT'])
@login_required
def update_floorplan(floorplan_id):
    try:
        data = request.get_json()
        db = get_db()
        current_user_id = get_jwt_identity()
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        # Get existing floor plan
        floorplan = db.floorplans.find_one({'_id': ObjectId(floorplan_id)})
        if not floorplan:
            return jsonify({'message': 'Floor plan not found'}), 404
        
        # Check access permissions
        user = db.users.find_one({'_id': ObjectId(current_user_id)})
        if user.get('role') != 'admin' and floorplan.get('user_id') != current_user_id:
            return jsonify({'message': 'Access denied'}), 403
        
        # Update fields
        update_data = {
            'last_modified': datetime.utcnow(),
            'version': floorplan['version'] + 1
        }
        
        if 'name' in data:
            update_data['name'] = data['name']
        if 'description' in data:
            update_data['description'] = data['description']
        if 'state' in data:
            update_data['state'] = data['state']
        if 'event_id' in data:
            update_data['event_id'] = data['event_id']
        if 'floor' in data:
            update_data['floor'] = data['floor']
        if 'layer' in data:
            update_data['layer'] = data['layer']
        if 'status' in data:
            update_data['status'] = data['status']
        
        # Update in database
        db.floorplans.update_one(
            {'_id': ObjectId(floorplan_id)},
            {'$set': update_data}
        )
        
        # Get updated floor plan
        updated_floorplan = db.floorplans.find_one({'_id': ObjectId(floorplan_id)})
        
        fp_data = {
            'id': str(updated_floorplan['_id']),
            'name': updated_floorplan['name'],
            'description': updated_floorplan.get('description'),
            'created': updated_floorplan['created'],
            'last_modified': updated_floorplan['last_modified'],
            'state': updated_floorplan['state'],
            'version': updated_floorplan['version'],
            'event_id': updated_floorplan.get('event_id'),
            'floor': updated_floorplan.get('floor', 1),
            'layer': updated_floorplan.get('layer', 0),
            'user_id': updated_floorplan.get('user_id'),
            'status': updated_floorplan.get('status', 'draft')
        }
        
        return jsonify({
            'message': 'Floor plan updated successfully',
            'floorplan': fp_data
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to update floor plan', 'error': str(e)}), 500

@floorplan_bp.route('/floorplans/<floorplan_id>', methods=['DELETE'])
@login_required
def delete_floorplan(floorplan_id):
    try:
        db = get_db()
        current_user_id = get_jwt_identity()
        
        # Get floor plan
        floorplan = db.floorplans.find_one({'_id': ObjectId(floorplan_id)})
        if not floorplan:
            return jsonify({'message': 'Floor plan not found'}), 404
        
        # Check access permissions
        user = db.users.find_one({'_id': ObjectId(current_user_id)})
        if user.get('role') != 'admin' and floorplan.get('user_id') != current_user_id:
            return jsonify({'message': 'Access denied'}), 403
        
        # Delete floor plan
        db.floorplans.delete_one({'_id': ObjectId(floorplan_id)})
        
        return jsonify({'message': 'Floor plan deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to delete floor plan', 'error': str(e)}), 500

@floorplan_bp.route('/floorplans/<floorplan_id>/status', methods=['PUT'])
@login_required
def update_floorplan_status(floorplan_id):
    try:
        data = request.get_json()
        db = get_db()
        current_user_id = get_jwt_identity()
        
        if not data or 'status' not in data:
            return jsonify({'message': 'Status is required'}), 400
        
        new_status = data['status']
        if new_status not in ['draft', 'active', 'published', 'archived']:
            return jsonify({'message': 'Invalid status. Must be one of: draft, active, published, archived'}), 400
        
        # Get existing floor plan
        floorplan = db.floorplans.find_one({'_id': ObjectId(floorplan_id)})
        if not floorplan:
            return jsonify({'message': 'Floor plan not found'}), 404
        
        # Check access permissions
        user = db.users.find_one({'_id': ObjectId(current_user_id)})
        if user.get('role') != 'admin' and floorplan.get('user_id') != current_user_id:
            return jsonify({'message': 'Access denied'}), 403
        
        # Update status
        update_data = {
            'status': new_status,
            'last_modified': datetime.utcnow(),
            'version': floorplan['version'] + 1
        }
        
        db.floorplans.update_one(
            {'_id': ObjectId(floorplan_id)},
            {'$set': update_data}
        )
        
        return jsonify({
            'message': f'Floor plan status updated to {new_status}',
            'status': new_status
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to update floor plan status', 'error': str(e)}), 500

@floorplan_bp.route('/floorplans/<floorplan_id>/booths', methods=['GET'])
@login_required
def get_floorplan_booths(floorplan_id):
    try:
        db = get_db()
        current_user_id = get_jwt_identity()
        
        # Get floor plan
        floorplan = db.floorplans.find_one({'_id': ObjectId(floorplan_id)})
        if not floorplan:
            return jsonify({'message': 'Floor plan not found'}), 404
        
        # Check access permissions
        user = db.users.find_one({'_id': ObjectId(current_user_id)})
        if user.get('role') != 'admin' and floorplan.get('user_id') != current_user_id:
            return jsonify({'message': 'Access denied'}), 403
        
        # Get booth details
        booth_details = FloorPlanStats.get_booth_details(floorplan)
        stats = FloorPlanStats.calculate_booth_stats(floorplan)
        
        return jsonify({
            'booths': booth_details,
            'stats': stats
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get booth details', 'error': str(e)}), 500

@floorplan_bp.route('/public/floorplans', methods=['GET'])
def get_public_floorplans():
    """Get published floor plans for public viewing (no authentication required)"""
    try:
        db = get_db()
        
        # Get query parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        search = request.args.get('search', '')
        event_id = request.args.get('event_id')
        
        # Build query - only published floor plans
        query = {'status': 'published'}
        if search:
            query['$and'] = [
                {'status': 'published'},
                {'$or': [
                    {'name': {'$regex': search, '$options': 'i'}},
                    {'description': {'$regex': search, '$options': 'i'}}
                ]}
            ]
        if event_id:
            if '$and' in query:
                query['$and'].append({'event_id': event_id})
            else:
                query['event_id'] = event_id
        
        # Calculate skip
        skip = (page - 1) * limit
        
        # Get floor plans
        cursor = db.floorplans.find(query).sort('last_modified', -1).skip(skip).limit(limit)
        floorplans = []
        
        for fp in cursor:
            fp_data = {
                'id': str(fp['_id']),
                'name': fp['name'],
                'description': fp.get('description'),
                'created': fp['created'],
                'last_modified': fp['last_modified'],
                'version': fp['version'],
                'event_id': fp.get('event_id'),
                'floor': fp.get('floor', 1),
                'layer': fp.get('layer', 0),
                'status': fp.get('status', 'draft')
            }
            
            # Add booth statistics
            stats = FloorPlanStats.calculate_booth_stats(fp)
            fp_data['stats'] = stats
            
            floorplans.append(fp_data)
        
        # Get total count for pagination
        total = db.floorplans.count_documents(query)
        
        return jsonify({
            'floorplans': floorplans,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get public floor plans', 'error': str(e)}), 500

@floorplan_bp.route('/public/floorplans/<floorplan_id>', methods=['GET'])
def get_public_floorplan(floorplan_id):
    """Get a specific published floor plan for public viewing (no authentication required)"""
    try:
        db = get_db()
        
        # Get floor plan - only if published
        floorplan = db.floorplans.find_one({
            '_id': ObjectId(floorplan_id),
            'status': 'published'
        })
        if not floorplan:
            return jsonify({'message': 'Floor plan not found or not published'}), 404
        
        # Prepare response data
        fp_data = {
            'id': str(floorplan['_id']),
            'name': floorplan['name'],
            'description': floorplan.get('description'),
            'created': floorplan['created'],
            'last_modified': floorplan['last_modified'],
            'state': floorplan['state'],
            'version': floorplan['version'],
            'event_id': floorplan.get('event_id'),
            'floor': floorplan.get('floor', 1),
            'layer': floorplan.get('layer', 0),
            'status': floorplan.get('status', 'draft')
        }
        
        # Add detailed booth information
        booth_details = FloorPlanStats.get_booth_details(floorplan)
        fp_data['booth_details'] = booth_details
        
        # Add statistics
        stats = FloorPlanStats.calculate_booth_stats(floorplan)
        fp_data['stats'] = stats
        
        return jsonify({'floorplan': fp_data}), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get public floor plan', 'error': str(e)}), 500
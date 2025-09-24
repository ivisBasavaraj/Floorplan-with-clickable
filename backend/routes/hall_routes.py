from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import cross_origin
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os

hall_bp = Blueprint('hall', __name__)

# Get MongoDB connection (mirrors floorplan_routes.get_db)
def get_db():
    client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/imtma_flooring'))
    return client.get_default_database()

# Hall document shape:
# {
#   _id: ObjectId,
#   name: str,
#   color: str,
#   polygon: [[lat, lng], ...],
#   event_id: str | null,
#   floorplan_ids: [ObjectId, ...],
#   created: datetime,
#   last_modified: datetime,
#   public: bool
# }

@hall_bp.route('/halls', methods=['POST'])
@jwt_required()
def create_hall():
    try:
        db = get_db()
        data = request.get_json() or {}
        name = data.get('name')
        polygon = data.get('polygon')
        if not name or not polygon:
            return jsonify({'message': 'name and polygon are required'}), 400

        hall_doc = {
            'name': name,
            'color': data.get('color') or '#1d4ed8',
            'polygon': polygon,
            'event_id': data.get('event_id'),
            'floorplan_ids': [ObjectId(fp) for fp in data.get('floorplan_ids', []) if ObjectId.is_valid(fp)],
            'created': datetime.utcnow(),
            'last_modified': datetime.utcnow(),
            'public': bool(data.get('public', True)),
        }
        result = db.halls.insert_one(hall_doc)
        hall_doc['id'] = str(result.inserted_id)
        hall_doc.pop('_id', None)
        return jsonify({'message': 'Hall created', 'hall': hall_doc}), 201
    except Exception as e:
        return jsonify({'message': 'Failed to create hall', 'error': str(e)}), 500

@hall_bp.route('/halls', methods=['GET'])
@jwt_required()
def list_halls_admin():
    try:
        db = get_db()
        event_id = request.args.get('event_id')
        query = {}
        if event_id:
            query['event_id'] = event_id
        halls = []
        for h in db.halls.find(query).sort('last_modified', -1):
            halls.append({
                'id': str(h['_id']),
                'name': h.get('name'),
                'color': h.get('color'),
                'polygon': h.get('polygon', []),
                'event_id': h.get('event_id'),
                'public': h.get('public', True),
                'floorplan_ids': [str(fid) for fid in h.get('floorplan_ids', [])],
                'created': h.get('created'),
                'last_modified': h.get('last_modified'),
            })
        return jsonify({'halls': halls}), 200
    except Exception as e:
        return jsonify({'message': 'Failed to list halls', 'error': str(e)}), 500

@hall_bp.route('/halls/<hall_id>', methods=['PUT'])
@jwt_required()
def update_hall(hall_id):
    try:
        db = get_db()
        data = request.get_json() or {}
        update = {'last_modified': datetime.utcnow()}
        if 'name' in data:
            update['name'] = data['name']
        if 'color' in data:
            update['color'] = data['color']
        if 'polygon' in data:
            update['polygon'] = data['polygon']
        if 'event_id' in data:
            update['event_id'] = data['event_id']
        if 'public' in data:
            update['public'] = bool(data['public'])
        if 'floorplan_ids' in data:
            update['floorplan_ids'] = [ObjectId(fp) for fp in data.get('floorplan_ids', []) if ObjectId.is_valid(fp)]
        db.halls.update_one({'_id': ObjectId(hall_id)}, {'$set': update})
        return jsonify({'message': 'Hall updated'}), 200
    except Exception as e:
        return jsonify({'message': 'Failed to update hall', 'error': str(e)}), 500

# Public endpoints
@hall_bp.route('/public/halls', methods=['GET'])
@cross_origin()
def list_public_halls():
    try:
        db = get_db()
        event_id = request.args.get('event_id')
        query = {'public': True}
        if event_id:
            query['event_id'] = event_id
        halls = []
        for h in db.halls.find(query).sort('last_modified', -1):
            # Optionally compute count of published/active plans
            published_count = 0
            fp_ids = h.get('floorplan_ids', [])
            if fp_ids:
                published_count = db.floorplans.count_documents({
                    '_id': {'$in': fp_ids},
                    'status': {'$in': ['active', 'published']}
                })
            halls.append({
                'id': str(h['_id']),
                'name': h.get('name'),
                'color': h.get('color'),
                'polygon': h.get('polygon', []),
                'event_id': h.get('event_id'),
                'plans': published_count,
            })
        return jsonify({'success': True, 'halls': halls}), 200
    except Exception as e:
        return jsonify({'message': 'Failed to list public halls', 'error': str(e)}), 500

@hall_bp.route('/public/halls/<hall_id>/floorplans', methods=['GET'])
@cross_origin()
def list_public_hall_floorplans(hall_id):
    try:
        db = get_db()
        hall = db.halls.find_one({'_id': ObjectId(hall_id)})
        if not hall or not hall.get('public', True):
            return jsonify({'message': 'Hall not found'}), 404
        fp_ids = hall.get('floorplan_ids', [])
        floorplans = []
        if fp_ids:
            cursor = db.floorplans.find({
                '_id': {'$in': fp_ids},
                'status': {'$in': ['active', 'published']}
            }).sort('last_modified', -1)
            for fp in cursor:
                floorplans.append({
                    'id': str(fp['_id']),
                    'name': fp.get('name'),
                    'description': fp.get('description'),
                    'status': fp.get('status', 'draft'),
                    'last_modified': fp.get('last_modified'),
                })
        return jsonify({'success': True, 'floorplans': floorplans}), 200
    except Exception as e:
        return jsonify({'message': 'Failed to list hall floorplans', 'error': str(e)}), 500
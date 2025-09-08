from flask import Blueprint, jsonify
from flask_cors import cross_origin

public_bp = Blueprint('public', __name__)

@public_bp.route('/companies', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_public_companies():
    """Get public companies data"""
    try:
        # Return empty response for now
        return jsonify({
            'success': True,
            'data': {
                'companies': []
            }
        }), 200
    except Exception as e:
        return jsonify({'message': 'Failed to get companies', 'error': str(e)}), 500

@public_bp.route('/sponsors', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_public_sponsors():
    """Get public sponsors data"""
    try:
        # Return empty response for now
        return jsonify({
            'success': True,
            'data': {
                'sponsors': []
            }
        }), 200
    except Exception as e:
        return jsonify({'message': 'Failed to get sponsors', 'error': str(e)}), 500
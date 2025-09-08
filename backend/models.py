from datetime import datetime
from typing import Dict, List, Optional, Any
from bson import ObjectId
import bcrypt

class User:
    def __init__(self, username: str, email: str, password: str, role: str = 'user'):
        self.username = username
        self.email = email
        self.password_hash = self._hash_password(password)
        self.role = role
        self.created_at = datetime.utcnow()
        self.last_login = None
    
    def _hash_password(self, password: str) -> str:
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, password: str) -> bool:
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self) -> Dict:
        return {
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at,
            'last_login': self.last_login
        }

class FloorPlan:
    def __init__(self, name: str, description: str = None, event_id: str = None, 
                 floor: int = 1, layer: int = 0, state: Dict = None, user_id: str = None,
                 status: str = 'draft'):
        self.name = name
        self.description = description
        self.created = datetime.utcnow()
        self.last_modified = datetime.utcnow()
        self.state = state or self._default_state()
        self.version = 1
        self.event_id = event_id
        self.floor = floor
        self.layer = layer
        self.user_id = user_id  # Track who created the floor plan
        self.status = status  # Status: 'draft', 'active', 'published', 'archived'
    
    def _default_state(self) -> Dict:
        return {
            'elements': [],
            'selectedIds': [],
            'activeTool': 'select',
            'history': {
                'past': [],
                'future': []
            },
            'grid': {
                'enabled': True,
                'size': 20,
                'snap': True,
                'opacity': 0.3
            },
            'zoom': 1,
            'offset': {'x': 0, 'y': 0},
            'canvasSize': {'width': 1200, 'height': 800},
            'viewerMode': 'editor',
            'miniMapEnabled': False
        }
    
    def to_dict(self) -> Dict:
        return {
            'name': self.name,
            'description': self.description,
            'created': self.created,
            'last_modified': self.last_modified,
            'state': self.state,
            'version': self.version,
            'event_id': self.event_id,
            'floor': self.floor,
            'layer': self.layer,
            'user_id': self.user_id,
            'status': self.status
        }
    
    def update_state(self, new_state: Dict):
        self.state = new_state
        self.last_modified = datetime.utcnow()
        self.version += 1

class FloorPlanStats:
    """Helper class to calculate statistics from floor plan data"""
    
    @staticmethod
    def calculate_booth_stats(floor_plan_data: Dict) -> Dict:
        elements = floor_plan_data.get('state', {}).get('elements', [])
        booths = [elem for elem in elements if elem.get('type') == 'booth']
        
        stats = {
            'total_booths': len(booths),
            'available': 0,
            'reserved': 0,
            'sold': 0,
            'on_hold': 0
        }
        
        for booth in booths:
            status = booth.get('status', 'available')
            stats[status] += 1
        
        return stats
    
    @staticmethod
    def get_booth_details(floor_plan_data: Dict) -> List[Dict]:
        elements = floor_plan_data.get('state', {}).get('elements', [])
        booths = [elem for elem in elements if elem.get('type') == 'booth']
        
        booth_details = []
        for booth in booths:
            booth_info = {
                'id': booth.get('id'),
                'number': booth.get('number', 'N/A'),
                'status': booth.get('status', 'available'),
                'dimensions': booth.get('dimensions', {}),
                'position': {
                    'x': booth.get('x', 0),
                    'y': booth.get('y', 0),
                    'width': booth.get('width', 0),
                    'height': booth.get('height', 0)
                }
            }
            
            # Add exhibitor info if available
            exhibitor = booth.get('exhibitor', {})
            if exhibitor:
                booth_info['exhibitor'] = {
                    'company_name': exhibitor.get('companyName', ''),
                    'category': exhibitor.get('category', ''),
                    'contact': exhibitor.get('contact', {})
                }
            
            booth_details.append(booth_info)
        
        return booth_details
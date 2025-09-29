#!/usr/bin/env python3
"""
Database schema setup for hierarchical floor plan system
"""

from pymongo import MongoClient, ASCENDING, DESCENDING
import os
from datetime import datetime

def setup_hierarchical_schema():
    """Set up database collections and indexes for hierarchical floor plan system"""
    
    # Get MongoDB connection
    client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/imtma_flooring'))
    db = client.get_default_database()
    
    print("Setting up hierarchical floor plan database schema...")
    
    # Create area_floorplans collection
    print("Creating area_floorplans collection...")
    area_floorplans = db.area_floorplans
    
    # Create indexes for area_floorplans
    area_floorplans.create_index([("created_by", ASCENDING)])
    area_floorplans.create_index([("status", ASCENDING)])
    area_floorplans.create_index([("created_at", DESCENDING)])
    area_floorplans.create_index([("name", "text"), ("description", "text")])
    
    # Create hall_floorplans collection
    print("Creating hall_floorplans collection...")
    hall_floorplans = db.hall_floorplans
    
    # Create indexes for hall_floorplans
    hall_floorplans.create_index([("hall_id", ASCENDING)])
    hall_floorplans.create_index([("area_plan_id", ASCENDING)])
    hall_floorplans.create_index([("created_by", ASCENDING)])
    hall_floorplans.create_index([("status", ASCENDING)])
    hall_floorplans.create_index([("created_at", DESCENDING)])
    hall_floorplans.create_index([("hall_id", ASCENDING), ("status", ASCENDING)])
    
    # Update existing halls collection with new fields
    print("Updating halls collection...")
    halls = db.halls
    
    # Add indexes for halls
    halls.create_index([("assigned_plan_id", ASCENDING)])
    halls.create_index([("public", ASCENDING)])
    halls.create_index([("event_id", ASCENDING)])
    
    # Create compound indexes for performance
    halls.create_index([("public", ASCENDING), ("event_id", ASCENDING)])
    hall_floorplans.create_index([("hall_id", ASCENDING), ("status", ASCENDING), ("created_at", DESCENDING)])
    
    print("✅ Database schema setup completed!")
    
    # Create sample data for testing
    create_sample_hierarchical_data(db)

def create_sample_hierarchical_data(db):
    """Create sample hierarchical floor plan data"""
    
    print("Creating sample hierarchical data...")
    
    # Sample area plan
    sample_area_plan = {
        'name': 'BIEC Main Exhibition Area',
        'description': 'Main exhibition area with multiple halls',
        'type': 'area',
        'image_url': '/uploads/sample-area-plan.jpg',
        'detected_halls': [
            {
                'id': 'hall_1',
                'name': 'Hall 1',
                'bounds': {'x': 100, 'y': 100, 'width': 400, 'height': 300},
                'area': 120000,
                'confidence': 0.95,
                'detection_method': 'contour_analysis'
            },
            {
                'id': 'hall_2', 
                'name': 'Hall 2',
                'bounds': {'x': 550, 'y': 100, 'width': 350, 'height': 300},
                'area': 105000,
                'confidence': 0.88,
                'detection_method': 'color_blue'
            },
            {
                'id': 'hall_3',
                'name': 'Hall 3', 
                'bounds': {'x': 100, 'y': 450, 'width': 800, 'height': 200},
                'area': 160000,
                'confidence': 0.92,
                'detection_method': 'color_green'
            }
        ],
        'created_by': 'system',
        'created_at': datetime.utcnow(),
        'status': 'published'
    }
    
    # Insert area plan if it doesn't exist
    existing_area = db.area_floorplans.find_one({'name': sample_area_plan['name']})
    if not existing_area:
        area_result = db.area_floorplans.insert_one(sample_area_plan)
        print(f"✅ Created sample area plan: {area_result.inserted_id}")
    
    # Sample hall plans
    sample_hall_plans = [
        {
            'name': 'Hall 1 - Technology Pavilion',
            'description': 'Technology companies and startups',
            'type': 'hall',
            'hall_id': 'hall_1',
            'area_plan_id': str(existing_area['_id']) if existing_area else None,
            'image_url': '/uploads/sample-hall-1.jpg',
            'booth_detection': {
                'booths': [
                    {
                        'id': 'booth_1_1',
                        'type': 'booth',
                        'x': 50, 'y': 50, 'width': 100, 'height': 80,
                        'number': 'T001', 'status': 'available'
                    },
                    {
                        'id': 'booth_1_2', 
                        'type': 'booth',
                        'x': 170, 'y': 50, 'width': 100, 'height': 80,
                        'number': 'T002', 'status': 'sold'
                    }
                ],
                'detection_count': 2,
                'imageWidth': 400,
                'imageHeight': 300
            },
            'created_by': 'system',
            'created_at': datetime.utcnow(),
            'status': 'published'
        },
        {
            'name': 'Hall 2 - Healthcare & Medical',
            'description': 'Healthcare and medical device companies',
            'type': 'hall',
            'hall_id': 'hall_2',
            'area_plan_id': str(existing_area['_id']) if existing_area else None,
            'image_url': '/uploads/sample-hall-2.jpg',
            'booth_detection': {
                'booths': [
                    {
                        'id': 'booth_2_1',
                        'type': 'booth', 
                        'x': 40, 'y': 40, 'width': 90, 'height': 70,
                        'number': 'H001', 'status': 'reserved'
                    },
                    {
                        'id': 'booth_2_2',
                        'type': 'booth',
                        'x': 150, 'y': 40, 'width': 90, 'height': 70, 
                        'number': 'H002', 'status': 'available'
                    }
                ],
                'detection_count': 2,
                'imageWidth': 350,
                'imageHeight': 300
            },
            'created_by': 'system',
            'created_at': datetime.utcnow(),
            'status': 'published'
        }
    ]
    
    # Insert hall plans if they don't exist
    for hall_plan in sample_hall_plans:
        existing_hall = db.hall_floorplans.find_one({
            'name': hall_plan['name'],
            'hall_id': hall_plan['hall_id']
        })
        if not existing_hall:
            hall_result = db.hall_floorplans.insert_one(hall_plan)
            print(f"✅ Created sample hall plan: {hall_plan['name']}")
    
    print("✅ Sample hierarchical data created!")

if __name__ == '__main__':
    setup_hierarchical_schema()
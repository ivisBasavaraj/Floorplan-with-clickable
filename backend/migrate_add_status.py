#!/usr/bin/env python3
"""
Migration script to add status field to existing floorplans
Run this script to update existing floorplans with a default status of 'draft'
"""

import os
from pymongo import MongoClient
from datetime import datetime

def migrate_add_status():
    # Get MongoDB connection
    client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/imtma_flooring'))
    db = client.get_default_database()
    
    print("Starting migration: Adding status field to floorplans...")
    
    # Find all floorplans without a status field
    floorplans_without_status = db.floorplans.find({'status': {'$exists': False}})
    count = db.floorplans.count_documents({'status': {'$exists': False}})
    
    if count == 0:
        print("No floorplans need migration. All floorplans already have status field.")
        return
    
    print(f"Found {count} floorplans without status field.")
    
    # Update all floorplans without status to have 'draft' status
    result = db.floorplans.update_many(
        {'status': {'$exists': False}},
        {
            '$set': {
                'status': 'draft',
                'last_modified': datetime.utcnow()
            }
        }
    )
    
    print(f"Migration completed successfully!")
    print(f"Updated {result.modified_count} floorplans with default status 'draft'")
    
    # Show summary of status distribution
    print("\nCurrent status distribution:")
    pipeline = [
        {'$group': {'_id': '$status', 'count': {'$sum': 1}}},
        {'$sort': {'_id': 1}}
    ]
    
    for status_group in db.floorplans.aggregate(pipeline):
        print(f"  {status_group['_id']}: {status_group['count']}")

if __name__ == '__main__':
    migrate_add_status()
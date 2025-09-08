#!/usr/bin/env python3
"""
Test script to verify status filtering functionality
"""

import requests
import json

BASE_URL = 'http://localhost:5000/api'

def test_status_filtering():
    print("Testing Floor Plan Status Filtering...")
    
    # First, let's register a test user
    print("\n1. Registering test user...")
    register_data = {
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'testpass123',
        'role': 'user'
    }
    
    response = requests.post(f'{BASE_URL}/auth/register', json=register_data)
    if response.status_code == 201:
        print("✅ Test user registered successfully")
        user_token = response.json().get('access_token')
    else:
        print("❌ Failed to register test user:", response.json())
        return
    
    # Register admin user
    print("\n2. Registering admin user...")
    admin_data = {
        'username': 'admin',
        'email': 'admin@example.com',
        'password': 'adminpass123',
        'role': 'admin'
    }
    
    response = requests.post(f'{BASE_URL}/auth/register', json=admin_data)
    if response.status_code == 201:
        print("✅ Admin user registered successfully")
        admin_token = response.json().get('access_token')
    else:
        # Try to login if user already exists
        login_response = requests.post(f'{BASE_URL}/auth/login', json={
            'username': 'admin',
            'password': 'adminpass123'
        })
        if login_response.status_code == 200:
            print("✅ Admin user logged in successfully")
            admin_token = login_response.json().get('access_token')
        else:
            print("❌ Failed to get admin access:", login_response.json())
            return
    
    # Create test floor plans with different statuses
    print("\n3. Creating test floor plans...")
    
    test_plans = [
        {'name': 'Draft Plan', 'description': 'This is a draft plan', 'status': 'draft'},
        {'name': 'Active Plan', 'description': 'This is an active plan', 'status': 'active'},
        {'name': 'Published Plan', 'description': 'This is a published plan', 'status': 'published'},
        {'name': 'Archived Plan', 'description': 'This is an archived plan', 'status': 'archived'}
    ]
    
    created_plans = []
    headers = {'Authorization': f'Bearer {admin_token}', 'Content-Type': 'application/json'}
    
    for plan_data in test_plans:
        response = requests.post(f'{BASE_URL}/floorplans', json=plan_data, headers=headers)
        if response.status_code == 201:
            created_plan = response.json().get('floorplan')
            created_plans.append(created_plan)
            print(f"✅ Created {plan_data['status']} plan: {plan_data['name']}")
        else:
            print(f"❌ Failed to create {plan_data['status']} plan:", response.json())
    
    # Test admin access (should see all plans)
    print("\n4. Testing admin access (should see all plans)...")
    response = requests.get(f'{BASE_URL}/floorplans', headers=headers)
    if response.status_code == 200:
        admin_plans = response.json().get('floorplans', [])
        print(f"✅ Admin sees {len(admin_plans)} floor plans:")
        for plan in admin_plans:
            print(f"   - {plan['name']} ({plan.get('status', 'draft')})")
    else:
        print("❌ Failed to get floor plans as admin:", response.json())
    
    # Test regular user access (should only see active/published plans)
    print("\n5. Testing regular user access (should only see active/published plans)...")
    user_headers = {'Authorization': f'Bearer {user_token}', 'Content-Type': 'application/json'}
    response = requests.get(f'{BASE_URL}/floorplans', headers=user_headers)
    if response.status_code == 200:
        user_plans = response.json().get('floorplans', [])
        print(f"✅ Regular user sees {len(user_plans)} floor plans:")
        for plan in user_plans:
            print(f"   - {plan['name']} ({plan.get('status', 'draft')})")
        
        # Verify only active/published plans are visible
        visible_statuses = [plan.get('status', 'draft') for plan in user_plans]
        if all(status in ['active', 'published'] for status in visible_statuses):
            print("✅ Status filtering working correctly - only active/published plans visible to regular users")
        else:
            print("❌ Status filtering failed - regular user can see non-active/published plans")
    else:
        print("❌ Failed to get floor plans as regular user:", response.json())
    
    # Test status update functionality
    if created_plans:
        print("\n6. Testing status update functionality...")
        plan_to_update = created_plans[0]  # Use the first created plan
        
        # Update status to published
        update_data = {'status': 'published'}
        response = requests.put(
            f'{BASE_URL}/floorplans/{plan_to_update["id"]}/status',
            json=update_data,
            headers=headers
        )
        
        if response.status_code == 200:
            print(f"✅ Successfully updated plan status to published")
            
            # Verify the update
            response = requests.get(f'{BASE_URL}/floorplans/{plan_to_update["id"]}', headers=headers)
            if response.status_code == 200:
                updated_plan = response.json().get('floorplan')
                if updated_plan.get('status') == 'published':
                    print("✅ Status update verified successfully")
                else:
                    print("❌ Status update verification failed")
        else:
            print("❌ Failed to update plan status:", response.json())
    
    print("\n✅ Status filtering test completed!")

if __name__ == '__main__':
    test_status_filtering()
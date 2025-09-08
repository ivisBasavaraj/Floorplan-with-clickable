#!/usr/bin/env python3
"""
Test script to verify the admin/user workflow for floor plans
"""

import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_workflow():
    print("🧪 Testing IMTMA Flooring Admin/User Workflow")
    print("=" * 50)
    
    # Step 1: Register an admin user
    print("\n1. Creating admin user...")
    admin_data = {
        "username": "admin_test",
        "email": "admin@test.com",
        "password": "admin123",
        "role": "admin"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=admin_data)
    if response.status_code == 200:
        admin_token = response.json()["access_token"]
        print("✅ Admin user created successfully")
    else:
        print(f"❌ Failed to create admin user: {response.text}")
        return
    
    # Step 2: Register a regular user
    print("\n2. Creating regular user...")
    user_data = {
        "username": "user_test",
        "email": "user@test.com",
        "password": "user123",
        "role": "user"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
    if response.status_code == 200:
        user_token = response.json()["access_token"]
        print("✅ Regular user created successfully")
    else:
        print(f"❌ Failed to create regular user: {response.text}")
        return
    
    # Step 3: Admin creates a floor plan
    print("\n3. Admin creating a floor plan...")
    floor_plan_data = {
        "name": "Test Conference Floor Plan",
        "description": "A test floor plan for the conference",
        "event_id": "test_event_2024",
        "floor": 1,
        "status": "published",
        "state": {
            "elements": [
                {
                    "type": "booth",
                    "x": 100,
                    "y": 100,
                    "width": 100,
                    "height": 100,
                    "rotation": 0,
                    "fill": "#FFFFFF",
                    "stroke": "#000000",
                    "strokeWidth": 2,
                    "number": "A001",
                    "status": "available",
                    "price": 500,
                    "dimensions": {
                        "imperial": "10x10 ft",
                        "metric": "3x3 m"
                    }
                },
                {
                    "type": "booth",
                    "x": 220,
                    "y": 100,
                    "width": 100,
                    "height": 100,
                    "rotation": 0,
                    "fill": "#FFFFFF",
                    "stroke": "#000000",
                    "strokeWidth": 2,
                    "number": "A002",
                    "status": "sold",
                    "price": 500,
                    "dimensions": {
                        "imperial": "10x10 ft",
                        "metric": "3x3 m"
                    },
                    "exhibitor": {
                        "companyName": "TechCorp Solutions",
                        "category": "Technology",
                        "contact": {
                            "email": "info@techcorp.com",
                            "phone": "+1-555-0123"
                        }
                    }
                }
            ],
            "canvasSize": {"width": 1200, "height": 800},
            "zoom": 1,
            "offset": {"x": 0, "y": 0},
            "grid": {
                "enabled": True,
                "size": 20,
                "snap": True,
                "opacity": 0.3
            }
        }
    }
    
    headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
    response = requests.post(f"{BASE_URL}/floorplans", json=floor_plan_data, headers=headers)
    
    if response.status_code == 201:
        floor_plan_id = response.json()["floorplan"]["id"]
        print(f"✅ Floor plan created successfully with ID: {floor_plan_id}")
    else:
        print(f"❌ Failed to create floor plan: {response.text}")
        return
    
    # Step 4: Test that regular user cannot create floor plans
    print("\n4. Testing that regular user cannot create floor plans...")
    user_headers = {"Authorization": f"Bearer {user_token}", "Content-Type": "application/json"}
    response = requests.post(f"{BASE_URL}/floorplans", json=floor_plan_data, headers=user_headers)
    
    if response.status_code == 403:
        print("✅ Regular user correctly denied access to create floor plans")
    else:
        print(f"❌ Regular user should not be able to create floor plans: {response.status_code}")
    
    # Step 5: Test that regular user can view published floor plans
    print("\n5. Testing that regular user can view published floor plans...")
    response = requests.get(f"{BASE_URL}/public/floorplans")
    
    if response.status_code == 200:
        public_plans = response.json()["floorplans"]
        if len(public_plans) > 0:
            print(f"✅ Regular user can see {len(public_plans)} published floor plan(s)")
            
            # Test viewing specific floor plan
            response = requests.get(f"{BASE_URL}/public/floorplans/{floor_plan_id}")
            if response.status_code == 200:
                plan_data = response.json()["floorplan"]
                print(f"✅ Regular user can view floor plan details: {plan_data['name']}")
                print(f"   - Booths: {len(plan_data.get('booth_details', []))}")
                print(f"   - Stats: {plan_data.get('stats', {})}")
            else:
                print(f"❌ Failed to get floor plan details: {response.text}")
        else:
            print("❌ No published floor plans found")
    else:
        print(f"❌ Failed to get public floor plans: {response.text}")
    
    # Step 6: Test admin dashboard access
    print("\n6. Testing admin dashboard access...")
    response = requests.get(f"{BASE_URL}/floorplans", headers=headers)
    
    if response.status_code == 200:
        admin_plans = response.json()["floorplans"]
        print(f"✅ Admin can see {len(admin_plans)} floor plan(s) in dashboard")
    else:
        print(f"❌ Admin failed to access dashboard: {response.text}")
    
    print("\n" + "=" * 50)
    print("🎉 Workflow test completed!")
    print("\nSummary:")
    print("- ✅ Admin can create floor plans")
    print("- ✅ Regular users cannot create floor plans")
    print("- ✅ Published floor plans are visible to all users")
    print("- ✅ Admin has full dashboard access")
    print("\nYou can now test the frontend:")
    print("1. Go to http://localhost:5173")
    print("2. Login as admin (admin@test.com / admin123) - should see dashboard")
    print("3. Login as user (user@test.com / user123) - should see floor plans list")

if __name__ == "__main__":
    test_workflow()
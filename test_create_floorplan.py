#!/usr/bin/env python3
"""
Test script to create a floor plan and verify it appears in public API
"""

import requests
import json

BASE_URL = "http://localhost:5000/api"

def create_test_floorplan():
    print("🧪 Creating test floor plan for user interface")
    print("=" * 50)
    
    # Step 1: Register/Login as admin
    print("\n1. Creating admin user...")
    admin_data = {
        "username": "admin_test",
        "email": "admin@test.com", 
        "password": "admin123",
        "role": "admin"
    }
    
    # Try to register (will fail if user exists, that's ok)
    response = requests.post(f"{BASE_URL}/auth/register", json=admin_data)
    if response.status_code == 200:
        admin_token = response.json()["access_token"]
        print("✅ Admin user created successfully")
    else:
        # Try to login instead
        login_data = {
            "username": "admin_test",
            "password": "admin123"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            admin_token = response.json()["access_token"]
            print("✅ Admin user logged in successfully")
        else:
            print(f"❌ Failed to login admin user: {response.text}")
            return
    
    # Step 2: Create a floor plan with published status
    print("\n2. Creating a published floor plan...")
    floor_plan_data = {
        "name": "IMTMA Conference 2024 - Main Hall",
        "description": "Main conference hall with exhibition booths",
        "event_id": "imtma_2024",
        "floor": 1,
        "status": "published",  # This is key - must be published to appear in public API
        "state": {
            "elements": [
                {
                    "id": "booth-1",
                    "type": "booth",
                    "x": 100,
                    "y": 100,
                    "width": 120,
                    "height": 120,
                    "rotation": 0,
                    "fill": "#FFFFFF",
                    "stroke": "#000000",
                    "strokeWidth": 2,
                    "number": "A001",
                    "status": "available",
                    "price": 500,
                    "dimensions": {
                        "imperial": "12x12 ft",
                        "metric": "3.6x3.6 m"
                    }
                },
                {
                    "id": "booth-2", 
                    "type": "booth",
                    "x": 240,
                    "y": 100,
                    "width": 120,
                    "height": 120,
                    "rotation": 0,
                    "fill": "#E3F2FD",
                    "stroke": "#1976D2",
                    "strokeWidth": 2,
                    "number": "A002",
                    "status": "sold",
                    "price": 500,
                    "dimensions": {
                        "imperial": "12x12 ft",
                        "metric": "3.6x3.6 m"
                    },
                    "exhibitor": {
                        "company_name": "TechCorp Solutions",
                        "category": "Technology",
                        "contact": {
                            "email": "info@techcorp.com",
                            "phone": "+1-555-0123",
                            "website": "https://techcorp.com"
                        }
                    }
                },
                {
                    "id": "booth-3",
                    "type": "booth", 
                    "x": 380,
                    "y": 100,
                    "width": 120,
                    "height": 120,
                    "rotation": 0,
                    "fill": "#FFF3E0",
                    "stroke": "#F57C00",
                    "strokeWidth": 2,
                    "number": "A003",
                    "status": "reserved",
                    "price": 500,
                    "dimensions": {
                        "imperial": "12x12 ft",
                        "metric": "3.6x3.6 m"
                    },
                    "exhibitor": {
                        "company_name": "Green Energy Inc",
                        "category": "Energy",
                        "contact": {
                            "email": "info@greenenergy.com",
                            "phone": "+1-555-0456"
                        }
                    }
                },
                {
                    "id": "booth-4",
                    "type": "booth",
                    "x": 100,
                    "y": 240,
                    "width": 120,
                    "height": 120,
                    "rotation": 0,
                    "fill": "#FFFFFF",
                    "stroke": "#000000",
                    "strokeWidth": 2,
                    "number": "B001",
                    "status": "available",
                    "price": 750,
                    "dimensions": {
                        "imperial": "12x12 ft",
                        "metric": "3.6x3.6 m"
                    }
                },
                {
                    "id": "text-1",
                    "type": "text",
                    "x": 250,
                    "y": 50,
                    "width": 200,
                    "height": 30,
                    "rotation": 0,
                    "text": "IMTMA Conference 2024",
                    "fontSize": 24,
                    "fontFamily": "Arial",
                    "fill": "#1976D2",
                    "fontWeight": "bold"
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
        
        # Step 3: Verify it appears in public API
        print("\n3. Verifying floor plan appears in public API...")
        response = requests.get(f"{BASE_URL}/public/floorplans")
        
        if response.status_code == 200:
            public_plans = response.json()["floorplans"]
            print(f"✅ Found {len(public_plans)} published floor plan(s)")
            
            for plan in public_plans:
                print(f"   - {plan['name']} (ID: {plan['id']}, Status: {plan['status']})")
                
            if len(public_plans) > 0:
                # Test getting specific floor plan
                test_plan = public_plans[0]
                response = requests.get(f"{BASE_URL}/public/floorplans/{test_plan['id']}")
                if response.status_code == 200:
                    plan_details = response.json()["floorplan"]
                    print(f"✅ Floor plan details loaded successfully")
                    print(f"   - Elements: {len(plan_details.get('state', {}).get('elements', []))}")
                    print(f"   - Booth details: {len(plan_details.get('booth_details', []))}")
                    print(f"   - Stats: {plan_details.get('stats', {})}")
                else:
                    print(f"❌ Failed to get floor plan details: {response.text}")
        else:
            print(f"❌ Failed to get public floor plans: {response.text}")
            
    else:
        print(f"❌ Failed to create floor plan: {response.text}")
        print(f"Response status: {response.status_code}")
        
    print("\n" + "=" * 50)
    print("🎉 Test completed!")
    print("\nNow you can:")
    print("1. Go to http://localhost:5173")
    print("2. Login as regular user or admin")
    print("3. Users should see the floor plan in the viewer")
    print("4. Admin should see it in the dashboard")

if __name__ == "__main__":
    create_test_floorplan()
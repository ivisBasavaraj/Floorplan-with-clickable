#!/usr/bin/env python3
"""
Create a test floor plan with image elements for testing the frontend image rendering
"""

import requests
import json

BASE_URL = "http://localhost:5000/api"

def create_test_floorplan_with_images():
    print("🏗️ Creating test floor plan with image elements...")
    
    # First, create a test user if needed
    user_data = {
        "username": "testuser",
        "email": "user@test.com",
        "password": "user123",
        "role": "user"
    }
    
    # Try to register (will fail if user exists, which is fine)
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
        if response.status_code == 200:
            print("✅ Test user created")
        else:
            print("ℹ️ Using existing test user")
    except:
        print("ℹ️ Using existing test user")
    
    # Login to get token
    login_response = requests.post(f"{BASE_URL}/auth/login", json={
        "username": "testuser",
        "password": "user123"
    })
    
    if login_response.status_code != 200:
        print("❌ Failed to login")
        return
    
    token = login_response.json().get('access_token')
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    # Create floor plan with image elements
    floor_plan_data = {
        "name": "Test Floor Plan with Images",
        "description": "A test floor plan containing various image elements for testing",
        "floor": 1,
        "layer": 1,
        "status": "published",
        "state": {
            "canvasSize": {"width": 1200, "height": 800},
            "elements": [
                # Background image
                {
                    "id": "bg-1",
                    "type": "image",
                    "x": 0,
                    "y": 0,
                    "width": 1200,
                    "height": 800,
                    "layer": 0,
                    "src": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop",
                    "opacity": 0.3,
                    "locked": True
                },
                # Company logo 1
                {
                    "id": "logo-1",
                    "type": "image",
                    "x": 100,
                    "y": 100,
                    "width": 120,
                    "height": 80,
                    "layer": 2,
                    "src": "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=120&h=80&fit=crop",
                    "opacity": 1.0,
                    "locked": False
                },
                # Company logo 2
                {
                    "id": "logo-2",
                    "type": "image",
                    "x": 300,
                    "y": 150,
                    "width": 100,
                    "height": 60,
                    "layer": 2,
                    "src": "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=60&fit=crop",
                    "opacity": 1.0,
                    "locked": False
                },
                # Broken image (to test error handling)
                {
                    "id": "broken-1",
                    "type": "image",
                    "x": 500,
                    "y": 200,
                    "width": 150,
                    "height": 100,
                    "layer": 2,
                    "src": "https://broken-url-that-does-not-exist.com/image.jpg",
                    "opacity": 1.0,
                    "locked": False
                },
                # Image with no src (to test no-image fallback)
                {
                    "id": "no-src-1",
                    "type": "image",
                    "x": 700,
                    "y": 250,
                    "width": 120,
                    "height": 80,
                    "layer": 2,
                    "src": "",
                    "opacity": 1.0,
                    "locked": False
                },
                # Some booth rectangles for context
                {
                    "id": "booth-1",
                    "type": "rectangle",
                    "x": 100,
                    "y": 300,
                    "width": 80,
                    "height": 60,
                    "layer": 1,
                    "fill": "#e3f2fd",
                    "stroke": "#1976d2",
                    "strokeWidth": 2
                },
                {
                    "id": "booth-2",
                    "type": "rectangle",
                    "x": 200,
                    "y": 300,
                    "width": 80,
                    "height": 60,
                    "layer": 1,
                    "fill": "#f3e5f5",
                    "stroke": "#7b1fa2",
                    "strokeWidth": 2
                },
                # Text labels
                {
                    "id": "text-1",
                    "type": "text",
                    "x": 110,
                    "y": 320,
                    "layer": 3,
                    "text": "Booth A1",
                    "fontSize": 12,
                    "fontFamily": "Arial",
                    "fill": "#333"
                },
                {
                    "id": "text-2",
                    "type": "text",
                    "x": 210,
                    "y": 320,
                    "layer": 3,
                    "text": "Booth A2",
                    "fontSize": 12,
                    "fontFamily": "Arial",
                    "fill": "#333"
                }
            ],
            "backgroundImage": {
                "url": "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=800&fit=crop",
                "opacity": 0.1,
                "fitMode": "stretch",
                "position": {"x": 0, "y": 0},
                "scale": 1.0,
                "rotation": 0,
                "locked": True
            }
        }
    }
    
    # Create the floor plan
    response = requests.post(f"{BASE_URL}/floorplans", json=floor_plan_data, headers=headers)
    
    if response.status_code == 201:
        floor_plan = response.json()
        print("✅ Test floor plan with images created successfully!")
        print(f"   Floor Plan ID: {floor_plan.get('id')}")
        print(f"   Name: {floor_plan.get('name')}")
        print(f"   Image Elements: 4 (including 1 background, 2 valid images, 1 broken, 1 no-src)")
        print(f"   View at: http://localhost:5173/floor-plans/{floor_plan.get('id')}")
        return floor_plan.get('id')
    else:
        print(f"❌ Failed to create floor plan: {response.status_code}")
        print(f"   Response: {response.text}")
        return None

if __name__ == "__main__":
    floor_plan_id = create_test_floorplan_with_images()
    if floor_plan_id:
        print(f"\n🎯 Test the image rendering at:")
        print(f"   http://localhost:5173/floor-plans/{floor_plan_id}")
        print(f"\n📝 This floor plan includes:")
        print(f"   • Background image (low opacity)")
        print(f"   • Valid company logos")
        print(f"   • Broken image URL (tests error handling)")
        print(f"   • Image with no src (tests no-image fallback)")
        print(f"   • Booth rectangles and text for context")
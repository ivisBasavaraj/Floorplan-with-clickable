#!/usr/bin/env python3
"""
Simple API test script for IMTMA Flooring Backend
Tests basic functionality of authentication and floor plan endpoints
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:5000"
TEST_USER = {
    "username": "test_user",
    "email": "test@example.com",
    "password": "test_password_123",
    "role": "admin"
}

def print_response(response, title):
    """Print formatted response"""
    print(f"\n{'='*50}")
    print(f"📋 {title}")
    print(f"{'='*50}")
    print(f"Status: {response.status_code}")
    try:
        data = response.json()
        print("Response:")
        print(json.dumps(data, indent=2))
    except:
        print("Response:")
        print(response.text)
    print("-" * 50)

def test_health_check():
    """Test health check endpoint"""
    print("🏥 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print_response(response, "Health Check")
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Is it running?")
        return False

def test_register_user():
    """Test user registration"""
    print("👤 Testing user registration...")
    response = requests.post(
        f"{BASE_URL}/api/auth/register",
        json=TEST_USER
    )
    print_response(response, "User Registration")
    
    if response.status_code == 201:
        data = response.json()
        return data.get('access_token')
    return None

def test_login_user():
    """Test user login"""
    print("🔐 Testing user login...")
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={
            "username": TEST_USER["username"],
            "password": TEST_USER["password"]
        }
    )
    print_response(response, "User Login")
    
    if response.status_code == 200:
        data = response.json()
        return data.get('access_token')
    return None

def test_create_floor_plan(token):
    """Test floor plan creation"""
    print("🗺️ Testing floor plan creation...")
    
    headers = {"Authorization": f"Bearer {token}"}
    floor_plan_data = {
        "name": "Test Exhibition Hall",
        "description": "Test floor plan created by API test",
        "event_id": "test_event_2024",
        "floor": 1,
        "state": {
            "elements": [
                {
                    "id": "test_booth_001",
                    "type": "booth",
                    "x": 100,
                    "y": 100,
                    "width": 100,
                    "height": 100,
                    "rotation": 0,
                    "fill": "#ffffff",
                    "stroke": "#000000",
                    "strokeWidth": 2,
                    "draggable": True,
                    "selected": False,
                    "layer": 1,
                    "customProperties": {},
                    "number": "A1",
                    "status": "available",
                    "price": 500,
                    "dimensions": {
                        "imperial": "10x10 ft",
                        "metric": "3x3 m"
                    },
                    "exhibitor": {
                        "companyName": "Test Company",
                        "category": "Technology",
                        "contact": {
                            "email": "contact@testcompany.com",
                            "phone": "+1-555-0123"
                        }
                    }
                },
                {
                    "id": "test_booth_002",
                    "type": "booth",
                    "x": 220,
                    "y": 100,
                    "width": 100,
                    "height": 100,
                    "rotation": 0,
                    "fill": "#ffffff",
                    "stroke": "#000000",
                    "strokeWidth": 2,
                    "draggable": True,
                    "selected": False,
                    "layer": 1,
                    "customProperties": {},
                    "number": "A2",
                    "status": "sold",
                    "price": 750,
                    "dimensions": {
                        "imperial": "10x10 ft",
                        "metric": "3x3 m"
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
    
    response = requests.post(
        f"{BASE_URL}/api/floorplans",
        json=floor_plan_data,
        headers=headers
    )
    print_response(response, "Floor Plan Creation")
    
    if response.status_code == 201:
        data = response.json()
        return data.get('floorplan', {}).get('id')
    return None

def test_get_floor_plans(token):
    """Test getting floor plans"""
    print("📋 Testing get floor plans...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/api/floorplans",
        headers=headers
    )
    print_response(response, "Get Floor Plans")
    return response.status_code == 200

def test_get_floor_plan_details(token, floor_plan_id):
    """Test getting specific floor plan details"""
    print("🔍 Testing get floor plan details...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/api/floorplans/{floor_plan_id}",
        headers=headers
    )
    print_response(response, "Get Floor Plan Details")
    return response.status_code == 200

def test_get_booth_details(token, floor_plan_id):
    """Test getting booth details"""
    print("🏪 Testing get booth details...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/api/floorplans/{floor_plan_id}/booths",
        headers=headers
    )
    print_response(response, "Get Booth Details")
    return response.status_code == 200

def run_tests():
    """Run all tests"""
    print("🚀 Starting IMTMA Flooring Backend API Tests")
    print(f"🕐 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 Testing server at: {BASE_URL}")
    
    tests_passed = 0
    total_tests = 0
    
    # Test 1: Health Check
    total_tests += 1
    if test_health_check():
        tests_passed += 1
        print("✅ Health check passed")
    else:
        print("❌ Health check failed - server not accessible")
        return
    
    # Test 2: User Registration
    total_tests += 1
    token = test_register_user()
    if token:
        tests_passed += 1
        print("✅ User registration passed")
    else:
        print("❌ User registration failed")
        # Try login instead (user might already exist)
        token = test_login_user()
        if token:
            print("✅ User login successful (user already exists)")
        else:
            print("❌ Both registration and login failed")
            return
    
    # Test 3: Create Floor Plan
    total_tests += 1
    floor_plan_id = test_create_floor_plan(token)
    if floor_plan_id:
        tests_passed += 1
        print("✅ Floor plan creation passed")
    else:
        print("❌ Floor plan creation failed")
        return
    
    # Test 4: Get Floor Plans
    total_tests += 1
    if test_get_floor_plans(token):
        tests_passed += 1
        print("✅ Get floor plans passed")
    else:
        print("❌ Get floor plans failed")
    
    # Test 5: Get Floor Plan Details
    total_tests += 1
    if test_get_floor_plan_details(token, floor_plan_id):
        tests_passed += 1
        print("✅ Get floor plan details passed")
    else:
        print("❌ Get floor plan details failed")
    
    # Test 6: Get Booth Details
    total_tests += 1
    if test_get_booth_details(token, floor_plan_id):
        tests_passed += 1
        print("✅ Get booth details passed")
    else:
        print("❌ Get booth details failed")
    
    # Summary
    print(f"\n{'='*50}")
    print("📊 TEST SUMMARY")
    print(f"{'='*50}")
    print(f"Tests passed: {tests_passed}/{total_tests}")
    print(f"Success rate: {(tests_passed/total_tests)*100:.1f}%")
    
    if tests_passed == total_tests:
        print("🎉 All tests passed! Backend is working correctly.")
        print(f"🌐 Dashboard available at: {BASE_URL}/dashboard")
        print(f"📡 API available at: {BASE_URL}/api")
    else:
        print("⚠️ Some tests failed. Check the server logs for details.")
    
    print(f"🕐 Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    try:
        run_tests()
    except KeyboardInterrupt:
        print("\n🛑 Tests interrupted by user")
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        sys.exit(1)
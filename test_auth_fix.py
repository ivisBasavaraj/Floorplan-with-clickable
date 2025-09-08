#!/usr/bin/env python3
"""
Test script to verify authentication and area maps API fix
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_auth_and_area_maps():
    print("Testing Authentication and Area Maps API Fix")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1. Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("[OK] Backend is running")
        else:
            print("[FAIL] Backend health check failed")
            return
    except requests.exceptions.ConnectionError:
        print("[FAIL] Cannot connect to backend. Make sure it's running on port 5000")
        return
    
    # Test 2: Try accessing area-maps without authentication (should fail with 401)
    print("\n2. Testing area-maps without authentication...")
    try:
        response = requests.get(f"{BASE_URL}/api/area-maps")
        if response.status_code == 401:
            print("[OK] Correctly returns 401 Unauthorized without token")
        else:
            print(f"[FAIL] Expected 401, got {response.status_code}")
    except Exception as e:
        print(f"[FAIL] Error: {e}")
    
    # Test 3: Try to login with test credentials
    print("\n3. Testing login...")
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            if 'access_token' in data:
                token = data['access_token']
                print("[OK] Login successful, got token")
                
                # Test 4: Try accessing area-maps with authentication
                print("\n4. Testing area-maps with authentication...")
                headers = {"Authorization": f"Bearer {token}"}
                response = requests.get(f"{BASE_URL}/api/area-maps", headers=headers)
                
                if response.status_code == 200:
                    print("[OK] Successfully accessed area-maps with authentication")
                    data = response.json()
                    print(f"   Found {len(data.get('area_maps', []))} area maps")
                else:
                    print(f"[FAIL] Failed to access area-maps: {response.status_code}")
                    print(f"   Response: {response.text}")
            else:
                print("[FAIL] Login response missing access_token")
        else:
            print(f"[FAIL] Login failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
            # Try to create admin user if login fails
            print("\n   Trying to create admin user...")
            register_data = {
                "username": "admin",
                "email": "admin@example.com",
                "password": "admin123",
                "role": "admin"
            }
            
            response = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
            if response.status_code == 201:
                print("[OK] Admin user created successfully")
                # Retry login
                response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
                if response.status_code == 200:
                    data = response.json()
                    token = data['access_token']
                    print("[OK] Login successful after creating user")
                    
                    # Test area-maps again
                    headers = {"Authorization": f"Bearer {token}"}
                    response = requests.get(f"{BASE_URL}/api/area-maps", headers=headers)
                    if response.status_code == 200:
                        print("[OK] Successfully accessed area-maps with authentication")
                    else:
                        print(f"[FAIL] Still failed to access area-maps: {response.status_code}")
            else:
                print(f"[FAIL] Failed to create admin user: {response.status_code}")
                
    except Exception as e:
        print(f"[FAIL] Error during login test: {e}")
    
    print("\n" + "=" * 50)
    print("Summary:")
    print("- The 401 errors were caused by missing authentication")
    print("- Frontend needs to login first before accessing area-maps")
    print("- Updated AreaMapSelector component to handle authentication")
    print("- Added proper error handling and user feedback")

if __name__ == "__main__":
    test_auth_and_area_maps()
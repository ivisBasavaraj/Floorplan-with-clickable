#!/usr/bin/env python3
"""
Create a test user for testing the frontend
"""

import requests
import json

BASE_URL = "http://localhost:5000/api"

def create_test_user():
    print("👤 Creating test user...")
    
    user_data = {
        "username": "testuser",
        "email": "user@test.com",
        "password": "user123",
        "role": "user"
    }
    
    # Try to register
    response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
    if response.status_code == 200:
        print("✅ Test user created successfully")
        print("   Username: testuser")
        print("   Email: user@test.com") 
        print("   Password: user123")
        print("   Role: user")
    else:
        print(f"ℹ️  User might already exist: {response.text}")
        print("   You can still use: user@test.com / user123")

if __name__ == "__main__":
    create_test_user()
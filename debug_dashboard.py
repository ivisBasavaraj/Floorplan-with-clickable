#!/usr/bin/env python3
"""
Debug script to check dashboard booth counting issues
"""
import requests
import json
from datetime import datetime

API_BASE = "http://localhost:5000/api"

def test_dashboard_data():
    print("🔍 Debugging Dashboard Booth Count Issues")
    print("=" * 60)
    
    try:
        # Test the floor plans endpoint
        print("📋 Testing /api/floorplans endpoint...")
        response = requests.get(f"{API_BASE}/floorplans")
        
        if response.status_code == 401:
            print("❌ Authentication required. Let's create a test user first.")
            
            # Register test user
            register_data = {
                "username": "debug_user",
                "email": "debug@example.com", 
                "password": "debug123",
                "role": "admin"
            }
            
            reg_response = requests.post(f"{API_BASE}/auth/register", json=register_data)
            if reg_response.status_code == 201:
                token = reg_response.json().get('access_token')
                headers = {'Authorization': f'Bearer {token}'}
                print("✅ Test user created successfully")
                
                # Retry with auth
                response = requests.get(f"{API_BASE}/floorplans", headers=headers)
            else:
                print(f"❌ Failed to create test user: {reg_response.text}")
                return
        
        if response.status_code == 200:
            data = response.json()
            floorplans = data.get('floorplans', [])
            
            print(f"📊 Found {len(floorplans)} floor plans")
            print("\n🏢 Floor Plan Booth Statistics:")
            print("-" * 60)
            
            total_booths_all = 0
            total_sold_all = 0
            
            for i, plan in enumerate(floorplans, 1):
                stats = plan.get('stats', {})
                total_booths = stats.get('total_booths', 0)
                sold = stats.get('sold', 0)
                available = stats.get('available', 0)
                reserved = stats.get('reserved', 0)
                on_hold = stats.get('on_hold', 0)
                
                total_booths_all += total_booths
                total_sold_all += sold
                
                print(f"{i}. {plan.get('name', 'Unnamed')}")
                print(f"   ID: {plan.get('id')}")
                print(f"   Status: {plan.get('status', 'unknown')}")
                print(f"   Total Booths: {total_booths}")
                print(f"   Sold: {sold}")
                print(f"   Available: {available}")
                print(f"   Reserved: {reserved}")
                print(f"   On Hold: {on_hold}")
                print(f"   Last Modified: {plan.get('last_modified')}")
                print()
            
            print("📈 DASHBOARD SUMMARY:")
            print(f"   Total Floor Plans: {len(floorplans)}")
            print(f"   Total Booths (All Plans): {total_booths_all}")
            print(f"   Total Sold/Occupied: {total_sold_all}")
            occupancy_rate = (total_sold_all / total_booths_all * 100) if total_booths_all > 0 else 0
            print(f"   Occupancy Rate: {occupancy_rate:.1f}%")
            
            # Test individual floor plan details
            if floorplans:
                print(f"\n🔍 Testing detailed view for first floor plan...")
                first_plan_id = floorplans[0]['id']
                detail_response = requests.get(f"{API_BASE}/floorplans/{first_plan_id}", headers=headers)
                
                if detail_response.status_code == 200:
                    detail_data = detail_response.json()
                    floorplan = detail_data.get('floorplan', {})
                    booth_details = floorplan.get('booth_details', [])
                    
                    print(f"✅ Floor plan details loaded successfully")
                    print(f"   Booth Details Count: {len(booth_details)}")
                    
                    if booth_details:
                        print("   Sample Booth Details:")
                        for booth in booth_details[:3]:  # Show first 3 booths
                            print(f"     - Booth {booth.get('number', 'N/A')}: {booth.get('status', 'unknown')}")
                else:
                    print(f"❌ Failed to get floor plan details: {detail_response.status_code}")
        else:
            print(f"❌ Failed to get floor plans: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")

if __name__ == "__main__":
    test_dashboard_data()
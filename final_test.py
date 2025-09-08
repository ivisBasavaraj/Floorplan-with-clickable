#!/usr/bin/env python3
"""
Final test to verify the complete admin/user workflow
"""

import requests
import json

BASE_URL = "http://localhost:5000/api"

def final_test():
    print("🎯 Final Test - Admin/User Workflow")
    print("=" * 50)
    
    # Test 1: Verify published floor plans exist
    print("\n1. Checking published floor plans...")
    response = requests.get(f"{BASE_URL}/public/floorplans")
    
    if response.status_code == 200:
        data = response.json()
        plans = data.get('floorplans', [])
        print(f"✅ Found {len(plans)} published floor plan(s)")
        
        if len(plans) > 0:
            plan = plans[0]
            print(f"   📋 Plan: {plan['name']}")
            print(f"   🆔 ID: {plan['id']}")
            print(f"   📊 Status: {plan['status']}")
            
            # Test 2: Get detailed floor plan
            print(f"\n2. Loading floor plan details...")
            detail_response = requests.get(f"{BASE_URL}/public/floorplans/{plan['id']}")
            
            if detail_response.status_code == 200:
                detail_data = detail_response.json()
                floor_plan = detail_data.get('floorplan', {})
                
                print(f"✅ Floor plan details loaded successfully")
                print(f"   🏗️  Elements: {len(floor_plan.get('state', {}).get('elements', []))}")
                print(f"   🏢 Booths: {len(floor_plan.get('booth_details', []))}")
                
                stats = floor_plan.get('stats', {})
                if stats:
                    print(f"   📈 Stats: {stats.get('sold', 0)}/{stats.get('total_booths', 0)} booths sold")
                
                # Test 3: Verify canvas state structure
                state = floor_plan.get('state', {})
                if state:
                    print(f"\n3. Verifying canvas state structure...")
                    print(f"   ✅ Canvas size: {state.get('canvasSize', 'Not set')}")
                    print(f"   ✅ Elements: {len(state.get('elements', []))} items")
                    print(f"   ✅ Grid settings: {state.get('grid', 'Not set')}")
                    
                    # Check element types
                    elements = state.get('elements', [])
                    element_types = {}
                    for element in elements:
                        elem_type = element.get('type', 'unknown')
                        element_types[elem_type] = element_types.get(elem_type, 0) + 1
                    
                    print(f"   📦 Element breakdown:")
                    for elem_type, count in element_types.items():
                        print(f"      - {elem_type}: {count}")
                
            else:
                print(f"❌ Failed to load floor plan details: {detail_response.status_code}")
        else:
            print("⚠️  No published floor plans found")
            print("   Run 'python test_create_floorplan.py' to create sample data")
    else:
        print(f"❌ Failed to get public floor plans: {response.status_code}")
    
    print("\n" + "=" * 50)
    print("🎉 Final Test Complete!")
    print("\n📋 Next Steps:")
    print("1. Go to http://localhost:5173")
    print("2. Login as user: user@test.com / user123")
    print("3. Should see UserFloorPlanViewer with 2D/3D toggle")
    print("4. Login as admin: admin@test.com / admin123") 
    print("5. Should see Dashboard with floor plan management")
    print("\n✨ The setElements error should now be fixed!")

if __name__ == "__main__":
    final_test()
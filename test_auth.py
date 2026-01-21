#!/usr/bin/env python3
"""
Test authentication endpoints
"""
import requests
import json


def test_auth():
    """Test authentication flow"""
    base_url = "http://localhost:8000/api"
    
    print("🧪 Testing Authentication Flow\n")
    
    # Test 1: Login
    print("1. Testing login...")
    login_data = {
        "username": "admin",
        "password": "Admin@123"
    }
    
    try:
        response = requests.post(
            f"{base_url}/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get("access_token")
            print(f"✅ Login successful! Token: {access_token[:20]}...")
            
            # Test 2: Get user info
            print("\n2. Testing /auth/me endpoint...")
            headers = {"Authorization": f"Bearer {access_token}"}
            
            me_response = requests.get(f"{base_url}/auth/me", headers=headers)
            
            if me_response.status_code == 200:
                user_data = me_response.json()
                print(f"✅ User info retrieved successfully!")
                print(f"   Username: {user_data.get('username')}")
                print(f"   Email: {user_data.get('email')}")
                print(f"   Role ID: {user_data.get('role_id')}")
                if user_data.get('role'):
                    print(f"   Role Name: {user_data['role'].get('name')}")
                else:
                    print("   ⚠️  Role not loaded")
                
                return True
            else:
                print(f"❌ /auth/me failed: {me_response.status_code}")
                print(f"   Response: {me_response.text}")
                return False
                
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Is it running on port 8000?")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == "__main__":
    success = test_auth()
    
    if success:
        print("\n✅ All authentication tests passed!")
        print("\nYour backend is working correctly. You can now:")
        print("1. Open http://localhost:5174 in your browser")
        print("2. Login with: admin / Admin@123")
    else:
        print("\n❌ Authentication tests failed.")
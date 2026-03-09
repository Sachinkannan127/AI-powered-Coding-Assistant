#!/usr/bin/env python3
"""
Authentication Test Script
Tests registration, login, and profile endpoints
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def print_result(test_name, response):
    """Print test results"""
    print(f"\n{'='*60}")
    print(f"TEST: {test_name}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")
    print(f"{'='*60}\n")

def test_health():
    """Test backend health"""
    response = requests.get(f"{BASE_URL}/")
    print_result("Health Check", response)
    return response.status_code == 200

def test_register():
    """Test user registration"""
    test_user = {
        "username": f"testuser_{datetime.now().strftime('%H%M%S')}",
        "email": f"test_{datetime.now().strftime('%H%M%S')}@example.com",
        "password": "testpass123",
        "full_name": "Test User"
    }
    
    print(f"Registering user: {test_user['username']}")
    response = requests.post(f"{BASE_URL}/api/auth/register", json=test_user)
    print_result("User Registration", response)
    
    if response.status_code == 200:
        return test_user
    return None

def test_login(username, password):
    """Test user login"""
    credentials = {
        "username": username,
        "password": password
    }
    
    print(f"Logging in as: {username}")
    response = requests.post(f"{BASE_URL}/api/auth/login", json=credentials)
    print_result("User Login", response)
    
    if response.status_code == 200:
        return response.json().get("access_token")
    return None

def test_get_user(token):
    """Test get current user"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    print_result("Get Current User", response)
    return response.status_code == 200

def test_existing_user():
    """Test login with existing user"""
    print("\n" + "="*60)
    print("Testing with EXISTING USER: johndoe")
    print("="*60)
    
    token = test_login("johndoe", "securepass123")
    if token:
        test_get_user(token)
    else:
        print("❌ Failed to login with existing user")

def main():
    print("\n🚀 Starting Authentication Tests\n")
    
    # Test 1: Health Check
    if not test_health():
        print("❌ Backend is not running!")
        return
    
    print("✅ Backend is running\n")
    
    # Test 2: Test existing user login
    test_existing_user()
    
    # Test 3: Register new user
    new_user = test_register()
    
    if new_user:
        print("✅ Registration successful\n")
        
        # Test 4: Login with new user
        token = test_login(new_user["username"], new_user["password"])
        
        if token:
            print("✅ Login successful\n")
            
            # Test 5: Get user profile
            if test_get_user(token):
                print("✅ Profile retrieval successful\n")
            else:
                print("❌ Profile retrieval failed\n")
        else:
            print("❌ Login failed\n")
    else:
        print("❌ Registration failed\n")
    
    print("\n🏁 Tests Complete\n")

if __name__ == "__main__":
    main()

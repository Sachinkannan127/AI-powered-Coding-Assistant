import sys
sys.path.insert(0, 'backend')

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

print("Testing registration endpoint...")
response = client.post(
    "/api/auth/register",
    json={
        "username": "testuser_direct",
        "email": "testdirect@example.com",
        "password": "test123456",
        "full_name": "Test Direct"
    }
)

print(f"Status: {response.status_code}")
print(f"Response: {response.json() if response.status_code == 200 else response.text}")

if response.status_code != 200:
    print("\nTrying login with existing user...")
    login_response = client.post(
        "/api/auth/login",
        json={
            "username": "johndoe",
            "password": "securepass123"
        }
    )
    print(f"Login Status: {login_response.status_code}")
    print(f"Login Response: {login_response.json() if login_response.status_code == 200 else login_response.text}")

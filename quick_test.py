import requests
import traceback

try:
    print("Testing registration...")
    resp = requests.post(
        'http://localhost:8000/api/auth/register',
        json={
            'username': 'testuser999',
            'email': 'test999@example.com',
            'password': 'test123',
            'full_name': 'Test User'
        }
    )
    print(f'Status: {resp.status_code}')
    print(f'Response: {resp.text}')
except Exception as e:
    print(f'Error: {e}')
    traceback.print_exc()

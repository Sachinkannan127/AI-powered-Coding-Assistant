"""
Test code generation endpoint
"""
import requests
import json

# Test the code generation endpoint
def test_generate():
    url = "http://localhost:8000/api/generate"
    payload = {
        "prompt": "Create a simple hello world function",
        "language": "python",
        "max_tokens": 500
    }
    
    print("Testing code generation...")
    print(f"Request: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ SUCCESS!")
            print(f"\nGenerated Code:\n{result.get('code', 'N/A')}")
            print(f"\nExplanation:\n{result.get('explanation', 'N/A')}")
        else:
            print(f"\n❌ FAILED!")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"\n❌ ERROR: {e}")

if __name__ == "__main__":
    test_generate()

from dotenv import load_dotenv
import os

# Try loading from backend directory
load_dotenv('backend/.env')

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key loaded: {api_key[:20] if api_key else 'NOT FOUND'}...")
print(f"Full length: {len(api_key) if api_key else 0} characters")

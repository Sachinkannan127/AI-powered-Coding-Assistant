"""List available Gemini models"""
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("ERROR: GEMINI_API_KEY not found")
    exit(1)

genai.configure(api_key=api_key)

print("Available Gemini models:")
print("=" * 60)

try:
    for model in genai.list_models():
        if model.supported_generation_methods:
            print(f"✓ {model.name}")
            print(f"  Supported methods: {', '.join(model.supported_generation_methods)}")
            print()
except Exception as e:
    print(f"Error listing models: {e}")

"""Check available Gemini models"""
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("ERROR: No GEMINI_API_KEY found")
    exit(1)

client = genai.Client(api_key=api_key)

print("Available Gemini models:\n")
try:
    models = client.models.list()
    for model in models:
        print(f"✓ {model.name}")
        print(f"  Display Name: {model.display_name}")
        print()
except Exception as e:
    print(f"Error listing models: {e}")

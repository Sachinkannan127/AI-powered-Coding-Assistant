"""Quick test to verify Groq API is working"""
import asyncio
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')

async def test_groq():
    from backend.ai_engine import call_groq_api
    
    api_key = os.getenv('GROQ_API_KEY')
    print(f"Testing Groq API with key: {api_key[:20]}...")
    
    result = await call_groq_api(api_key, "Say 'Hello from Groq!' and confirm you're working.")
    
    if result.startswith("Error:"):
        print(f"❌ FAILED: {result}")
    else:
        print(f"✅ SUCCESS: {result[:100]}...")
    
    return result

if __name__ == "__main__":
    asyncio.run(test_groq())

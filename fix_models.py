"""Fix all Gemini model names"""
import re

# Read the file
with open('backend/ai_engine.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all occurrences
content = content.replace("GenerativeModel('gemini-pro')", "GenerativeModel('models/gemini-2.0-flash-exp')")

# Write back
with open('backend/ai_engine.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Updated all Gemini model names to 'models/gemini-2.0-flash-exp'")

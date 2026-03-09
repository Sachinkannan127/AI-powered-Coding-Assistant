"""Fix model name to stable version"""

# Read the file
with open('backend/ai_engine.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace with stable model
content = content.replace("GenerativeModel('models/gemini-2.0-flash-exp')", "GenerativeModel('gemini-1.5-flash')")

# Write back
with open('backend/ai_engine.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Updated to stable Gemini 1.5 Flash model")

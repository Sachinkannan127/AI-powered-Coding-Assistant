"""Update to correct model name"""

# Read the file
with open('backend/ai_engine.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace with correct model name that includes models/ prefix
content = content.replace("'gemini-1.5-flash'", "'models/gemini-2.0-flash'")

# Write back
with open('backend/ai_engine.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Updated to models/gemini-2.0-flash (with correct prefix)")

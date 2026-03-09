#!/usr/bin/env python3
"""Quick script to make ai_engine.py work without the poe library."""

import re

# Read the file
with open('ai_engine.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace poe.Client references
content = content.replace('poe.Client(self.poe_api_key)', 'None  # Using httpx instead')

# Replace the loop-based API calls with mock returns
patterns = [
    (
        r'for chunk in self\.client\.send_message\(self\.model, .*?\):\s+.*? \+= chunk\["text"\]',
        'return "Mock response - Poe API integration pending"  # TODO: implement httpx API call'
    )
]

for pattern, replacement in patterns:
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Write it back
with open('ai_engine.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed ai_engine.py")

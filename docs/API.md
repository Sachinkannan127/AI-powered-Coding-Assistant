# API Documentation

## Base URL

```
http://localhost:8000
```

## Authentication

Currently, no authentication is required for local development. For production, implement JWT or API key authentication.

---

## Endpoints

### 1. Health Check

**GET** `/`

Check if the API is running.

**Response:**
```json
{
  "status": "online",
  "service": "Smart DevCopilot API",
  "version": "1.0.0",
  "timestamp": "2026-02-16T12:00:00"
}
```

---

### 2. Generate Code

**POST** `/api/generate`

Generate code from natural language description.

**Request Body:**
```json
{
  "prompt": "Build a REST API for customer data",
  "language": "python",
  "context": "# Existing code context (optional)",
  "max_tokens": 1000
}
```

**Response:**
```json
{
  "code": "from fastapi import APIRouter...",
  "explanation": "This code creates a REST API...",
  "optimization_tips": [
    "Consider edge cases and error handling",
    "Add input validation"
  ],
  "documentation": "# Generated Code Documentation..."
}
```

---

### 3. Debug Code

**POST** `/api/debug`

Analyze code and provide debugging suggestions.

**Request Body:**
```json
{
  "code": "def add(a, b):\n    return a + b",
  "language": "python",
  "error_message": "TypeError: unsupported operand type(s) (optional)"
}
```

**Response:**
```json
{
  "suggestions": [
    {
      "issue": "Missing type validation",
      "line": 2,
      "severity": "medium",
      "description": "Add type checking for parameters"
    }
  ],
  "explanations": [
    "The function should validate input types",
    "Consider edge cases like None values"
  ],
  "fixed_code": "def add(a, b):\n    if not isinstance(a, (int, float))...\n"
}
```

---

### 4. Security Scan

**POST** `/api/security-scan`

Scan code for security vulnerabilities.

**Request Body:**
```json
{
  "code": "import os\nos.system('ls -la')",
  "language": "python",
  "file_path": "/path/to/file.py (optional)"
}
```

**Response:**
```json
{
  "vulnerabilities": [
    {
      "pattern": "os.system(",
      "description": "Command injection risk",
      "severity": "high",
      "line": 2
    }
  ],
  "severity_levels": {
    "critical": 0,
    "high": 1,
    "medium": 0,
    "low": 0
  },
  "recommendations": [
    "Use parameterized queries to prevent SQL injection",
    "Sanitize user inputs"
  ],
  "ai_analysis": "Detailed AI analysis of security issues..."
}
```

---

### 5. Semantic Search

**GET** `/api/semantic-search`

Search code snippets using natural language.

**Query Parameters:**
- `query` (required): Search query
- `language` (optional): Filter by language
- `limit` (optional): Maximum results (default: 5)

**Example:**
```
GET /api/semantic-search?query=authentication&language=python&limit=5
```

**Response:**
```json
{
  "results": [
    {
      "code": "def authenticate_user(username, password)...",
      "description": "User authentication function",
      "language": "python",
      "score": 0.89
    }
  ]
}
```

---

### 6. Supported Languages

**GET** `/api/languages`

Get list of supported programming languages.

**Response:**
```json
{
  "languages": [
    "python",
    "javascript",
    "typescript",
    "java",
    "csharp",
    "go",
    "rust",
    "cpp",
    "ruby",
    "php",
    "swift",
    "kotlin"
  ]
}
```

---

## WebSocket Endpoint

### Real-time Code Assistance

**WebSocket** `/ws/realtime`

Connect for real-time code generation, debugging, and security scanning.

**Connection:**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/realtime');
```

**Send Message:**
```json
{
  "action": "generate",
  "prompt": "Create a function to sort an array",
  "language": "javascript"
}
```

**Receive Message:**
```json
{
  "type": "generation",
  "data": {
    "code": "function sortArray(arr) {...}",
    "explanation": "..."
  }
}
```

**Supported Actions:**
- `generate` - Code generation
- `debug` - Code debugging
- `security` - Security scanning

---

## Error Handling

All endpoints return standard HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid input)
- `500` - Internal Server Error

**Error Response Format:**
```json
{
  "detail": "Error message description"
}
```

---

## Rate Limiting

For production deployments, implement rate limiting:

- 100 requests per minute per IP
- 1000 requests per hour per API key

---

## Examples

### Python

```python
import requests

# Generate code
response = requests.post(
    "http://localhost:8000/api/generate",
    json={
        "prompt": "Create a binary search function",
        "language": "python",
        "max_tokens": 500
    }
)

data = response.json()
print(data["code"])
```

### JavaScript

```javascript
const axios = require('axios');

async function generateCode() {
  const response = await axios.post(
    'http://localhost:8000/api/generate',
    {
      prompt: 'Create a function to validate email',
      language: 'javascript',
      max_tokens: 500
    }
  );
  
  console.log(response.data.code);
}
```

### cURL

```bash
curl -X POST "http://localhost:8000/api/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a function to merge two sorted arrays",
    "language": "python",
    "max_tokens": 500
  }'
```

---

## Interactive Documentation

Visit `http://localhost:8000/docs` for interactive Swagger UI documentation where you can test all endpoints directly in your browser.

# Quick Start Guide - Smart DevCopilot

This guide will help you get Smart DevCopilot up and running in under 10 minutes.

## Prerequisites Checklist

- [ ] Python 3.11 or higher installed
- [ ] Docker Desktop installed and running
- [ ] VS Code installed
- [ ] OpenAI API key (or plan to use local models)

## Step-by-Step Setup

### 1. Get the Code

```bash
git clone https://github.com/yourusername/AI-powered-Coding-Assistant.git
cd AI-powered-Coding-Assistant
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```ini
OPENAI_API_KEY=sk-your-api-key-here
```

### 3. Start with Docker (Easiest)

```bash
# From project root
docker-compose up -d
```

Wait about 30 seconds for services to start, then verify:
```bash
curl http://localhost:8000
```

You should see:
```json
{
  "status": "online",
  "service": "Smart DevCopilot API"
}
```

### 4. Install VS Code Extension

```bash
cd vscode-extension
npm install
npm run compile
```

Open VS Code:
```bash
code .
```

Press `F5` to launch the Extension Development Host.

### 5. Test the Extension

In the new VS Code window:

1. **Create a test file**: `test.py`

2. **Generate code**: Press `Ctrl+Shift+G` (Cmd+Shift+G on Mac)
   - Enter: "Create a function to calculate fibonacci numbers"
   - Watch as code is generated!

3. **Debug code**: Press `Ctrl+Shift+D`
   - Get instant suggestions

4. **Security scan**: Save the file
   - Auto-scan detects issues

## Alternative: Manual Setup (No Docker)

### Backend Only

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python database.py

# Run server
uvicorn main:app --reload
```

### Verify Installation

Open browser: `http://localhost:8000/docs`

You should see the interactive API documentation.

## Configuration Options

### Use Local AI Models (No API Key Required)

In `.env`:
```ini
USE_LOCAL_MODEL=true
```

This will download and use StarCoder (requires ~13GB disk space and GPU recommended).

### Adjust Extension Settings

In VS Code:
1. Press `Ctrl+,` (Settings)
2. Search "Smart DevCopilot"
3. Configure:
   - API URL
   - Enable/disable real-time features
   - Auto-scan on save
   - Preferred languages

## Common Commands

### Backend

```bash
# Start server
uvicorn main:app --reload

# Run tests
pytest test_api.py -v

# Initialize database
python database.py
```

### Extension

```bash
# Compile TypeScript
npm run compile

# Watch mode (auto-compile)
npm run watch

# Run tests
npm test
```

### Docker

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend

# Restart backend only
docker-compose restart backend
```

## Troubleshooting

### Backend won't start

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
pip install -r requirements.txt
```

### Extension not working

**Error**: Extension commands not showing

**Solution**:
1. Ensure backend is running on `http://localhost:8000`
2. Check extension settings: `Ctrl+,` → Search "Smart DevCopilot"
3. Restart VS Code

### Database connection error

**Error**: `could not connect to server: Connection refused`

**Solution**:
```bash
# Using Docker
docker-compose up -d postgres

# Check status
docker-compose ps
```

### WebSocket connection failed

**Solution**:
- Check firewall settings
- Ensure port 8000 is not blocked
- Verify backend is running: `curl http://localhost:8000`

## Next Steps

1. **Read the full documentation**: [docs/API.md](docs/API.md)
2. **Try example requests**: See [Usage Examples](#usage-examples)
3. **Customize prompts**: Edit `ai_engine.py`
4. **Deploy to production**: Run `./deploy.sh prod`

## Usage Examples

### Generate a REST API

In VS Code, press `Ctrl+Shift+G` and enter:
```
Create a REST API with these endpoints:
- GET /users - list all users
- POST /users - create user
- PUT /users/:id - update user
- DELETE /users/:id - delete user
```

### Debug a function

Select this buggy code:
```python
def divide(a, b):
    return a / b
```

Press `Ctrl+Shift+D` to get suggestions about error handling.

### API Call Example

```python
import requests

response = requests.post("http://localhost:8000/api/generate", json={
    "prompt": "Create a binary search tree class",
    "language": "python",
    "max_tokens": 1000
})

print(response.json()["code"])
```

## Getting Help

- 📚 Documentation: [README.md](README.md)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/AI-powered-Coding-Assistant/issues)
- 💬 Discord: [Community Chat](https://discord.gg/devcopilot)
- 📧 Email: support@devcopilot.example.com

---

**Congratulations! You're ready to use Smart DevCopilot! 🎉**

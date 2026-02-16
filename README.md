# Smart DevCopilot - AI-Powered Coding Assistant

<div align="center">

**Go beyond autocomplete with AI that understands context, architecture, and business logic**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1+-blue.svg)](https://www.typescriptlang.org/)

[Features](#features) • [Quick Start](#quick-start) • [Architecture](#architecture) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## 🚀 Overview

Smart DevCopilot is an advanced AI-powered coding assistant that goes far beyond simple autocomplete. It understands your codebase context, suggests optimizations, detects security vulnerabilities in real-time, and can even create pull requests automatically.

### Key Features

✨ **Natural Language Code Generation**
- Transform descriptions like "Build a REST API for customer data" into working code
- Supports 12+ programming languages
- Context-aware generation using your existing codebase

🐛 **Intelligent Debugging**
- Real-time bug detection and fixes
- Step-by-step explanations of issues
- Automated code repair suggestions

🔒 **Security Scanning**
- Detect vulnerabilities as you type
- OWASP-compliant security checks
- Severity-based issue reporting

🔍 **Semantic Code Search**
- Find code snippets using natural language
- Vector-based similarity search
- Language-specific filtering

🤖 **GitHub/GitLab Integration**
- Automated pull request creation
- AI-generated commit messages
- Code review assistance

📚 **Auto-Documentation**
- Generate comprehensive documentation
- Explain algorithms step-by-step
- Maintain code comments automatically

---

## 🎯 Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **Google Gemini API** - Advanced AI for code generation, debugging, and security analysis
- **PostgreSQL** - Persistent storage
- **FAISS / Pinecone** - Vector database for semantic search (optional)
- **WebSockets** - Real-time bidirectional communication

### Web Frontend
- **React 18** with TypeScript - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client for API communication
- **React Syntax Highlighter** - Beautiful code display

### IDE Extension
- **VS Code Extension API** - Native IDE integration
- **TypeScript** - Type-safe extension development
- **WebSocket Client** - Real-time updates

### Deployment
- **Docker & Docker Compose** - Containerization
- **Kubernetes** - Production orchestration
- **Nginx** - Reverse proxy and load balancing
- **Azure / AWS / GCP** - Cloud hosting

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (optional)
- VS Code (for extension development)
- Google Gemini API key (get from https://aistudio.google.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/AI-powered-Coding-Assistant.git
cd AI-powered-Coding-Assistant
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Initialize database (optional - uses mock data if not configured)
python database.py

# Run the server
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### 3. Web Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The web app will be available at `http://localhost:3000`

### 4. VS Code Extension Setup

```bash
cd v5. Docker Deployment (Optional

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Open in VS Code
code .

# Press F5 to launch Extension Development Host
```

### 4. Docker Deployment (Recommended)

```bash
# From project root
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
```

---

## 📖 Usage Examples

### Generate Code from Natural Language

```typescript
// In VS Code, press Ctrl+Shift+G (Cmd+Shift+G on Mac)
// Enter: "Create a REST API endpoint for user authentication with JWT"
```

**Result:**
```python
from fastapi import APIRouter, Depends, HTTPException
from jose import jwt
from passlib.context import CryptContext

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"])

@router.post("/auth/login")
async def login(username: str, password: str):
    # Authenticate user
    user = await get_user(username)
    if not user or not pwd_context.verify(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate JWT token
    token = jwt.encode({"sub": user.id}, SECRET_KEY, algorithm="HS256")
    return {"access_token": token, "token_type": "bearer"}
```

### Debug Code

```typescript
// Select buggy code and press Ctrl+Shift+D
// Get instant suggestions with explanations
```

### Security Scan

```typescript
// Automatic on save, or manually trigger
// Detects SQL injection, XSS, code injection, etc.
```

### API Usage

```python
import requests

# Generate code
response = requests.post("http://localhost:8000/api/generate", json={
    "prompt": "Create a function to validate email addresses",
    "language": "python",
    "max_tokens": 500
})

result = response.json()
print(result["code"])
print(result["explanation"])
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     VS Code Extension                        │
│  (TypeScript - Real-time UI & IDE Integration)              │
└────────────────┬────────────────────────────────────────────┘
                 │ WebSocket / HTTP
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                      Nginx (Reverse Proxy)                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend                           │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ Code Gen     │  │ Debugger     │  │ Security Scanner│   │
│  │ Engine       │  │ Analyzer     │  │                 │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
└────────────────┬───────────┬─────────────┬──────────────────┘
                 │           │             │
        ┌────────▼───┐  ┌───▼──────┐  ┌──▼────────────┐
        │ OpenAI/    │  │PostgreSQL│  │ FAISS/Pinecone│
        │ Hugging    │  │          │  │ Vector DB     │
        │ Face       │  │          │  │               │
        └────────────┘  └──────────┘  └───────────────┘
```

---

## 📝 Project Structure

```
AI-powered-Coding-Assistant/
├── backend/                    # FastAPI backend
│   ├── main.py                # API endpoints
│   ├── ai_engine.py           # AI/ML core logic
│   ├── database.py            # Database models
│   ├── vector_search.py       # Semantic search
│   ├── git_integration.py     # GitHub/GitLab integration
│   ├── requirements.txt       # Python dependencies
│   └── test_api.py            # Unit tests
├── vscode-extension/          # VS Code extension
│   ├── src/extension.ts       # Extension entry point
│   ├── package.json           # Extension manifest
│   └── tsconfig.json          # TypeScript config
├── k8s/                       # Kubernetes manifests
│   ├── deployment.yaml        # K8s deployment
│   └── config.yaml            # ConfigMaps & Secrets
├── docs/                      # Documentation
│   └── API.md                 # API documentation
├── docker-compose.yml         # Docker orchestration
└── README.md                  # This file
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest test_api.py -v

# Extension tests
cd vscode-extension
npm test
```

---

## 📦 Deployment

See [docs/API.md](docs/API.md) for full API documentation.

```bash
# Local development
docker-compose up -d

# Production (Kubernetes)
./deploy.sh prod
```

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

- 📧 Email: support@devcopilot.example.com
- 💬 Discord: [Join our community](https://discord.gg/devcopilot)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/AI-powered-Coding-Assistant/issues)

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by the Smart DevCopilot Team

</div>
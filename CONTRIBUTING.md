# Contributing to Smart DevCopilot

Thank you for your interest in contributing to Smart DevCopilot! This document provides guidelines and instructions for contributing.

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**Bug Report Template:**

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. Windows 11]
- VS Code Version: [e.g. 1.80.0]
- Extension Version: [e.g. 1.0.0]
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues.

**Enhancement Template:**

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features.

**Additional context**
Any other context or screenshots.
```

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/AI-powered-Coding-Assistant.git
   cd AI-powered-Coding-Assistant
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add tests for new features
   - Update documentation

4. **Test your changes**
   ```bash
   # Backend tests
   cd backend
   pytest test_api.py -v
   
   # Extension tests
   cd vscode-extension
   npm test
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   ```

   **Commit Message Format:**
   ```
   <type>: <subject>
   
   <body>
   
   <footer>
   ```
   
   **Types:**
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation changes
   - `style`: Code style changes
   - `refactor`: Code refactoring
   - `test`: Adding tests
   - `chore`: Maintenance tasks

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill in the PR template

**Pull Request Template:**

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

## Development Setup

### Backend Development

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install development dependencies
pip install pytest pytest-asyncio black flake8 mypy

# Run linting
black .
flake8 .
mypy .
```

### Extension Development

```bash
cd vscode-extension

# Install dependencies
npm install

# Lint code
npm run lint

# Compile
npm run compile

# Watch mode
npm run watch
```

## Code Style Guidelines

### Python (Backend)

- Follow PEP 8
- Use type hints
- Maximum line length: 100 characters
- Use Black for formatting
- Use meaningful variable names

```python
# Good
async def generate_code(
    prompt: str, 
    language: str, 
    max_tokens: int = 1000
) -> Dict[str, Any]:
    """Generate code from natural language prompt."""
    pass

# Bad
def gen(p, l, m=1000):
    pass
```

### TypeScript (Extension)

- Follow TypeScript best practices
- Use ESLint
- Prefer `const` over `let`
- Use async/await over promises
- Add JSDoc comments for public APIs

```typescript
// Good
async function generateCode(prompt: string, language: string): Promise<string> {
    const response = await axios.post(API_URL, { prompt, language });
    return response.data.code;
}

// Bad
function genCode(p, l) {
    return axios.post(url, {p, l}).then(r => r.data.code);
}
```

## Testing Guidelines

### Backend Tests

```python
import pytest
from fastapi.testclient import TestClient

def test_generate_code():
    """Test code generation endpoint."""
    response = client.post("/api/generate", json={
        "prompt": "Create a function",
        "language": "python"
    })
    assert response.status_code == 200
    assert "code" in response.json()
```

### Extension Tests

```typescript
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
    test('Generate code command exists', async () => {
        const commands = await vscode.commands.getCommands();
        assert.ok(commands.includes('smartDevCopilot.generateCode'));
    });
});
```

## Documentation

- Update README.md for new features
- Add API documentation for new endpoints
- Include code examples
- Update changelog

## Project Structure

```
AI-powered-Coding-Assistant/
├── backend/                 # FastAPI backend
│   ├── main.py             # API endpoints
│   ├── ai_engine.py        # AI logic
│   ├── database.py         # Database models
│   ├── vector_search.py    # Semantic search
│   ├── git_integration.py  # GitHub/GitLab
│   └── test_api.py         # Tests
├── vscode-extension/        # VS Code extension
│   ├── src/
│   │   └── extension.ts    # Main extension code
│   ├── package.json        # Extension manifest
│   └── tsconfig.json       # TypeScript config
├── k8s/                     # Kubernetes configs
├── docs/                    # Documentation
└── docker-compose.yml       # Docker setup
```

## Questions?

- 💬 Join our [Discord](https://discord.gg/devcopilot)
- 📧 Email: dev@devcopilot.example.com
- 🐛 [GitHub Issues](https://github.com/yourusername/AI-powered-Coding-Assistant/issues)

Thank you for contributing! 🎉

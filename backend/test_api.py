"""
Unit tests for Smart DevCopilot backend
"""

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"


def test_generate_code():
    """Test code generation endpoint"""
    request_data = {
        "prompt": "Create a function to add two numbers",
        "language": "python",
        "max_tokens": 500
    }
    
    response = client.post("/api/generate", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "code" in data
    assert "explanation" in data
    assert "optimization_tips" in data


def test_debug_code():
    """Test code debugging endpoint"""
    request_data = {
        "code": "def add(a, b):\n    return a + b",
        "language": "python"
    }
    
    response = client.post("/api/debug", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "suggestions" in data
    assert "explanations" in data


def test_security_scan():
    """Test security scanning endpoint"""
    request_data = {
        "code": "import os\nos.system('ls -la')",
        "language": "python"
    }
    
    response = client.post("/api/security-scan", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "vulnerabilities" in data
    assert "severity_levels" in data


def test_semantic_search():
    """Test semantic search endpoint"""
    response = client.get("/api/semantic-search?query=authentication&limit=5")
    assert response.status_code == 200
    
    data = response.json()
    assert "results" in data


def test_supported_languages():
    """Test supported languages endpoint"""
    response = client.get("/api/languages")
    assert response.status_code == 200
    
    data = response.json()
    assert "languages" in data
    assert "python" in data["languages"]
    assert "javascript" in data["languages"]


def test_invalid_code_generation():
    """Test error handling for invalid requests"""
    request_data = {
        "prompt": "",  # Empty prompt
        "language": "python"
    }
    
    response = client.post("/api/generate", json=request_data)
    # Should handle gracefully
    assert response.status_code in [200, 400, 500]


# Integration tests
@pytest.mark.asyncio
async def test_vector_store():
    """Test vector store functionality"""
    from vector_search import VectorStore
    
    store = VectorStore(use_pinecone=False)
    
    # Store a snippet
    snippet_id = await store.store_snippet(
        code="def hello():\n    print('Hello')",
        description="A simple hello function",
        language="python"
    )
    
    assert snippet_id is not None
    
    # Search for it
    results = await store.search(
        query="hello function",
        language="python",
        limit=5
    )
    
    assert len(results) > 0


@pytest.mark.asyncio
async def test_ai_engine():
    """Test AI engine components"""
    from ai_engine import CodeGenerator
    
    generator = CodeGenerator()
    
    result = await generator.generate(
        prompt="Create a function to calculate factorial",
        language="python",
        max_tokens=500
    )
    
    assert "code" in result
    assert "explanation" in result


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

"""
Smart DevCopilot - AI-Powered Coding Assistant Backend
FastAPI server with AI integration for code generation, debugging, and security analysis
"""

from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env file

from fastapi import FastAPI, WebSocket, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
import asyncio
import json
from datetime import datetime

from ai_engine import (
    CodeGenerator, 
    DebugAnalyzer, 
    SecurityScanner,
    CodeReviewer,
    CodeRefactorer,
    TestGenerator,
    PerformanceOptimizer,
    DocumentationGenerator
)
from database import SessionLocal, get_db, User
from models import CodeSnippet, UserPreference
from vector_search import VectorStore
from auth import (
    create_access_token, 
    get_password_hash, 
    verify_password, 
    get_current_user,
    optional_auth
)

app = FastAPI(
    title="Smart DevCopilot API",
    description="AI-Powered Coding Assistant Backend",
    version="1.0.0"
)

# CORS middleware for IDE integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI components
code_generator = CodeGenerator()
debug_analyzer = DebugAnalyzer()
security_scanner = SecurityScanner()
vector_store = VectorStore()
code_reviewer = CodeReviewer()
code_refactorer = CodeRefactorer()
test_generator = TestGenerator()
performance_optimizer = PerformanceOptimizer()
documentation_generator = DocumentationGenerator()


# Pydantic models
class CodeGenerationRequest(BaseModel):
    prompt: str
    language: str
    context: Optional[str] = None
    max_tokens: int = 1000


class DebugRequest(BaseModel):
    code: str
    language: str
    error_message: Optional[str] = None


class SecurityScanRequest(BaseModel):
    code: str
    language: str
    file_path: Optional[str] = None


class CodeReviewRequest(BaseModel):
    code: str
    language: str
    context: Optional[str] = None


class RefactorRequest(BaseModel):
    code: str
    language: str
    refactor_type: str = "general"  # general, performance, clean_code, design_patterns, simplify


class TestGenerationRequest(BaseModel):
    code: str
    language: str
    test_framework: Optional[str] = None


class OptimizationRequest(BaseModel):
    code: str
    language: str
    context: Optional[str] = None


class DocumentationRequest(BaseModel):
    code: str
    language: str
    doc_type: str = "comprehensive"  # comprehensive, inline, api, readme, tutorial


# Authentication models
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    is_active: bool
    created_at: datetime


class CodeGenerationResponse(BaseModel):
    code: str
    explanation: str
    optimization_tips: List[str]
    documentation: str


class DebugResponse(BaseModel):
    analysis: str
    suggestions: List[str]
    fixed_code: Optional[str]
    severity: str


class SecurityIssue(BaseModel):
    type: str
    severity: str
    line: int
    description: str
    recommendation: str


class SecurityResponse(BaseModel):
    issues: List[SecurityIssue]
    overall_risk: str
    recommendations: List[str]


# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Smart DevCopilot API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }


# Authentication endpoints
@app.post("/api/auth/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username or email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@app.post("/api/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login and get access token"""
    # Find user
    user = db.query(User).filter(User.username == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    # Create access token
    access_token = create_access_token(
        data={
            "sub": user.username,
            "user_id": user.id,
            "email": user.email
        }
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current user information"""
    user = db.query(User).filter(User.username == current_user["username"]).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


@app.post("/api/generate", response_model=CodeGenerationResponse)
async def generate_code(request: CodeGenerationRequest, current_user: Optional[dict] = Depends(optional_auth)):
    """
    Generate code from natural language description
    Example: "Build a REST API for customer data"
    """
    try:
        # Generate code using AI model
        result = await code_generator.generate(
            prompt=request.prompt,
            language=request.language,
            context=request.context,
            max_tokens=request.max_tokens
        )
        
        # Store in vector database for semantic search
        await vector_store.store_snippet(
            code=result["code"],
            description=request.prompt,
            language=request.language
        )
        
        return CodeGenerationResponse(
            code=result["code"],
            explanation=result["explanation"],
            optimization_tips=result["optimization_tips"],
            documentation=result["documentation"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code generation failed: {str(e)}")


@app.post("/api/debug", response_model=DebugResponse)
async def debug_code(request: DebugRequest):
    """
    Analyze code and provide debugging suggestions with explanations
    """
    try:
        analysis = await debug_analyzer.analyze(
            code=request.code,
            language=request.language,
            error_message=request.error_message
        )
        
        return DebugResponse(
            analysis=analysis["analysis"],
            suggestions=analysis["suggestions"],
            fixed_code=analysis.get("fixed_code"),
            severity=analysis["severity"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Debug analysis failed: {str(e)}")


@app.post("/api/security-scan", response_model=SecurityResponse)
async def scan_security(request: SecurityScanRequest):
    """
    Detect security vulnerabilities in code as you type
    """
    try:
        scan_results = await security_scanner.scan(
            code=request.code,
            language=request.language,
            file_path=request.file_path
        )
        
        return SecurityResponse(
            issues=scan_results["issues"],
            overall_risk=scan_results["overall_risk"],
            recommendations=scan_results["recommendations"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Security scan failed: {str(e)}")


@app.get("/api/semantic-search")
async def semantic_search(query: str, language: Optional[str] = None, limit: int = 5):
    """
    Search code snippets using semantic similarity
    """
    try:
        results = await vector_store.search(
            query=query,
            language=language,
            limit=limit
        )
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@app.websocket("/ws/realtime")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time code assistance
    """
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            action = message.get("action")
            
            if action == "generate":
                result = await code_generator.generate(
                    prompt=message["prompt"],
                    language=message["language"],
                    context=message.get("context")
                )
                await manager.send_personal_message(
                    json.dumps({"type": "generation", "data": result}),
                    websocket
                )
            
            elif action == "debug":
                analysis = await debug_analyzer.analyze(
                    code=message["code"],
                    language=message["language"],
                    error_message=message.get("error_message")
                )
                await manager.send_personal_message(
                    json.dumps({"type": "debug", "data": analysis}),
                    websocket
                )
            
            elif action == "security":
                scan = await security_scanner.scan(
                    code=message["code"],
                    language=message["language"]
                )
                await manager.send_personal_message(
                    json.dumps({"type": "security", "data": scan}),
                    websocket
                )
                
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        manager.disconnect(websocket)


@app.post("/api/review")
async def review_code(request: CodeReviewRequest):
    """
    AI-powered code review with best practices and suggestions
    """
    try:
        review_result = await code_reviewer.review(
            code=request.code,
            language=request.language,
            context=request.context
        )
        return review_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code review failed: {str(e)}")


@app.post("/api/refactor")
async def refactor_code(request: RefactorRequest):
    """
    AI-powered code refactoring for better quality and maintainability
    """
    try:
        refactor_result = await code_refactorer.refactor(
            code=request.code,
            language=request.language,
            refactor_type=request.refactor_type
        )
        return refactor_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code refactoring failed: {str(e)}")


@app.post("/api/generate-tests")
async def generate_tests(request: TestGenerationRequest):
    """
    AI-powered test case generation with comprehensive coverage
    """
    try:
        test_result = await test_generator.generate_tests(
            code=request.code,
            language=request.language,
            test_framework=request.test_framework
        )
        return test_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Test generation failed: {str(e)}")


@app.post("/api/optimize")
async def optimize_code(request: OptimizationRequest):
    """
    AI-powered performance optimization and analysis
    """
    try:
        optimization_result = await performance_optimizer.optimize(
            code=request.code,
            language=request.language,
            context=request.context
        )
        return optimization_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Performance optimization failed: {str(e)}")


@app.post("/api/generate-docs")
async def generate_documentation(request: DocumentationRequest):
    """
    AI-powered documentation generation
    """
    try:
        docs_result = await documentation_generator.generate_docs(
            code=request.code,
            language=request.language,
            doc_type=request.doc_type
        )
        return docs_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Documentation generation failed: {str(e)}")


@app.get("/api/languages")
async def get_supported_languages():
    """
    Get list of supported programming languages
    """
    return {
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

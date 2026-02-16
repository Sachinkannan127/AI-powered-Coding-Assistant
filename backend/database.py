"""
Database models and configuration
PostgreSQL with SQLAlchemy ORM
"""

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Database URL from environment variable
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./devcopilot.db"  # Default to SQLite for development
)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False,bind=engine)
Base = declarative_base()


def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Database models
class User(Base):
    """User authentication and profile"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CodeSnippet(Base):
    """Store generated code snippets"""
    __tablename__ = "code_snippets"
    
    id = Column(Integer, primary_key=True, index=True)
    prompt = Column(Text, nullable=False)
    language = Column(String(50), nullable=False)
    code = Column(Text, nullable=False)
    explanation = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String(100))
    extra_metadata = Column(JSON)


class UserPreference(Base):
    """Store user preferences and settings"""
    __tablename__ = "user_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), unique=True, nullable=False)
    preferences = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DebugSession(Base):
    """Track debugging sessions"""
    __tablename__ = "debug_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100))
    original_code = Column(Text, nullable=False)
    fixed_code = Column(Text)
    language = Column(String(50))
    error_message = Column(Text)
    suggestions = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)


class SecurityScan(Base):
    """Log security scans"""
    __tablename__ = "security_scans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100))
    code = Column(Text, nullable=False)
    language = Column(String(50))
    vulnerabilities = Column(JSON)
    severity_summary = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)


# Create all tables
def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("Database initialized successfully!")

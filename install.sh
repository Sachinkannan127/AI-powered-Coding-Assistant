#!/bin/bash

# Linux/Mac installation script for Smart DevCopilot

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${GREEN}Smart DevCopilot - Installation Script${NC}"
echo "========================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Python
echo -e "${CYAN}Checking Python installation...${NC}"
if command_exists python3; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓ $PYTHON_VERSION found${NC}"
else
    echo -e "${RED}✗ Python 3 not found${NC}"
    echo -e "${YELLOW}Please install Python 3.11+ from https://www.python.org/${NC}"
    exit 1
fi

# Check Node.js
echo -e "${CYAN}Checking Node.js installation...${NC}"
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js $NODE_VERSION found${NC}"
else
    echo -e "${RED}✗ Node.js not found${NC}"
    echo -e "${YELLOW}Please install Node.js from https://nodejs.org/${NC}"
    exit 1
fi

# Check Docker
echo -e "${CYAN}Checking Docker installation...${NC}"
if command_exists docker; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✓ $DOCKER_VERSION found${NC}"
else
    echo -e "${YELLOW}✗ Docker not found (optional)${NC}"
fi

# Check Git
echo -e "${CYAN}Checking Git installation...${NC}"
if command_exists git; then
    GIT_VERSION=$(git --version)
    echo -e "${GREEN}✓ $GIT_VERSION found${NC}"
else
    echo -e "${YELLOW}✗ Git not found${NC}"
fi

echo ""
echo -e "${CYAN}Setting up backend...${NC}"

# Navigate to backend directory
cd backend

# Create virtual environment
echo -e "${CYAN}Creating Python virtual environment...${NC}"
python3 -m venv venv

# Activate virtual environment
echo -e "${CYAN}Activating virtual environment...${NC}"
source venv/bin/activate

# Install Python dependencies
echo -e "${CYAN}Installing Python dependencies...${NC}"
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
if [ ! -f .env ]; then
    echo -e "${CYAN}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please edit backend/.env and add your API keys${NC}"
fi

# Initialize database
echo -e "${CYAN}Initializing database...${NC}"
python database.py

echo ""
echo -e "${CYAN}Setting up VS Code extension...${NC}"

# Navigate to extension directory
cd ../vscode-extension

# Install Node dependencies
echo -e "${CYAN}Installing Node.js dependencies...${NC}"
npm install

# Compile TypeScript
echo -e "${CYAN}Compiling TypeScript...${NC}"
npm run compile

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Installation Complete! 🎉${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo -e "1. Edit backend/.env and add your OpenAI API key"
echo -e "2. Start the backend:"
echo -e "   cd backend"
echo -e "   source venv/bin/activate"
echo -e "   uvicorn main:app --reload"
echo ""
echo -e "3. Or use Docker:"
echo -e "   docker-compose up -d"
echo ""
echo -e "4. Open VS Code extension:"
echo -e "   cd vscode-extension"
echo -e "   code ."
echo -e "   Press F5 to launch"
echo ""
echo -e "${CYAN}Documentation: README.md${NC}"
echo -e "${CYAN}Quick Start: QUICKSTART.md${NC}"
echo ""

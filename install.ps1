# Windows PowerShell installation script for Smart DevCopilot
# Run this script as Administrator

Write-Host "Smart DevCopilot - Windows Installation Script" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Check if running as Administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Function to check if a command exists
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Check Python
Write-Host "Checking Python installation..." -ForegroundColor Cyan
if (Test-Command python) {
    $pythonVersion = python --version
    Write-Host "✓ $pythonVersion found" -ForegroundColor Green
} else {
    Write-Host "✗ Python not found" -ForegroundColor Red
    Write-Host "Please install Python 3.11+ from https://www.python.org/" -ForegroundColor Yellow
    exit 1
}

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Cyan
if (Test-Command node) {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check Docker
Write-Host "Checking Docker installation..." -ForegroundColor Cyan
if (Test-Command docker) {
    $dockerVersion = docker --version
    Write-Host "✓ $dockerVersion found" -ForegroundColor Green
} else {
    Write-Host "✗ Docker not found (optional)" -ForegroundColor Yellow
}

# Check Git
Write-Host "Checking Git installation..." -ForegroundColor Cyan
if (Test-Command git) {
    $gitVersion = git --version
    Write-Host "✓ $gitVersion found" -ForegroundColor Green
} else {
    Write-Host "✗ Git not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Setting up backend..." -ForegroundColor Cyan

# Navigate to backend directory
Set-Location backend

# Create virtual environment
Write-Host "Creating Python virtual environment..." -ForegroundColor Cyan
python -m venv venv

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
.\venv\Scripts\Activate.ps1

# Install Python dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Cyan
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
if (-not (Test-Path .env)) {
    Write-Host "Creating .env file..." -ForegroundColor Cyan
    Copy-Item .env.example .env
    Write-Host "⚠ Please edit backend\.env and add your API keys" -ForegroundColor Yellow
}

# Initialize database
Write-Host "Initializing database..." -ForegroundColor Cyan
python database.py

Write-Host ""
Write-Host "Setting up VS Code extension..." -ForegroundColor Cyan

# Navigate to extension directory
Set-Location ..\vscode-extension

# Install Node dependencies
Write-Host "Installing Node.js dependencies..." -ForegroundColor Cyan
npm install

# Compile TypeScript
Write-Host "Compiling TypeScript..." -ForegroundColor Cyan
npm run compile

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "Installation Complete! 🎉" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit backend\.env and add your OpenAI API key" -ForegroundColor White
Write-Host "2. Start the backend:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host "   uvicorn main:app --reload" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Or use Docker:" -ForegroundColor White
Write-Host "   docker-compose up -d" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Open VS Code extension:" -ForegroundColor White
Write-Host "   cd vscode-extension" -ForegroundColor Gray
Write-Host "   code ." -ForegroundColor Gray
Write-Host "   Press F5 to launch" -ForegroundColor Gray
Write-Host ""
Write-Host "Documentation: README.md" -ForegroundColor Cyan
Write-Host "Quick Start: QUICKSTART.md" -ForegroundColor Cyan
Write-Host ""

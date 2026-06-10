# PodWave - Install All Dependencies
# Run this script from the project root folder

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PodWave Dependency Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "  npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "  Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Installing dependencies for each system..." -ForegroundColor Yellow
Write-Host ""

# Admin Frontend
Write-Host "[1/5] Admin Frontend..." -ForegroundColor Cyan
Set-Location admin-system/client
npm install
if ($LASTEXITCODE -eq 0) { Write-Host "  Done!" -ForegroundColor Green } 
else { Write-Host "  Failed!" -ForegroundColor Red }

# Admin Backend
Write-Host "[2/5] Admin Backend..." -ForegroundColor Cyan
Set-Location ../server
npm install
if ($LASTEXITCODE -eq 0) { Write-Host "  Done!" -ForegroundColor Green } 
else { Write-Host "  Failed!" -ForegroundColor Red }

# Editor System
Write-Host "[3/5] Editor System..." -ForegroundColor Cyan
Set-Location ../../editor-system
npm install
if ($LASTEXITCODE -eq 0) { Write-Host "  Done!" -ForegroundColor Green } 
else { Write-Host "  Failed!" -ForegroundColor Red }

# Public Frontend
Write-Host "[4/5] Public Frontend..." -ForegroundColor Cyan
Set-Location ../public-system/client
npm install
if ($LASTEXITCODE -eq 0) { Write-Host "  Done!" -ForegroundColor Green } 
else { Write-Host "  Failed!" -ForegroundColor Red }

# Public Backend
Write-Host "[5/5] Public Backend..." -ForegroundColor Cyan
Set-Location ../server
npm install
if ($LASTEXITCODE -eq 0) { Write-Host "  Done!" -ForegroundColor Green } 
else { Write-Host "  Failed!" -ForegroundColor Red }

# Go back to root
Set-Location ../..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  All dependencies installed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Create .env files from .env.example templates"
Write-Host "  2. Setup MySQL database (see SETUP_GUIDE.md)"
Write-Host "  3. Run 'npm run dev' in each system folder"
Write-Host ""

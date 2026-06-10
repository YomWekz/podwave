# PodWave - Start All Systems
# Run this script to start all systems (requires 4 terminals)
# Or run each system separately in its own terminal

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PodWave - Starting All Systems" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTE: This will start all systems in one window." -ForegroundColor Yellow
Write-Host "For better debugging, start each system in separate terminals." -ForegroundColor Yellow
Write-Host ""

# Start Admin Frontend
Write-Host "Starting Admin Frontend (Port 3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\admin-system\client'; npm run dev"

# Start Admin Backend
Write-Host "Starting Admin Backend (Port 4001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\admin-system\server'; npm run dev"

# Start Editor System
Write-Host "Starting Editor System (Port 3002)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\editor-system'; npm run dev"

# Start Public Frontend
Write-Host "Starting Public Frontend (Port 3003)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\public-system\client'; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  All systems starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Open these URLs in your browser:" -ForegroundColor Yellow
Write-Host "  Admin:   http://localhost:3001" -ForegroundColor White
Write-Host "  Editor:  http://localhost:3002" -ForegroundColor White
Write-Host "  Public:  http://localhost:3003" -ForegroundColor White
Write-Host "  Admin API Health: http://localhost:4001/api/health" -ForegroundColor White
Write-Host ""

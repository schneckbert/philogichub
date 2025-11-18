# ========================================
# PhiLogicAI - Start mit Named Tunnel
# ========================================
# Startet Backend + Named Tunnel (ai.philogichub.com)

param(
    [switch]$AsService
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== PhiLogicAI - Named Tunnel Start ===" -ForegroundColor Cyan
Write-Host ""

# Check Backend
Write-Host "Schritt 1: Pruefe Backend..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod "http://localhost:8000/health" -TimeoutSec 2
    Write-Host "  OK Backend laeuft bereits (Status: $($health.status))" -ForegroundColor Green
} catch {
    Write-Host "  Backend nicht aktiv, starte..." -ForegroundColor Yellow
    
    # Start Backend
    $backendPath = "c:\Philip\myapps\philogicai\backend"
    Start-Process powershell -ArgumentList @(
        "-NoExit"
        "-Command"
        "cd '$backendPath'; .\.venv\Scripts\Activate.ps1; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
    )
    
    Write-Host "  Warte auf Backend Start..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
    
    # Verify
    try {
        $health = Invoke-RestMethod "http://localhost:8000/health" -TimeoutSec 3
        Write-Host "  OK Backend gestartet!" -ForegroundColor Green
    } catch {
        Write-Host "  FEHLER: Backend konnte nicht gestartet werden!" -ForegroundColor Red
        exit 1
    }
}

# Check if tunnel already running
Write-Host ""
Write-Host "Schritt 2: Pruefe Named Tunnel..." -ForegroundColor Yellow
$tunnelInfo = cloudflared tunnel info philogicai 2>&1 | Out-String
if ($tunnelInfo -match "CONNECTOR ID") {
    Write-Host "  OK Named Tunnel laeuft bereits!" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== TUNNEL INFO ===" -ForegroundColor Cyan
    cloudflared tunnel info philogicai | Select-String "NAME|CONNECTOR" -Context 0,1
} else {
    Write-Host "  Tunnel nicht aktiv, starte..." -ForegroundColor Yellow
    
    if ($AsService) {
        # Als Windows Service
        Write-Host "  Installiere als Windows Service..." -ForegroundColor Cyan
        cloudflared service install
        cloudflared service start
        Start-Sleep -Seconds 3
        Write-Host "  OK Service installiert und gestartet!" -ForegroundColor Green
    } else {
        # Manuell
        Write-Host "  Starte Tunnel manuell..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList @(
            "-NoExit"
            "-Command"
            "Write-Host 'Named Tunnel: philogicai' -ForegroundColor Cyan; Write-Host 'Hostname: ai.philogichub.com' -ForegroundColor Yellow; Write-Host ''; cloudflared tunnel run philogicai"
        )
        Start-Sleep -Seconds 5
        Write-Host "  OK Tunnel gestartet!" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SYSTEM BEREIT!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:      http://localhost:8000" -ForegroundColor White
Write-Host "Named Tunnel: ai.philogichub.com" -ForegroundColor White
Write-Host ""
Write-Host "HINWEIS:" -ForegroundColor Yellow
Write-Host "  Die Domain ai.philogichub.com funktioniert erst," -ForegroundColor Gray
Write-Host "  wenn philogichub.com in Cloudflare registriert ist." -ForegroundColor Gray
Write-Host ""
Write-Host "  Bis dahin: Nutze Quick Access Tunnel:" -ForegroundColor Gray
Write-Host "  .\START_WITH_TUNNEL.ps1" -ForegroundColor Cyan
Write-Host ""

if (-not $AsService) {
    Write-Host "Tipp: Starte als Windows Service:" -ForegroundColor Yellow
    Write-Host "  .\scripts\start-named-tunnel.ps1 -AsService" -ForegroundColor White
    Write-Host ""
}

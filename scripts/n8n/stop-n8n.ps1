# ============================================================================
# n8n Stop Script
# Stoppt n8n + Postgres (Volumes bleiben erhalten)
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "Stoppe n8n" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

$infraPath = "$PSScriptRoot\..\..\infra\n8n"

if (-not (Test-Path "$infraPath\compose.yml")) {
    Write-Host "[ERROR] compose.yml nicht gefunden!" -ForegroundColor Red
    exit 1
}

Write-Host "[1/2] Stoppe Services..." -ForegroundColor Green

Push-Location $infraPath
try {
    docker compose down
    Write-Host "      Services gestoppt" -ForegroundColor Green
} catch {
    Write-Host "      [ERROR] Stoppen fehlgeschlagen!" -ForegroundColor Red
    Write-Host "      $_" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Status
Write-Host "`n[2/2] Status:" -ForegroundColor Green
docker compose ps

Pop-Location

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "n8n gestoppt" -ForegroundColor Green
Write-Host "============================================================`n" -ForegroundColor Cyan

Write-Host "Daten bleiben erhalten in:" -ForegroundColor White
Write-Host "  $infraPath\pgdata (Postgres)" -ForegroundColor Gray
Write-Host "  $infraPath\n8n-data (n8n)`n" -ForegroundColor Gray

Write-Host "Neu starten:" -ForegroundColor White
Write-Host "  .\scripts\n8n\start-n8n.ps1`n" -ForegroundColor Gray

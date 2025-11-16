# ============================================================================
# n8n Start Script
# Startet n8n + Postgres via Docker Compose
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "Starte n8n für PhilogicAI" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

$infraPath = "$PSScriptRoot\..\..\infra\n8n"
$envPath = "$infraPath\.env"

# Prüfungen
if (-not (Test-Path $envPath)) {
    Write-Host "[ERROR] .env Datei nicht gefunden!" -ForegroundColor Red
    Write-Host "Bitte zuerst setup-n8n.ps1 ausführen" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path "$infraPath\compose.yml")) {
    Write-Host "[ERROR] compose.yml nicht gefunden!" -ForegroundColor Red
    exit 1
}

# Docker prüfen
try {
    docker ps | Out-Null
} catch {
    Write-Host "[ERROR] Docker läuft nicht!" -ForegroundColor Red
    exit 1
}

# Starte Services
Write-Host "[1/3] Starte Services..." -ForegroundColor Green

Push-Location $infraPath
try {
    docker compose up -d
    Write-Host "      Services gestartet" -ForegroundColor Green
} catch {
    Write-Host "      [ERROR] Start fehlgeschlagen!" -ForegroundColor Red
    Write-Host "      $_" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Warte auf Health Check
Write-Host "`n[2/3] Warte auf Health Check..." -ForegroundColor Green
Start-Sleep -Seconds 5

$maxRetries = 12
$retryCount = 0
$healthy = $false

while ($retryCount -lt $maxRetries -and -not $healthy) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5678/healthz" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $healthy = $true
            Write-Host "      n8n ist bereit!" -ForegroundColor Green
        }
    } catch {
        $retryCount++
        Write-Host "      Warte... ($retryCount/$maxRetries)" -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

if (-not $healthy) {
    Write-Host "      [WARNING] Health Check fehlgeschlagen" -ForegroundColor Yellow
    Write-Host "      n8n startet möglicherweise noch..." -ForegroundColor Yellow
}

# Status anzeigen
Write-Host "`n[3/3] Status:" -ForegroundColor Green
docker compose ps

Pop-Location

# Public URL Info
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "n8n läuft!" -ForegroundColor Green
Write-Host "============================================================`n" -ForegroundColor Cyan

Write-Host "Lokal erreichbar:" -ForegroundColor White
Write-Host "  http://localhost:5678`n" -ForegroundColor Cyan

Write-Host "Public erreichbar (nach Cloudflare Access Setup):" -ForegroundColor White
Write-Host "  https://ai.philogichub.com/n8n`n" -ForegroundColor Cyan

Write-Host "Login:" -ForegroundColor White
Write-Host "  User: admin" -ForegroundColor Gray
Write-Host "  Pass: (siehe .env Datei)`n" -ForegroundColor Gray

Write-Host "Logs anzeigen:" -ForegroundColor White
Write-Host "  cd $infraPath" -ForegroundColor Gray
Write-Host "  docker compose logs -f`n" -ForegroundColor Gray

Write-Host "Stoppen:" -ForegroundColor White
Write-Host "  .\scripts\n8n\stop-n8n.ps1`n" -ForegroundColor Gray

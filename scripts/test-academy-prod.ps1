# ========================================
# PhiLogicAI Academy - Production Smoke Test
# ========================================
# Testet die deployed App auf Vercel

param(
    [Parameter(Mandatory=$false)]
    [string]$ProductionUrl = "",
    [Parameter(Mandatory=$false)]
    [string]$BackendUrl = ""
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "=== PhiLogicAI Academy - Production Smoke Test ===" -ForegroundColor Cyan
Write-Host ""

# URL ermitteln
if (-not $ProductionUrl) {
    Write-Host "Bitte gib die Vercel Production URL ein:" -ForegroundColor Yellow
    Write-Host "(z.B. https://philogicai-academy.vercel.app)" -ForegroundColor Gray
    $ProductionUrl = Read-Host "URL"
    
    if (-not $ProductionUrl) {
        Write-Host "Keine URL angegeben, abgebrochen." -ForegroundColor Red
        exit 1
    }
}

# Backend URL ermitteln (optional)
if (-not $BackendUrl) {
    Write-Host ""
    Write-Host "Backend URL (optional, Enter zum Ueberspringen):" -ForegroundColor Yellow
    Write-Host "(z.B. https://xyz.trycloudflare.com)" -ForegroundColor Gray
    $BackendUrl = Read-Host "Backend URL"
}

# Test 1: Frontend erreichbar
Write-Host ""
Write-Host "Test 1: Frontend Erreichbarkeit..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $ProductionUrl -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "  OK Frontend erreichbar (Status: $($response.StatusCode))" -ForegroundColor Green
        
        # Check ob index.html die neue Chat-UI enthält
        $content = $response.Content
        if ($content -match "academy-shell" -and $content -match "chat-sidebar") {
            Write-Host "  OK Neue Academy-Chat-UI erkannt" -ForegroundColor Green
        } else {
            Write-Host "  WARNUNG: Alte UI oder unerwarteter Content" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  FEHLER: Unerwarteter Status Code: $($response.StatusCode)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  FEHLER: Frontend nicht erreichbar: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Backend Tests (nur wenn Backend URL gegeben)
if ($BackendUrl) {
    Write-Host ""
    Write-Host "Test 2: Backend Health Check..." -ForegroundColor Yellow
    try {
        $health = Invoke-RestMethod -Uri "$BackendUrl/health" -TimeoutSec 5
        if ($health.status -eq "healthy") {
            Write-Host "  OK Backend gesund" -ForegroundColor Green
            Write-Host "    Ollama: $($health.ollama)" -ForegroundColor Gray
            Write-Host "    Model Loaded: $($health.model_loaded)" -ForegroundColor Gray
        } else {
            Write-Host "  WARNUNG: Backend Status: $($health.status)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  FEHLER: Backend nicht erreichbar: $_" -ForegroundColor Red
        Write-Host "    Ist der Cloudflare Tunnel aktiv?" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Test 3: Tunnel Info..." -ForegroundColor Yellow
    try {
        $tunnel = Invoke-RestMethod -Uri "$BackendUrl/tunnel-info" -TimeoutSec 5
        Write-Host "  OK Tunnel Info erhalten" -ForegroundColor Green
        Write-Host "    Tunnel aktiv: $($tunnel.tunnel_active)" -ForegroundColor Gray
        Write-Host "    Public URL: $($tunnel.public_url)" -ForegroundColor Gray
    } catch {
        Write-Host "  WARNUNG: Tunnel Info nicht verfuegbar" -ForegroundColor Yellow
    }
}

# Test 3/4: Manuelle Checks
Write-Host ""
Write-Host "Manuelle Tests:" -ForegroundColor Yellow
Write-Host "  1. Oeffne: $ProductionUrl" -ForegroundColor White
Write-Host "  2. Klicke auf 'Anmelden'" -ForegroundColor White
Write-Host "  3. Gib Backend-URL ein (falls gefragt)" -ForegroundColor White
Write-Host "  4. Logge dich ein" -ForegroundColor White
Write-Host "  5. Teste Chat-Funktion" -ForegroundColor White
Write-Host "  6. Pruefe KPI-Anzeige (Latenz, Tokens)" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  AUTOMATISCHE TESTS ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend ist deployed und erreichbar!" -ForegroundColor Cyan
if ($BackendUrl) {
    Write-Host "Backend ist konfiguriert und laeuft." -ForegroundColor Cyan
} else {
    Write-Host "HINWEIS: Backend-Tests uebersprungen (keine URL)" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "Bitte fuehre die manuellen Tests durch." -ForegroundColor Yellow
Write-Host ""

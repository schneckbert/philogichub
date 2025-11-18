# ========================================
# PhiLogicAI Academy - Production Deployment
# ========================================
# Deployed das Frontend auf Vercel

param(
    [switch]$Production,
    [switch]$SkipTests
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== PhiLogicAI Academy Deployment ===" -ForegroundColor Cyan
Write-Host ""

$frontendDir = "c:\Philip\myapps\philogicai\vercel-frontend"

# Schritt 1: Vercel CLI Check
Write-Host "Schritt 1: Pruefe Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version 2>&1
    Write-Host "  OK Vercel CLI installiert: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "  FEHLER: Vercel CLI nicht gefunden!" -ForegroundColor Red
    Write-Host "  Installiere mit: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

# Schritt 2: Backend Check (optional)
if (-not $SkipTests) {
    Write-Host ""
    Write-Host "Schritt 2: Pruefe Backend..." -ForegroundColor Yellow
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 3
        if ($health.status -eq "healthy") {
            Write-Host "  OK Backend laeuft und ist gesund" -ForegroundColor Green
        } else {
            Write-Host "  WARNUNG: Backend Status: $($health.status)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  WARNUNG: Backend nicht erreichbar (OK fuer Prod-Deploy ohne Tunnel)" -ForegroundColor Yellow
    }
}

# Schritt 3: Vercel Deployment
Write-Host ""
Write-Host "Schritt 3: Deploye auf Vercel..." -ForegroundColor Yellow
Write-Host "  Verzeichnis: $frontendDir" -ForegroundColor Gray

Set-Location $frontendDir

if ($Production) {
    Write-Host "  Modus: PRODUCTION" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "  ACHTUNG: Dies deployed auf die Production-Domain!" -ForegroundColor Red
    Write-Host "  Druecke Enter zum Fortfahren oder Ctrl+C zum Abbrechen..." -ForegroundColor Yellow
    Read-Host
    
    vercel --prod
} else {
    Write-Host "  Modus: PREVIEW" -ForegroundColor Cyan
    vercel
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  DEPLOYMENT ERFOLGREICH!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    if ($Production) {
        Write-Host "Deine App ist jetzt live!" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Naechste Schritte:" -ForegroundColor Yellow
        Write-Host "  1. Oeffne die Vercel-URL in deinem Browser" -ForegroundColor White
        Write-Host "  2. Fuehre Smoketest aus: .\scripts\test-academy-prod.ps1" -ForegroundColor White
        Write-Host "  3. Falls Backend-URL fehlt: Im Browser eingeben" -ForegroundColor White
    } else {
        Write-Host "Preview-Deployment erstellt!" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Fuer Production Deployment:" -ForegroundColor Yellow
        Write-Host "  .\scripts\deploy-academy.ps1 -Production" -ForegroundColor White
    }
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  DEPLOYMENT FEHLGESCHLAGEN!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Haeufige Probleme:" -ForegroundColor Yellow
    Write-Host "  - Vercel Login erforderlich: vercel login" -ForegroundColor White
    Write-Host "  - Git Repo nicht linked: vercel link" -ForegroundColor White
    Write-Host "  - Vercel Projekt existiert nicht: vercel --confirm" -ForegroundColor White
    Write-Host ""
    exit 1
}

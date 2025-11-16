# Philogic-Hub – Supabase Sync Script
# Importiert Schema aus Supabase und generiert Prisma Client

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Supabase Schema Sync            " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 1. Prisma Pull
Write-Host "[1/2] Importiere Schema aus Supabase..." -ForegroundColor Yellow
npx prisma db pull

if ($LASTEXITCODE -ne 0) {
    Write-Host "Fehler beim Schema-Import!" -ForegroundColor Red
    Write-Host "Stelle sicher dass DATABASE_URL in .env korrekt ist." -ForegroundColor Yellow
    exit 1
}

Write-Host "Schema importiert." -ForegroundColor Green
Write-Host ""

# 2. Generate Client
Write-Host "[2/2] Generiere Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "Fehler beim Generieren des Clients!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "  Schema-Sync abgeschlossen!      " -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Prisma Client ist jetzt auf dem neuesten Stand." -ForegroundColor Cyan
Write-Host "Du kannst den Dev-Server starten mit: .\dev.ps1" -ForegroundColor Cyan

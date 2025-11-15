# Philogic-Hub Dev-Start Skript
# Installiert Abhängigkeiten und startet den Dev-Server

Write-Host "=== Philogic-Hub Dev-Start ===" -ForegroundColor Cyan
Write-Host ""

# Prüfen ob node_modules existiert
if (-not (Test-Path "node_modules")) {
    Write-Host "[1/2] Abhängigkeiten installieren..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    Installation erfolgreich!" -ForegroundColor Green
    } else {
        Write-Host "    Installation fehlgeschlagen." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[1/2] node_modules existiert bereits." -ForegroundColor Green
}

Write-Host "[2/2] Dev-Server starten..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Öffne im Browser: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

npm run dev

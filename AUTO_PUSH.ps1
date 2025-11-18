# Automatisches Push-Skript für philogichub
# Führt Git Add, Commit und Push automatisch aus

Write-Host "🚀 Automatischer Push für philogichub" -ForegroundColor Cyan
Write-Host "=" * 60

# Prüfe ob wir im richtigen Verzeichnis sind
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Fehler: Nicht im philogichub Verzeichnis!" -ForegroundColor Red
    exit 1
}

# Git Status prüfen
Write-Host "`n📊 Git Status:" -ForegroundColor Yellow
git status --short

# Prüfe ob es Änderungen gibt
$changes = git status --short
if ([string]::IsNullOrWhiteSpace($changes)) {
    Write-Host "`n✅ Keine Änderungen zum Committen" -ForegroundColor Green
    exit 0
}

# Alle Änderungen hinzufügen
Write-Host "`n➕ Füge alle Änderungen hinzu..." -ForegroundColor Yellow
git add -A

# Commit Message erstellen
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
$commitMsg = "auto: Update from $timestamp"

Write-Host "`n💾 Committe Änderungen..." -ForegroundColor Yellow
Write-Host "   Message: $commitMsg" -ForegroundColor Gray
git commit -m $commitMsg

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Commit fehlgeschlagen!" -ForegroundColor Red
    exit 1
}

# Push zu GitHub
Write-Host "`n🌐 Push zu GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Erfolgreich gepusht!" -ForegroundColor Green
    Write-Host "   Branch: main" -ForegroundColor Gray
    Write-Host "   Repository: philogichub" -ForegroundColor Gray
    
    # Warte kurz und zeige Vercel Status
    Write-Host "`n⏳ Warte 3 Sekunden für Vercel Deployment..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    Write-Host "`n📦 Vercel Deployments:" -ForegroundColor Cyan
    vercel ls | Select-Object -First 5
} else {
    Write-Host "`n❌ Push fehlgeschlagen!" -ForegroundColor Red
    exit 1
}

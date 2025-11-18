# Quick Commit mit benutzerdefinierter Message
# Usage: .\QUICK_COMMIT.ps1 "Deine commit message"

param(
    [Parameter(Mandatory=$false)]
    [string]$Message = ""
)

Write-Host "💬 Quick Commit für philogichub" -ForegroundColor Cyan
Write-Host "=" * 60

# Prüfe Verzeichnis
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Fehler: Nicht im philogichub Verzeichnis!" -ForegroundColor Red
    exit 1
}

# Status prüfen
$changes = git status --short
if ([string]::IsNullOrWhiteSpace($changes)) {
    Write-Host "`n✅ Keine Änderungen zum Committen" -ForegroundColor Green
    exit 0
}

Write-Host "`n📊 Änderungen:" -ForegroundColor Yellow
git status --short

# Message abfragen wenn nicht gegeben
if ([string]::IsNullOrWhiteSpace($Message)) {
    Write-Host "`n📝 Commit Message eingeben:" -ForegroundColor Yellow
    $Message = Read-Host "Message"
    
    if ([string]::IsNullOrWhiteSpace($Message)) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
        $Message = "auto: Update from $timestamp"
        Write-Host "   Verwende Standard-Message: $Message" -ForegroundColor Gray
    }
}

# Add all
git add -A

# Commit
Write-Host "`n💾 Committe: $Message" -ForegroundColor Yellow
git commit -m $Message

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Commit fehlgeschlagen!" -ForegroundColor Red
    exit 1
}

# Push
Write-Host "`n🌐 Push zu GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Erfolgreich gepusht!" -ForegroundColor Green
    
    # Vercel Status
    Write-Host "`n📦 Vercel Status:" -ForegroundColor Cyan
    Start-Sleep -Seconds 2
    vercel ls | Select-Object -First 3
} else {
    Write-Host "`n❌ Push fehlgeschlagen!" -ForegroundColor Red
    exit 1
}

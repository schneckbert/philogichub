# Philogic-Hub Setup-Skript
# Automatisiert Git-Initialisierung, Commit und Push nach GitHub

Write-Host "=== Philogic-Hub Setup ===" -ForegroundColor Cyan
Write-Host ""

# 1. Git initialisieren falls noch nicht geschehen
if (-not (Test-Path ".git")) {
    Write-Host "[1/5] Git-Repo initialisieren..." -ForegroundColor Yellow
    git init
    git config user.name "Philip"
    git config user.email "philip@philogic.de"
} else {
    Write-Host "[1/5] Git-Repo existiert bereits." -ForegroundColor Green
}

# 2. Remote hinzufügen
Write-Host "[2/5] GitHub Remote setzen..." -ForegroundColor Yellow
$remoteExists = git remote | Select-String -Pattern "origin"
if (-not $remoteExists) {
    git remote add origin https://github.com/schneckbert/philogichub.git
    Write-Host "    Remote 'origin' hinzugefügt." -ForegroundColor Green
} else {
    Write-Host "    Remote 'origin' existiert bereits." -ForegroundColor Green
}

# 3. Alle Änderungen stagen
Write-Host "[3/5] Dateien stagen..." -ForegroundColor Yellow
git add .
Write-Host "    Alle Dateien gestaged." -ForegroundColor Green

# 4. Commit erstellen
Write-Host "[4/5] Commit erstellen..." -ForegroundColor Yellow
$commitMsg = "chore: initial project setup with Next.js, README, and agent instructions"
git commit -m $commitMsg
if ($LASTEXITCODE -eq 0) {
    Write-Host "    Commit erfolgreich: '$commitMsg'" -ForegroundColor Green
} else {
    Write-Host "    Kein neuer Commit (bereits committed oder keine Änderungen)." -ForegroundColor Yellow
}

# 5. Nach GitHub pushen
Write-Host "[5/5] Push nach GitHub..." -ForegroundColor Yellow
git branch -M main
git push -u origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "    Push erfolgreich!" -ForegroundColor Green
} else {
    Write-Host "    Push fehlgeschlagen. Prüfe deine GitHub-Credentials." -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Setup abgeschlossen ===" -ForegroundColor Cyan
Write-Host "Repo: https://github.com/schneckbert/philogichub" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. npm install      # Abhängigkeiten installieren"
Write-Host "  2. npm run dev      # Lokalen Dev-Server starten"
Write-Host "  3. Vercel verbinden # https://vercel.com/new"

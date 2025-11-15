# Philogic-Hub Komplett-Setup
# Kopiert Assets, initialisiert Git, committed alles und pusht nach GitHub

Write-Host "=== Philogic-Hub Komplett-Setup ===" -ForegroundColor Cyan
Write-Host ""

# 1. Assets kopieren
Write-Host "[1/6] Assets kopieren..." -ForegroundColor Yellow
$faviconSource = "C:\Philip\Grafiken\philogichub-favicon.svg"
$logoSource = "C:\Philip\Grafiken\philogichub-logo-klein.svg"
$publicDir = ".\public"

if (Test-Path $faviconSource) {
    Copy-Item $faviconSource "$publicDir\philogichub-favicon.svg" -Force
    Write-Host "    Favicon kopiert." -ForegroundColor Green
} else {
    Write-Host "    Warnung: Favicon nicht gefunden unter $faviconSource" -ForegroundColor Yellow
}

if (Test-Path $logoSource) {
    Copy-Item $logoSource "$publicDir\philogichub-logo.svg" -Force
    Write-Host "    Logo kopiert." -ForegroundColor Green
} else {
    Write-Host "    Warnung: Logo nicht gefunden unter $logoSource" -ForegroundColor Yellow
}

# 2. Git initialisieren falls noch nicht geschehen
if (-not (Test-Path ".git")) {
    Write-Host "[2/6] Git-Repo initialisieren..." -ForegroundColor Yellow
    git init
    git config user.name "Philip"
    git config user.email "philip@philogic.de"
    Write-Host "    Git initialisiert." -ForegroundColor Green
} else {
    Write-Host "[2/6] Git-Repo existiert bereits." -ForegroundColor Green
}

# 3. Remote hinzufügen
Write-Host "[3/6] GitHub Remote setzen..." -ForegroundColor Yellow
$remoteExists = git remote | Select-String -Pattern "origin"
if (-not $remoteExists) {
    git remote add origin https://github.com/schneckbert/philogichub.git
    Write-Host "    Remote 'origin' hinzugefügt." -ForegroundColor Green
} else {
    Write-Host "    Remote 'origin' existiert bereits." -ForegroundColor Green
}

# 4. Alle Änderungen stagen
Write-Host "[4/6] Dateien stagen..." -ForegroundColor Yellow
git add .
Write-Host "    Alle Dateien gestaged." -ForegroundColor Green

# 5. Commit erstellen
Write-Host "[5/6] Commit erstellen..." -ForegroundColor Yellow
$commitMsg = "feat: complete Philogic-Hub setup with Next.js, Tailwind, assets and docs"
git commit -m $commitMsg
if ($LASTEXITCODE -eq 0) {
    Write-Host "    Commit erfolgreich!" -ForegroundColor Green
} else {
    Write-Host "    Kein neuer Commit (bereits committed oder keine Aenderungen)." -ForegroundColor Yellow
}

# 6. Nach GitHub pushen
Write-Host "[6/6] Push nach GitHub..." -ForegroundColor Yellow
git branch -M main
git push -u origin main --force
if ($LASTEXITCODE -eq 0) {
    Write-Host "    Push erfolgreich!" -ForegroundColor Green
} else {
    Write-Host "    Push fehlgeschlagen. Prüfe deine GitHub-Credentials." -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Setup abgeschlossen ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "GitHub Repo: https://github.com/schneckbert/philogichub" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. .\dev.ps1         # Lokalen Dev-Server starten"
Write-Host "  2. Vercel verbinden  # https://vercel.com/new"
Write-Host ""

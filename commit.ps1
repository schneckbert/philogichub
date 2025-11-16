# Philogic-Hub – Git Commit & Push
# Commitet alle Aenderungen und pusht zu GitHub

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Git Commit & Push                " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 1. Git Status pruefen
Write-Host "[1/3] Git Status..." -ForegroundColor Yellow
git status --short

Write-Host ""
$commitMessage = Read-Host "Commit Message eingeben (z. B. 'feat: add prisma and API routes')"

if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    Write-Host "Keine Commit Message eingegeben. Abbruch." -ForegroundColor Red
    exit 1
}

# 2. Stage all changes
Write-Host ""
Write-Host "[2/3] Stage all changes..." -ForegroundColor Yellow
git add .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Fehler beim Stagen der Aenderungen!" -ForegroundColor Red
    exit 1
}

Write-Host "Alle Aenderungen staged." -ForegroundColor Green

# 3. Commit & Push
Write-Host ""
Write-Host "[3/3] Commit & Push..." -ForegroundColor Yellow
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "Fehler beim Commit!" -ForegroundColor Red
    exit 1
}

git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "Fehler beim Push!" -ForegroundColor Red
    Write-Host "Falls 'main' nicht der richtige Branch ist, pruefe mit 'git branch'." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "  Push erfolgreich!               " -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Aenderungen sind jetzt auf GitHub: https://github.com/schneckbert/philogichub" -ForegroundColor Cyan

# Quick fix: Set DATABASE_URL in Vercel production
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot\..

Write-Host "Reading DATABASE_URL from .env..." -ForegroundColor Cyan
$line = Get-Content .env | Where-Object { $_ -match '^DATABASE_URL=' } | Select-Object -First 1
if (-not $line) {
    throw "DATABASE_URL not found in .env"
}

$dbUrl = $line.ToString().Split('=', 2)[1].Trim('"')
Write-Host "Found: $($dbUrl.Substring(0, 40))..." -ForegroundColor Green

Write-Host "`nSetting DATABASE_URL in Vercel production..." -ForegroundColor Cyan
Write-Host "(You'll need to paste the value when prompted)" -ForegroundColor Yellow

# Interactive: user pastes value
$input = Read-Host "Press ENTER to open vercel env add DATABASE_URL production, then paste the value above"
vercel env add DATABASE_URL production

Write-Host "`n✅ Done! Now redeploy:" -ForegroundColor Green
Write-Host "vercel deploy --prod" -ForegroundColor Cyan

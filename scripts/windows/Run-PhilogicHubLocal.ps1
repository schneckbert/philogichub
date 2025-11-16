Write-Host "Checking PhilogicAI health at http://localhost:8000/health..." -ForegroundColor Cyan
try {
  $res = Invoke-WebRequest -Uri http://localhost:8000/health -UseBasicParsing -TimeoutSec 5
  Write-Host $res.Content
} catch {
  Write-Warning "PhilogicAI health request failed. Ensure backend is running on port 8000."
}

if (-not $env:PHILOGIC_AI_URL) { $env:PHILOGIC_AI_URL = 'http://localhost:8000' }
if (-not $env:PHILOGIC_AI_API_KEY) { $env:PHILOGIC_AI_API_KEY = 'local' }

Write-Host "Starting PhilogicHub (Next.js dev server)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$PSScriptRoot\..\..'; npm run dev"

Start-Sleep -Seconds 2
Write-Host "Opening status page..." -ForegroundColor Cyan
Start-Process http://localhost:3000/philogic-ai/status

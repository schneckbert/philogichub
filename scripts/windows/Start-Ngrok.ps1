param(
  [int]$Port = 8000,
  [string]$Region = "eu"
)

if (-not (Get-Command ngrok -ErrorAction SilentlyContinue)) {
  Write-Error "ngrok not found. Install from https://ngrok.com/download and run 'ngrok config add-authtoken <token>'."
  exit 1
}

Write-Host "Starting ngrok http $Port (region: $Region)..." -ForegroundColor Cyan
Start-Process -FilePath (Get-Command ngrok).Source -ArgumentList @('http', $Port, '--region', $Region)
Write-Host "ngrok started in a new window. Use the printed https URL as PHILOGIC_AI_URL for quick tests." -ForegroundColor Green

param(
  [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

function Start-PhilogicBackend {
  Write-Host "Starting PhilogicAI backend..." -ForegroundColor Cyan
  $backendScript = Join-Path $repoRoot "philogic-ai-server.py"
  if (Test-Path $backendScript) {
    Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$repoRoot'; python philogic-ai-server.py" | Out-Null
  } else {
    Write-Warning "Backend start script not found at $backendScript"
  }
}

function Start-CloudflaredTunnel {
  Write-Host "Starting Cloudflare tunnel..." -ForegroundColor Cyan
  $startCloudflared = Join-Path $repoRoot "scripts/windows/Start-Cloudflared.ps1"
  if (Test-Path $startCloudflared) {
    & $startCloudflared
  } else {
    Write-Warning "Start-Cloudflared.ps1 not found at $startCloudflared"
  }
}

function Start-N8N {
  Write-Host "Starting n8n stack..." -ForegroundColor Cyan
  $startN8n = Join-Path $repoRoot "scripts/n8n/start-n8n.ps1"
  if (Test-Path $startN8n) {
    & $startN8n
  } else {
    Write-Warning "start-n8n.ps1 not found at $startN8n"
  }
}

Write-Host "=== Starting PhilogicHub Stack ===" -ForegroundColor Green

Start-PhilogicBackend
Start-Sleep -Seconds 3

Start-CloudflaredTunnel
Start-Sleep -Seconds 3

Start-N8N

if (-not $NoBrowser) {
  Write-Host "Opening main PhilogicHub frontend..." -ForegroundColor Cyan
  Start-Process "http://localhost:3000"
}

Write-Host "=== START_ALL finished (backend, tunnel, n8n requested) ===" -ForegroundColor Green

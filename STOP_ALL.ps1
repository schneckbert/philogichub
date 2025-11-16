$ErrorActionPreference = "Continue"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

function Stop-N8N {
  Write-Host "Stopping n8n stack..." -ForegroundColor Cyan
  $stopN8n = Join-Path $repoRoot "scripts/n8n/stop-n8n.ps1"
  if (Test-Path $stopN8n) {
    & $stopN8n
  } else {
    Write-Warning "stop-n8n.ps1 not found at $stopN8n"
  }
}

function Stop-CloudflaredTunnel {
  Write-Host "Stopping Cloudflare tunnel..." -ForegroundColor Cyan
  Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}

function Stop-PhilogicBackend {
  Write-Host "Stopping PhilogicAI backend..." -ForegroundColor Cyan
  Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}

Write-Host "=== Stopping PhilogicHub Stack ===" -ForegroundColor Yellow

Stop-N8N
Stop-CloudflaredTunnel
Stop-PhilogicBackend

Write-Host "=== STOP_ALL finished ===" -ForegroundColor Green

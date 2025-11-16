param(
  [string]$TunnelName = "philogicai",
  [switch]$Background
)

Write-Host "Checking for cloudflared..."
function Assert-InPath {
  $cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
  if ($cloudflared) { return }
  $candidates = @(
    "C:\\Program Files\\Cloudflare\\Cloudflared\\cloudflared.exe",
    "C:\\Program Files (x86)\\Cloudflare\\Cloudflared\\cloudflared.exe",
    "$env:LOCALAPPDATA\\Cloudflare\\cloudflared\\cloudflared.exe"
  )
  foreach ($p in $candidates) {
    if (Test-Path $p) {
      $env:PATH = (Split-Path $p -Parent) + ";" + $env:PATH
      break
    }
  }
  $cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
  if (-not $cloudflared) {
    Write-Error "cloudflared is not installed. Install via: winget install Cloudflare.cloudflared"
    exit 1
  }
}

Assert-InPath

Write-Host "cloudflared version:" -NoNewline; cloudflared --version

Write-Host "Checking tunnels..."
cloudflared tunnel list

Write-Host "If you have not logged in yet, run: cloudflared tunnel login"

Write-Host "Starting tunnel '$TunnelName'..."
if ($Background) {
  Start-Process -FilePath (Get-Command cloudflared).Source -ArgumentList @('tunnel','run', $TunnelName) -WindowStyle Hidden
  Write-Host "Tunnel started in background."
} else {
  cloudflared tunnel run $TunnelName
}

param(
  [string]$TunnelName = "philogicai",
  [string]$Hostname,
  [string]$ServiceUrl = "http://localhost:8000",
  [string]$TunnelId,
  [switch]$AutoLogin,
  [switch]$CreateDns,
  [switch]$Start
)

function Assert-CloudflaredInstalled {
  $exists = Get-Command cloudflared -ErrorAction SilentlyContinue
  if (-not $exists) {
    # Try common install locations and add to PATH for this session
    $candidates = @(
      "C:\\Program Files\\Cloudflare\\Cloudflared\\cloudflared.exe",
      "C:\\Program Files (x86)\\Cloudflare\\Cloudflared\\cloudflared.exe",
      "$env:LOCALAPPDATA\\Cloudflare\\cloudflared\\cloudflared.exe"
    )
    foreach ($path in $candidates) {
      if (Test-Path $path) {
        $dir = Split-Path $path -Parent
        $env:PATH = "$dir;" + $env:PATH
        $exists = Get-Command cloudflared -ErrorAction SilentlyContinue
        if ($exists) { break }
      }
    }
  }
  if (-not $exists) {
    Write-Host "Installing cloudflared via winget..." -ForegroundColor Cyan
    winget install Cloudflare.cloudflared | Out-Null
    # Attempt PATH refresh by checking known locations again
    Start-Sleep -Seconds 2
    $exists = Get-Command cloudflared -ErrorAction SilentlyContinue
    if (-not $exists) {
      foreach ($path in $candidates) {
        if (Test-Path $path) {
          $dir = Split-Path $path -Parent
          $env:PATH = "$dir;" + $env:PATH
          $exists = Get-Command cloudflared -ErrorAction SilentlyContinue
          if ($exists) { break }
        }
      }
      if (-not $exists) {
        # Last resort: search common roots recursively
        $roots = @(
          "C:\\Program Files",
          "C:\\Program Files (x86)",
          $env:LOCALAPPDATA,
          "C:\\ProgramData"
        )
        foreach ($root in $roots) {
          if (-not (Test-Path $root)) { continue }
          try {
            $found = Get-ChildItem -Path $root -Filter cloudflared.exe -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($found) {
              $dir = Split-Path $found.FullName -Parent
              $env:PATH = "$dir;" + $env:PATH
              $exists = Get-Command cloudflared -ErrorAction SilentlyContinue
              if ($exists) { break }
            }
          } catch {}
        }
      }
    }
    if (-not $exists) { throw "cloudflared not found after installation. Please open a new PowerShell or install manually." }
  }
  Write-Host (cloudflared --version)
}

function Invoke-CloudflaredLoginIfRequested {
  param([switch]$DoLogin)
  if ($DoLogin) {
    Write-Host "Logging into Cloudflare (browser will open)..." -ForegroundColor Cyan
    cloudflared tunnel login
  }
}

function Get-OrCreate-TunnelId {
  param([string]$Name,[string]$ExistingId)
  if ($ExistingId) { return $ExistingId }
  # Try to find in list
  $list = cloudflared tunnel list 2>&1 | Out-String
  $lines = $list -split "\r?\n"
  foreach ($line in $lines) {
    # Expect: <uuid> <name> <created> ...
    if ($line -match "^\s*([0-9a-fA-F-]{36})\s+${Name}\b") {
      return $Matches[1]
    }
  }
  # Not found -> create
  Write-Host "Creating tunnel '$Name'..." -ForegroundColor Cyan
  $output = cloudflared tunnel create $Name 2>&1 | Out-String
  # Example line: Created tunnel <name> with id <uuid>
  if ($output -match "with id ([0-9a-fA-F-]{36})") { return $Matches[1] }
  throw "Failed to determine Tunnel ID for '$Name'. Output:`n$output"
}

function Write-Config {
  param([string]$Id,[string]$DnsHostname,[string]$Svc)
  $scriptPath = Join-Path $PSScriptRoot 'Write-CloudflaredConfig.ps1'
  & $scriptPath -TunnelId $Id -Hostname $DnsHostname -ServiceUrl $Svc
}

function New-DnsRouteIfRequested {
  param([switch]$DoDns,[string]$Name,[string]$DnsHostname)
  if ($DoDns) {
    Write-Host "Creating DNS route for $DnsHostname..." -ForegroundColor Cyan
    cloudflared tunnel route dns $Name $DnsHostname
  }
}

function Start-TunnelIfRequested {
  param([switch]$DoStart,[string]$Name)
  if ($DoStart) {
    $startScript = Join-Path $PSScriptRoot 'Start-Cloudflared.ps1'
    & $startScript -TunnelName $Name -Background
  }
}

try {
  if (-not $Hostname) { throw "-Hostname is required (e.g. philogicai.yourdomain.com)" }
  Assert-CloudflaredInstalled
  Invoke-CloudflaredLoginIfRequested -DoLogin:$AutoLogin
  $id = Get-OrCreate-TunnelId -Name $TunnelName -ExistingId $TunnelId
  Write-Host "Using Tunnel ID: $id" -ForegroundColor Green
  Write-Config -Id $id -DnsHostname $Hostname -Svc $ServiceUrl
  New-DnsRouteIfRequested -DoDns:$CreateDns -Name $TunnelName -DnsHostname $Hostname
  Start-TunnelIfRequested -DoStart:$Start -Name $TunnelName
  Write-Host "Done. Tunnel '$TunnelName' configured for $Hostname → $ServiceUrl" -ForegroundColor Green
} catch {
  Write-Error $_
  exit 1
}

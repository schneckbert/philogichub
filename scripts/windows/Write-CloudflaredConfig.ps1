param(
  [Parameter(Mandatory = $true)]
  [string]$TunnelId,

  [Parameter(Mandatory = $true)]
  [string]$Hostname,

  [string]$ServiceUrl = "http://localhost:8000"
)

$user = $env:USERNAME
$configDir = Join-Path (Join-Path "C:\Users" $user) ".cloudflared"
if (-not (Test-Path $configDir)) {
  New-Item -ItemType Directory -Path $configDir | Out-Null
}

$credFile = Join-Path $configDir ("{0}.json" -f $TunnelId)
$configPath = Join-Path $configDir "config.yml"

$yaml = @"
tunnel: $TunnelId
credentials-file: $credFile

ingress:
  - hostname: $Hostname
    service: $ServiceUrl
  - service: http_status:404
"@

$yaml | Out-File -FilePath $configPath -Encoding utf8 -Force
Write-Host "Wrote Cloudflared config to $configPath"
Write-Host "Credentials file expected at $credFile"
Write-Host "Hostname mapped to $ServiceUrl"

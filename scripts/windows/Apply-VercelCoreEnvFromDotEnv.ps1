param(
  [string]$NextAuthUrl = 'https://philogichub.vercel.app',
  [string]$NextAuthSecret
)

 $ErrorActionPreference = 'Stop'
Push-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location '..\..' | Out-Null  # go to repo root

function Get-DotEnvValue {
  param([string]$Name)
  $line = Get-Content '.env' | Where-Object { $_ -match "^$Name=" } | Select-Object -First 1
  if (-not $line) { return $null }
  $text = $line.ToString()
  $idx = $text.IndexOf('=')
  if ($idx -lt 0) { return $null }
  $val = $text.Substring($idx + 1)
  return $val.Trim('"')
}

$dbUrl = Get-DotEnvValue -Name 'DATABASE_URL'
if (-not $dbUrl) { throw 'DATABASE_URL not found in .env' }

if (-not $PSBoundParameters.ContainsKey('NextAuthSecret')) {
  $bytes = New-Object byte[] 32
  [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $NextAuthSecret = [Convert]::ToBase64String($bytes)
}

Write-Host "Using NEXTAUTH_URL=$NextAuthUrl" -ForegroundColor Cyan
Write-Host "Setting DATABASE_URL from .env (hidden)" -ForegroundColor Cyan

& .\scripts\windows\Set-VercelCoreEnv.ps1 -NextAuthUrl $NextAuthUrl -NextAuthSecret $NextAuthSecret -DatabaseUrl $dbUrl -AllEnvs

Pop-Location

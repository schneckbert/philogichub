param(
  [string]$NextAuthUrl,
  [string]$NextAuthSecret,
  [string]$DatabaseUrl,
  [switch]$AllEnvs,
  [ValidateSet('production','preview','development')]
  [string]$Env = 'production'
)

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
  Write-Error "Vercel CLI not found. Install with: npm i -g vercel"
  exit 1
}

function Set-Env {
  param([string]$Name,[string]$Value,[string]$Target)
  try { vercel env rm $Name $Target -y 2>$null | Out-Null } catch {}
  $tmpPath = [System.IO.Path]::GetTempFileName()
  try {
    Set-Content -Path $tmpPath -Value $Value -NoNewline -Encoding ASCII
    $cmdLine = "type `"$tmpPath`" | vercel env add $Name $Target"
    $out = cmd.exe /d /s /c $cmdLine 2>&1 | Out-String
    $exit = $LASTEXITCODE
    Write-Host $out
    if ($exit -ne 0) { throw "Failed to set $Name for $Target" }
  }
  finally { Remove-Item $tmpPath -Force -ErrorAction SilentlyContinue }
}

$targets = if ($AllEnvs.IsPresent) { @('production','preview','development') } else { @($Env) }

foreach ($t in $targets) {
  Write-Host "Setting core envs for $t..." -ForegroundColor Cyan
  if ($PSBoundParameters.ContainsKey('NextAuthUrl')) { Set-Env -Name 'NEXTAUTH_URL' -Value $NextAuthUrl -Target $t }
  if ($PSBoundParameters.ContainsKey('NextAuthSecret')) { Set-Env -Name 'NEXTAUTH_SECRET' -Value $NextAuthSecret -Target $t }
  if ($PSBoundParameters.ContainsKey('DatabaseUrl')) { Set-Env -Name 'DATABASE_URL' -Value $DatabaseUrl -Target $t }
}

Write-Host "Done. Trigger a new deployment to apply changes." -ForegroundColor Green

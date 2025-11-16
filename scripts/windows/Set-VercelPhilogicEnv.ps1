param(
  [Parameter(Mandatory = $true)]
  [string]$Url,

  [string]$ApiKey = "local",

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
  # Remove existing then add (non-interactive via pipe)
  try { vercel env rm $Name $Target -y 2>$null | Out-Null } catch {}
  # Robust piping via temporary file + cmd to avoid Start-Process redirection issues on Windows PowerShell 5.1
  $tmpPath = [System.IO.Path]::GetTempFileName()
  try {
    # Write the value without trailing newline to avoid extra CRLF issues
    Set-Content -Path $tmpPath -Value $Value -NoNewline -Encoding ASCII

    # Build a safe cmd line that pipes the value into vercel
    $cmdLine = "type `"$tmpPath`" | vercel env add $Name $Target"
    $out = cmd.exe /d /s /c $cmdLine 2>&1 | Out-String
    $exit = $LASTEXITCODE
    Write-Host $out
    if ($exit -ne 0) { throw "Failed to set $Name for $Target" }
  }
  finally {
    Remove-Item $tmpPath -Force -ErrorAction SilentlyContinue
  }
}

if ($AllEnvs) {
  foreach ($t in @('production','preview','development')) {
    Write-Host "Setting env for $t..." -ForegroundColor Cyan
    Set-Env -Name 'PHILOGIC_AI_URL' -Value $Url -Target $t
    Set-Env -Name 'PHILOGIC_AI_API_KEY' -Value $ApiKey -Target $t
  }
} else {
  Write-Host "Setting env for $Env..." -ForegroundColor Cyan
  Set-Env -Name 'PHILOGIC_AI_URL' -Value $Url -Target $Env
  Set-Env -Name 'PHILOGIC_AI_API_KEY' -Value $ApiKey -Target $Env
}

Write-Host "Done. Trigger a new deployment to apply changes." -ForegroundColor Green

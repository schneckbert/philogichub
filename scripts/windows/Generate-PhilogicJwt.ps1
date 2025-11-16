param(
  [Parameter(Mandatory = $true)]
  [string]$User,

  [string]$ExpiresIn = "7d",

  [string]$ClaimsJson
)

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { Write-Error "Node.js not found in PATH"; exit 1 }

$script = Join-Path $PSScriptRoot "..\node\generate-jwt.mjs"

$args = @('--user', $User, '--expiresIn', $ExpiresIn)
if ($ClaimsJson) { $args += @('--claims', $ClaimsJson) }

Write-Host "Generating JWT for '$User'..." -ForegroundColor Cyan
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = $node.Source
$psi.ArgumentList = @($script) + $args
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.UseShellExecute = $false
$p = [System.Diagnostics.Process]::Start($psi)
$out = $p.StandardOutput.ReadToEnd()
$err = $p.StandardError.ReadToEnd()
$p.WaitForExit()

if ($p.ExitCode -ne 0) {
  Write-Error $err
  exit $p.ExitCode
}

Write-Host "Token:" -ForegroundColor Green
Write-Output $out.Trim()

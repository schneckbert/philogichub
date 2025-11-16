# ============================================================================
# PhilogicAI Cloudflare Tunnel Setup Script
# Richtet sicheren Tunnel zwischen deinem PC und Cloudflare ein
# ============================================================================

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "PhilogicAI Cloudflare Tunnel Setup" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

$philogicPath = "C:\philogic-ai"
$cloudflaredPath = "$philogicPath\cloudflared.exe"

# Erstelle Verzeichnis falls nicht vorhanden
if (-not (Test-Path $philogicPath)) {
    Write-Host "[INFO] Erstelle Verzeichnis: $philogicPath" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $philogicPath -Force | Out-Null
}

Set-Location $philogicPath

# ============================================================================
# 1. Download cloudflared
# ============================================================================

if (-not (Test-Path $cloudflaredPath)) {
    Write-Host "[1/5] Downloading cloudflared..." -ForegroundColor Green
    $downloadUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
    
    try {
        Invoke-WebRequest -Uri $downloadUrl -OutFile $cloudflaredPath -UseBasicParsing
        Write-Host "      cloudflared heruntergeladen!" -ForegroundColor Green
    } catch {
        Write-Host "      [ERROR] Download fehlgeschlagen: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[1/5] cloudflared bereits vorhanden" -ForegroundColor Green
}

# ============================================================================
# 2. Login zu Cloudflare
# ============================================================================

Write-Host "`n[2/5] Cloudflare Login" -ForegroundColor Green
Write-Host "      Ein Browser-Fenster wird geöffnet - bitte dort einloggen" -ForegroundColor Yellow

Start-Process -FilePath $cloudflaredPath -ArgumentList "tunnel","login" -Wait -NoNewWindow

if (-not (Test-Path "$env:USERPROFILE\.cloudflared\cert.pem")) {
    Write-Host "      [ERROR] Login fehlgeschlagen - cert.pem nicht gefunden" -ForegroundColor Red
    exit 1
}

Write-Host "      Login erfolgreich!" -ForegroundColor Green

# ============================================================================
# 3. Erstelle Tunnel
# ============================================================================

Write-Host "`n[3/5] Erstelle Tunnel 'philogic-ai-tunnel'" -ForegroundColor Green

$tunnelExists = & $cloudflaredPath tunnel list 2>&1 | Select-String "philogic-ai-tunnel"

if ($tunnelExists) {
    Write-Host "      Tunnel existiert bereits" -ForegroundColor Yellow
} else {
    & $cloudflaredPath tunnel create philogic-ai-tunnel
    Write-Host "      Tunnel erstellt!" -ForegroundColor Green
}

# Hole Tunnel Info
$tunnelInfo = & $cloudflaredPath tunnel list | Select-String "philogic-ai-tunnel"
if ($tunnelInfo -match '([a-f0-9-]{36})') {
    $tunnelId = $Matches[1]
    Write-Host "      Tunnel ID: $tunnelId" -ForegroundColor Cyan
} else {
    Write-Host "      [ERROR] Tunnel ID nicht gefunden" -ForegroundColor Red
    exit 1
}

# ============================================================================
# 4. Erstelle Config File
# ============================================================================

Write-Host "`n[4/5] Erstelle Config File" -ForegroundColor Green

$configContent = @"
tunnel: $tunnelId
credentials-file: $env:USERPROFILE\.cloudflared\$tunnelId.json

ingress:
  # PhilogicAI - nur für deine Domain
  - hostname: ai.philogichub.com
    service: http://localhost:8000
    originRequest:
      connectTimeout: 30s
      noTLSVerify: false
  
  # Catch-all
  - service: http_status:404
"@

$configPath = "$philogicPath\cloudflared-config.yml"
$configContent | Out-File -FilePath $configPath -Encoding UTF8

Write-Host "      Config erstellt: $configPath" -ForegroundColor Green

# ============================================================================
# 5. DNS Route einrichten
# ============================================================================

Write-Host "`n[5/5] Richte DNS Route ein" -ForegroundColor Green
Write-Host "      Hostname: ai.philogichub.com -> Tunnel" -ForegroundColor Cyan

$dnsExists = & $cloudflaredPath tunnel route dns philogic-ai-tunnel ai.philogichub.com 2>&1

if ($LASTEXITCODE -eq 0 -or $dnsExists -like "*already exists*") {
    Write-Host "      DNS Route eingerichtet!" -ForegroundColor Green
} else {
    Write-Host "      [WARNING] DNS Route möglicherweise fehlgeschlagen" -ForegroundColor Yellow
    Write-Host "      Bitte manuell in Cloudflare Dashboard prüfen" -ForegroundColor Yellow
}

# ============================================================================
# Setup Complete
# ============================================================================

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "============================================================`n" -ForegroundColor Cyan

Write-Host "Nächste Schritte:`n" -ForegroundColor Yellow

Write-Host "1. Starte PhilogicAI Server:" -ForegroundColor White
Write-Host "   cd C:\philogic-ai" -ForegroundColor Gray
Write-Host "   `$env:PHILOGIC_AUTH_TOKEN = 'dein-sicherer-token'" -ForegroundColor Gray
Write-Host "   python server.py`n" -ForegroundColor Gray

Write-Host "2. Starte Cloudflare Tunnel (neues Terminal):" -ForegroundColor White
Write-Host "   cd C:\philogic-ai" -ForegroundColor Gray
Write-Host "   .\cloudflared.exe tunnel --config cloudflared-config.yml run philogic-ai-tunnel`n" -ForegroundColor Gray

Write-Host "3. In Cloudflare Pages (philogichub) setze Environment Variables:" -ForegroundColor White
Write-Host "   PHILOGIC_AI_URL = https://ai.philogichub.com/api/chat" -ForegroundColor Gray
Write-Host "   PHILOGIC_AUTH_TOKEN = <derselbe-token-wie-oben>`n" -ForegroundColor Gray

Write-Host "4. Teste lokal:" -ForegroundColor White
Write-Host "   http://localhost:3000 -> Chat öffnen`n" -ForegroundColor Gray

Write-Host "Tunnel Info:" -ForegroundColor Yellow
Write-Host "   Tunnel ID: $tunnelId" -ForegroundColor Gray
Write-Host "   Hostname: ai.philogichub.com" -ForegroundColor Gray
Write-Host "   Local: http://localhost:8000" -ForegroundColor Gray

Write-Host "`n============================================================`n" -ForegroundColor Cyan

# Erstelle Startup Script
$startupScript = @"
@echo off
cd /d C:\philogic-ai
echo Starting Cloudflare Tunnel for PhilogicAI...
cloudflared.exe tunnel --config cloudflared-config.yml run philogic-ai-tunnel
pause
"@

$startupScript | Out-File -FilePath "$philogicPath\start-tunnel.bat" -Encoding ASCII

Write-Host "Startup Scripts erstellt:" -ForegroundColor Green
Write-Host "  - start-tunnel.bat (im philogic-ai Ordner)`n" -ForegroundColor Gray

Read-Host "Drücke Enter zum Beenden"

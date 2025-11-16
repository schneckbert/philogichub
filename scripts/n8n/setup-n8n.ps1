# ============================================================================
# n8n Setup Script
# Erstellt alle nötigen Ressourcen für n8n-Integration
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "n8n Setup für PhilogicAI" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

# Pfade
$infraPath = "$PSScriptRoot\..\..\infra\n8n"
$envPath = "$infraPath\.env"
$envExamplePath = "$infraPath\.env.example"
$composePath = "$infraPath\compose.yml"

# ============================================================================
# 1. Docker prüfen
# ============================================================================

Write-Host "[1/8] Prüfe Docker..." -ForegroundColor Green

try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker nicht gefunden"
    }
    Write-Host "      Docker gefunden: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "      [ERROR] Docker Desktop muss installiert sein!" -ForegroundColor Red
    Write-Host "      Download: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Prüfe ob Docker läuft
try {
    docker ps | Out-Null
    Write-Host "      Docker läuft" -ForegroundColor Green
} catch {
    Write-Host "      [ERROR] Docker läuft nicht! Bitte Docker Desktop starten." -ForegroundColor Red
    exit 1
}

# ============================================================================
# 2. Verzeichnisse prüfen/erstellen
# ============================================================================

Write-Host "`n[2/8] Prüfe Verzeichnisse..." -ForegroundColor Green

if (-not (Test-Path $infraPath)) {
    Write-Host "      [ERROR] Infra-Ordner nicht gefunden: $infraPath" -ForegroundColor Red
    exit 1
}

$dirs = @("$infraPath\pgdata", "$infraPath\n8n-data", "$infraPath\backups")
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "      Erstellt: $dir" -ForegroundColor Yellow
    }
}

Write-Host "      Verzeichnisse OK" -ForegroundColor Green

# ============================================================================
# 3. .env Datei generieren
# ============================================================================

Write-Host "`n[3/8] Generiere .env Datei..." -ForegroundColor Green

if (Test-Path $envPath) {
    Write-Host "      [WARNING] .env existiert bereits!" -ForegroundColor Yellow
    $overwrite = Read-Host "      Überschreiben? (y/N)"
    if ($overwrite -ne 'y') {
        Write-Host "      Übersprungen" -ForegroundColor Yellow
        $skipEnv = $true
    }
}

if (-not $skipEnv) {
    # Generiere sichere Secrets
    function New-SecureSecret {
        param([int]$Length = 32)
        $bytes = New-Object byte[] $Length
        [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
        return [System.Convert]::ToBase64String($bytes)
    }

    $dbPassword = New-SecureSecret -Length 24
    $encryptionKey = New-SecureSecret -Length 32
    $hmacSecret = New-SecureSecret -Length 32
    $basicAuthPassword = New-SecureSecret -Length 16

    # Erstelle .env aus Template
    if (Test-Path $envExamplePath) {
        $envContent = Get-Content $envExamplePath -Raw
        $envContent = $envContent -replace 'CHANGE_ME_SECURE_DB_PASSWORD', $dbPassword
        $envContent = $envContent -replace 'CHANGE_ME_32_BYTE_BASE64_KEY', $encryptionKey
        $envContent = $envContent -replace 'CHANGE_ME_SECURE_PASSWORD', $basicAuthPassword
        $envContent = $envContent -replace 'CHANGE_ME_32_BYTE_BASE64_HMAC_SECRET', $hmacSecret
        
        $envContent | Out-File -FilePath $envPath -Encoding UTF8 -NoNewline
        Write-Host "      .env erstellt mit sicheren Secrets" -ForegroundColor Green
    } else {
        Write-Host "      [ERROR] .env.example nicht gefunden!" -ForegroundColor Red
        exit 1
    }

    # Sichere Dateirechte setzen
    icacls $envPath /inheritance:r /grant:r "$env:USERNAME`:F" | Out-Null
    Write-Host "      Dateirechte gesichert" -ForegroundColor Green
}

# ============================================================================
# 4. Encryption Key sichern
# ============================================================================

Write-Host "`n[4/8] Sichere Encryption Key..." -ForegroundColor Green

if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    if ($envContent -match 'N8N_ENCRYPTION_KEY=(.+)') {
        $encKey = $Matches[1].Trim()
        $keyBackupPath = "$infraPath\backups\ENCRYPTION_KEY_BACKUP_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
        $encKey | Out-File -FilePath $keyBackupPath -Encoding UTF8 -NoNewline
        icacls $keyBackupPath /inheritance:r /grant:r "$env:USERNAME`:F" | Out-Null
        Write-Host "      Encryption Key gesichert: $keyBackupPath" -ForegroundColor Green
        Write-Host "      [WICHTIG] Bewahre diese Datei sicher auf!" -ForegroundColor Yellow
    }
}

# ============================================================================
# 5. Compose validieren
# ============================================================================

Write-Host "`n[5/8] Validiere Compose Config..." -ForegroundColor Green

if (-not (Test-Path $composePath)) {
    Write-Host "      [ERROR] compose.yml nicht gefunden!" -ForegroundColor Red
    exit 1
}

Push-Location $infraPath
try {
    docker compose config | Out-Null
    Write-Host "      Compose Config gültig" -ForegroundColor Green
} catch {
    Write-Host "      [ERROR] Compose Config ungültig!" -ForegroundColor Red
    Write-Host "      $_" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# ============================================================================
# 6. Images pullen
# ============================================================================

Write-Host "`n[6/8] Lade Docker Images..." -ForegroundColor Green

Push-Location $infraPath
try {
    docker compose pull
    Write-Host "      Images heruntergeladen" -ForegroundColor Green
} catch {
    Write-Host "      [WARNING] Image-Download fehlgeschlagen" -ForegroundColor Yellow
}
Pop-Location

# ============================================================================
# 7. Cloudflare-Hinweis
# ============================================================================

Write-Host "`n[7/8] Cloudflare Tunnel Konfiguration..." -ForegroundColor Green

$cloudflaredConfig = "C:\philogic-ai\cloudflared-config.yml"
if (Test-Path $cloudflaredConfig) {
    Write-Host "      Cloudflare Config gefunden" -ForegroundColor Green
    Write-Host "      [WICHTIG] Bitte CLOUDFLARE_INGRESS_UPDATE.md folgen!" -ForegroundColor Yellow
    Write-Host "      Datei: $infraPath\CLOUDFLARE_INGRESS_UPDATE.md" -ForegroundColor Cyan
} else {
    Write-Host "      [WARNING] Cloudflare Config nicht gefunden" -ForegroundColor Yellow
    Write-Host "      Erwarte: $cloudflaredConfig" -ForegroundColor Yellow
}

# ============================================================================
# 8. Zusammenfassung
# ============================================================================

Write-Host "`n[8/8] Setup Complete!" -ForegroundColor Green

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "Nächste Schritte:" -ForegroundColor Yellow
Write-Host "============================================================`n" -ForegroundColor Cyan

Write-Host "1. Cloudflare Tunnel erweitern (WICHTIG!):" -ForegroundColor White
Write-Host "   Siehe: $infraPath\CLOUDFLARE_INGRESS_UPDATE.md`n" -ForegroundColor Gray

Write-Host "2. Cloudflare Access konfigurieren:" -ForegroundColor White
Write-Host "   Siehe: $infraPath\CLOUDFLARE_ACCESS_SETUP.md`n" -ForegroundColor Gray

Write-Host "3. n8n starten:" -ForegroundColor White
Write-Host "   .\scripts\n8n\start-n8n.ps1`n" -ForegroundColor Gray

Write-Host "4. Nach Start erreichbar unter:" -ForegroundColor White
Write-Host "   Lokal:  http://localhost:5678" -ForegroundColor Gray
Write-Host "   Public: https://ai.philogichub.com/n8n (nach Access-Setup)`n" -ForegroundColor Gray

Write-Host "5. Credentials:" -ForegroundColor White
Write-Host "   Basic Auth User: admin" -ForegroundColor Gray
Write-Host "   Basic Auth Pass: (siehe .env Datei)`n" -ForegroundColor Gray

Write-Host "============================================================`n" -ForegroundColor Cyan

Write-Host "[SICHERHEIT] Wichtige Dateien:" -ForegroundColor Yellow
Write-Host "  - $envPath (NIEMALS committen!)" -ForegroundColor Gray
Write-Host "  - $infraPath\backups\ENCRYPTION_KEY_BACKUP_*.txt" -ForegroundColor Gray
Write-Host "`n" -ForegroundColor Gray

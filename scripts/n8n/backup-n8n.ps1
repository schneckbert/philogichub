# ============================================================================
# n8n Backup Script
# Sichert Postgres DB, Workflows, Credentials und Encryption Key
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "n8n Backup" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

$infraPath = "$PSScriptRoot\..\..\infra\n8n"
$backupDir = "$infraPath\backups"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = "$backupDir\n8n_backup_$timestamp"

# Erstelle Backup-Verzeichnis
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

New-Item -ItemType Directory -Path $backupPath -Force | Out-Null

Write-Host "[1/5] Prüfe n8n Status..." -ForegroundColor Green

Push-Location $infraPath
$running = docker compose ps --services --filter "status=running" 2>&1 | Select-String "n8n"

if (-not $running) {
    Write-Host "      [WARNING] n8n läuft nicht!" -ForegroundColor Yellow
    Write-Host "      Backup nur von Dateien möglich" -ForegroundColor Yellow
    $servicesRunning = $false
} else {
    Write-Host "      n8n läuft" -ForegroundColor Green
    $servicesRunning = $true
}

# Backup Postgres
Write-Host "`n[2/5] Backup Postgres Datenbank..." -ForegroundColor Green

if ($servicesRunning) {
    try {
        docker compose exec -T postgres pg_dump -U n8n -d n8n --clean --if-exists | Out-File -FilePath "$backupPath\postgres_dump.sql" -Encoding UTF8
        Write-Host "      Postgres Dump erstellt" -ForegroundColor Green
    } catch {
        Write-Host "      [ERROR] Postgres Dump fehlgeschlagen!" -ForegroundColor Red
        Write-Host "      $_" -ForegroundColor Red
    }
} else {
    Write-Host "      Übersprungen (n8n läuft nicht)" -ForegroundColor Yellow
}

# Backup Workflows
Write-Host "`n[3/5] Backup Workflows..." -ForegroundColor Green

if ($servicesRunning) {
    try {
        # Export alle Workflows
        $workflows = docker compose exec -T n8n n8n export:workflow --all --output=/tmp/workflows.json 2>&1
        docker compose cp n8n:/tmp/workflows.json "$backupPath\workflows.json" 2>&1 | Out-Null
        Write-Host "      Workflows exportiert" -ForegroundColor Green
    } catch {
        Write-Host "      [WARNING] Workflow-Export fehlgeschlagen" -ForegroundColor Yellow
    }
} else {
    Write-Host "      Übersprungen (n8n läuft nicht)" -ForegroundColor Yellow
}

# Backup Credentials
Write-Host "`n[4/5] Backup Credentials..." -ForegroundColor Green

if ($servicesRunning) {
    try {
        $credentials = docker compose exec -T n8n n8n export:credentials --all --output=/tmp/credentials.json 2>&1
        docker compose cp n8n:/tmp/credentials.json "$backupPath\credentials.json" 2>&1 | Out-Null
        Write-Host "      Credentials exportiert" -ForegroundColor Green
    } catch {
        Write-Host "      [WARNING] Credentials-Export fehlgeschlagen" -ForegroundColor Yellow
    }
} else {
    Write-Host "      Übersprungen (n8n läuft nicht)" -ForegroundColor Yellow
}

# Backup Encryption Key
Write-Host "`n[5/5] Backup Encryption Key..." -ForegroundColor Green

$envPath = "$infraPath\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    if ($envContent -match 'N8N_ENCRYPTION_KEY=(.+)') {
        $encKey = $Matches[1].Trim()
        $encKey | Out-File -FilePath "$backupPath\ENCRYPTION_KEY.txt" -Encoding UTF8 -NoNewline
        
        # Sichere auch HMAC Secret
        if ($envContent -match 'N8N_WEBHOOK_HMAC_SECRET=(.+)') {
            $hmacSecret = $Matches[1].Trim()
            $hmacSecret | Out-File -FilePath "$backupPath\HMAC_SECRET.txt" -Encoding UTF8 -NoNewline
        }
        
        Write-Host "      Encryption Key gesichert" -ForegroundColor Green
    }
}

# Backup Volumes (optional, als Fallback)
Write-Host "`nBackup Volumes (optional)..." -ForegroundColor Green
if (Test-Path "$infraPath\n8n-data") {
    Copy-Item -Path "$infraPath\n8n-data" -Destination "$backupPath\n8n-data-backup" -Recurse -Force 2>&1 | Out-Null
    Write-Host "      n8n-data Ordner gesichert" -ForegroundColor Green
}

Pop-Location

# Erstelle Archive
Write-Host "`nErstelle Archive..." -ForegroundColor Green
$archivePath = "$backupDir\n8n_backup_$timestamp.zip"
Compress-Archive -Path $backupPath -DestinationPath $archivePath -Force

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "Backup Complete!" -ForegroundColor Green
Write-Host "============================================================`n" -ForegroundColor Cyan

Write-Host "Backup gespeichert unter:" -ForegroundColor White
Write-Host "  Ordner: $backupPath" -ForegroundColor Cyan
Write-Host "  Archiv: $archivePath`n" -ForegroundColor Cyan

Write-Host "Enthält:" -ForegroundColor White
Write-Host "  - Postgres Dump (postgres_dump.sql)" -ForegroundColor Gray
Write-Host "  - Workflows (workflows.json)" -ForegroundColor Gray
Write-Host "  - Credentials (credentials.json)" -ForegroundColor Gray
Write-Host "  - Encryption Key (ENCRYPTION_KEY.txt)" -ForegroundColor Gray
Write-Host "  - HMAC Secret (HMAC_SECRET.txt)" -ForegroundColor Gray
Write-Host "  - n8n Daten (n8n-data-backup/)`n" -ForegroundColor Gray

Write-Host "[WICHTIG] Backup an sicherem Ort aufbewahren!" -ForegroundColor Yellow

# ============================================================================
# n8n Restore Script
# Stellt Postgres DB, Workflows und Credentials wieder her
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "n8n Restore" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

$infraPath = "$PSScriptRoot\..\..\infra\n8n"
$backupDir = "$infraPath\backups"

# Liste verfügbare Backups
Write-Host "Verfügbare Backups:" -ForegroundColor Green
$backups = Get-ChildItem -Path $backupDir -Directory | Where-Object { $_.Name -match '^n8n_backup_\d{8}_\d{6}$' } | Sort-Object Name -Descending

if ($backups.Count -eq 0) {
    Write-Host "Keine Backups gefunden in: $backupDir" -ForegroundColor Red
    exit 1
}

for ($i = 0; $i -lt $backups.Count; $i++) {
    Write-Host "  [$i] $($backups[$i].Name)" -ForegroundColor Cyan
}

# Backup auswählen
Write-Host "`nWelches Backup wiederherstellen?" -ForegroundColor Yellow
$selection = Read-Host "Nummer eingeben (0-$($backups.Count - 1))"

if (-not ($selection -match '^\d+$') -or [int]$selection -ge $backups.Count) {
    Write-Host "[ERROR] Ungültige Auswahl!" -ForegroundColor Red
    exit 1
}

$selectedBackup = $backups[[int]$selection]
$backupPath = $selectedBackup.FullName

Write-Host "`nGewähltes Backup: $($selectedBackup.Name)" -ForegroundColor Green

# Sicherheitsabfrage
Write-Host "`n[WARNUNG] Dies überschreibt aktuelle Daten!" -ForegroundColor Red
$confirm = Read-Host "Fortfahren? (yes/no)"

if ($confirm -ne 'yes') {
    Write-Host "Abgebrochen" -ForegroundColor Yellow
    exit 0
}

# Stoppe Services
Write-Host "`n[1/6] Stoppe n8n Services..." -ForegroundColor Green

Push-Location $infraPath
docker compose down
Write-Host "      Services gestoppt" -ForegroundColor Green

# Restore Encryption Key
Write-Host "`n[2/6] Restore Encryption Key..." -ForegroundColor Green

$encKeyPath = "$backupPath\ENCRYPTION_KEY.txt"
$envPath = "$infraPath\.env"

if (Test-Path $encKeyPath) {
    $encKey = Get-Content $encKeyPath -Raw
    
    if (Test-Path $envPath) {
        $envContent = Get-Content $envPath -Raw
        $envContent = $envContent -replace 'N8N_ENCRYPTION_KEY=.+', "N8N_ENCRYPTION_KEY=$encKey"
        $envContent | Out-File -FilePath $envPath -Encoding UTF8 -NoNewline
        Write-Host "      Encryption Key wiederhergestellt" -ForegroundColor Green
    } else {
        Write-Host "      [WARNING] .env nicht gefunden!" -ForegroundColor Yellow
    }
} else {
    Write-Host "      [WARNING] Encryption Key nicht im Backup!" -ForegroundColor Yellow
}

# Restore HMAC Secret
$hmacPath = "$backupPath\HMAC_SECRET.txt"
if (Test-Path $hmacPath -and Test-Path $envPath) {
    $hmacSecret = Get-Content $hmacPath -Raw
    $envContent = Get-Content $envPath -Raw
    $envContent = $envContent -replace 'N8N_WEBHOOK_HMAC_SECRET=.+', "N8N_WEBHOOK_HMAC_SECRET=$hmacSecret"
    $envContent | Out-File -FilePath $envPath -Encoding UTF8 -NoNewline
    Write-Host "      HMAC Secret wiederhergestellt" -ForegroundColor Green
}

# Starte nur Postgres
Write-Host "`n[3/6] Starte Postgres..." -ForegroundColor Green
docker compose up -d postgres
Start-Sleep -Seconds 10
Write-Host "      Postgres gestartet" -ForegroundColor Green

# Restore Postgres
Write-Host "`n[4/6] Restore Postgres Datenbank..." -ForegroundColor Green

$dumpPath = "$backupPath\postgres_dump.sql"
if (Test-Path $dumpPath) {
    try {
        Get-Content $dumpPath | docker compose exec -T postgres psql -U n8n -d n8n
        Write-Host "      Postgres wiederhergestellt" -ForegroundColor Green
    } catch {
        Write-Host "      [ERROR] Postgres Restore fehlgeschlagen!" -ForegroundColor Red
        Write-Host "      $_" -ForegroundColor Red
    }
} else {
    Write-Host "      [WARNING] Postgres Dump nicht gefunden!" -ForegroundColor Yellow
}

# Starte n8n
Write-Host "`n[5/6] Starte n8n..." -ForegroundColor Green
docker compose up -d n8n
Start-Sleep -Seconds 15
Write-Host "      n8n gestartet" -ForegroundColor Green

# Restore Workflows
Write-Host "`n[6/6] Restore Workflows & Credentials..." -ForegroundColor Green

$workflowsPath = "$backupPath\workflows.json"
if (Test-Path $workflowsPath) {
    try {
        docker compose cp "$workflowsPath" n8n:/tmp/workflows.json
        docker compose exec -T n8n n8n import:workflow --input=/tmp/workflows.json 2>&1 | Out-Null
        Write-Host "      Workflows importiert" -ForegroundColor Green
    } catch {
        Write-Host "      [WARNING] Workflow-Import fehlgeschlagen" -ForegroundColor Yellow
    }
}

$credentialsPath = "$backupPath\credentials.json"
if (Test-Path $credentialsPath) {
    try {
        docker compose cp "$credentialsPath" n8n:/tmp/credentials.json
        docker compose exec -T n8n n8n import:credentials --input=/tmp/credentials.json 2>&1 | Out-Null
        Write-Host "      Credentials importiert" -ForegroundColor Green
    } catch {
        Write-Host "      [WARNING] Credentials-Import fehlgeschlagen" -ForegroundColor Yellow
    }
}

# Health Check
Write-Host "`nHealth Check..." -ForegroundColor Green
Start-Sleep -Seconds 5

$healthy = $false
for ($i = 0; $i -lt 6; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5678/healthz" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $healthy = $true
            Write-Host "      n8n ist bereit!" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "      Warte... ($($i + 1)/6)" -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

Pop-Location

Write-Host "`n============================================================" -ForegroundColor Cyan
if ($healthy) {
    Write-Host "Restore Complete!" -ForegroundColor Green
} else {
    Write-Host "Restore abgeschlossen (Health Check fehlgeschlagen)" -ForegroundColor Yellow
}
Write-Host "============================================================`n" -ForegroundColor Cyan

Write-Host "n8n erreichbar unter:" -ForegroundColor White
Write-Host "  http://localhost:5678`n" -ForegroundColor Cyan

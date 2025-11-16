# ============================================================================
# n8n Update Script
# Updated n8n auf neue Version (mit Backup und Rollback)
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "n8n Update" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

$infraPath = "$PSScriptRoot\..\..\infra\n8n"
$composePath = "$infraPath\compose.yml"

# Aktuelle Version prüfen
Write-Host "[1/7] Aktuelle Version..." -ForegroundColor Green

Push-Location $infraPath

try {
    $currentVersion = docker compose exec -T n8n n8n --version 2>&1 | Select-String -Pattern '\d+\.\d+\.\d+' | ForEach-Object { $_.Matches[0].Value }
    if ($currentVersion) {
        Write-Host "      Installiert: n8n v$currentVersion" -ForegroundColor Cyan
    } else {
        Write-Host "      Version konnte nicht ermittelt werden" -ForegroundColor Yellow
    }
} catch {
    Write-Host "      n8n läuft nicht oder Version unbekannt" -ForegroundColor Yellow
}

# Neue Version prüfen
Write-Host "`n[2/7] Prüfe neue Version..." -ForegroundColor Green

$newVersion = Read-Host "Neue Version (z.B. 1.21.0) oder 'latest' für neueste"

if ($newVersion -eq '') {
    Write-Host "[ERROR] Keine Version angegeben!" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Bestätigung
Write-Host "`n[WICHTIG] Update von v$currentVersion zu v$newVersion" -ForegroundColor Yellow
$confirm = Read-Host "Fortfahren? (yes/no)"

if ($confirm -ne 'yes') {
    Write-Host "Abgebrochen" -ForegroundColor Yellow
    Pop-Location
    exit 0
}

# Backup vor Update
Write-Host "`n[3/7] Erstelle Backup..." -ForegroundColor Green

Pop-Location
& "$PSScriptRoot\backup-n8n.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Backup fehlgeschlagen!" -ForegroundColor Red
    exit 1
}
Push-Location $infraPath

Write-Host "      Backup erstellt" -ForegroundColor Green

# Update compose.yml
Write-Host "`n[4/7] Update compose.yml..." -ForegroundColor Green

if (Test-Path $composePath) {
    $composeContent = Get-Content $composePath -Raw
    
    # Backup compose.yml
    $composeBackup = "$infraPath\compose.yml.backup"
    $composeContent | Out-File -FilePath $composeBackup -Encoding UTF8 -NoNewline
    
    # Update Image Tag
    $newTag = if ($newVersion -eq 'latest') { 'latest' } else { $newVersion }
    $composeContent = $composeContent -replace 'image: n8nio/n8n:.+', "image: n8nio/n8n:$newTag"
    $composeContent | Out-File -FilePath $composePath -Encoding UTF8 -NoNewline
    
    Write-Host "      compose.yml aktualisiert auf n8nio/n8n:$newTag" -ForegroundColor Green
} else {
    Write-Host "      [ERROR] compose.yml nicht gefunden!" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Pull neues Image
Write-Host "`n[5/7] Lade neues Image..." -ForegroundColor Green

try {
    docker compose pull n8n
    Write-Host "      Image heruntergeladen" -ForegroundColor Green
} catch {
    Write-Host "      [ERROR] Image Download fehlgeschlagen!" -ForegroundColor Red
    
    # Rollback compose.yml
    if (Test-Path $composeBackup) {
        Copy-Item -Path $composeBackup -Destination $composePath -Force
        Write-Host "      compose.yml zurückgesetzt" -ForegroundColor Yellow
    }
    
    Pop-Location
    exit 1
}

# Restart Services
Write-Host "`n[6/7] Restart Services..." -ForegroundColor Green

docker compose down
Start-Sleep -Seconds 2
docker compose up -d

Write-Host "      Services neu gestartet" -ForegroundColor Green

# Health Check
Write-Host "`n[7/7] Health Check..." -ForegroundColor Green
Start-Sleep -Seconds 10

$healthy = $false
$maxRetries = 12

for ($i = 0; $i -lt $maxRetries; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5678/healthz" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $healthy = $true
            Write-Host "      n8n ist bereit!" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "      Warte... ($($i + 1)/$maxRetries)" -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

# Neue Version verifizieren
if ($healthy) {
    try {
        $updatedVersion = docker compose exec -T n8n n8n --version 2>&1 | Select-String -Pattern '\d+\.\d+\.\d+' | ForEach-Object { $_.Matches[0].Value }
        if ($updatedVersion) {
            Write-Host "      Neue Version: n8n v$updatedVersion" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "      Version konnte nicht ermittelt werden" -ForegroundColor Yellow
    }
}

Pop-Location

Write-Host "`n============================================================" -ForegroundColor Cyan
if ($healthy) {
    Write-Host "Update Complete!" -ForegroundColor Green
    Write-Host "============================================================`n" -ForegroundColor Cyan
    
    Write-Host "n8n erfolgreich aktualisiert!" -ForegroundColor White
    Write-Host "  Von: v$currentVersion" -ForegroundColor Gray
    Write-Host "  Zu:  v$updatedVersion`n" -ForegroundColor Gray
    
    # Cleanup Backup
    if (Test-Path "$infraPath\compose.yml.backup") {
        Remove-Item "$infraPath\compose.yml.backup" -Force
    }
} else {
    Write-Host "Update fehlgeschlagen!" -ForegroundColor Red
    Write-Host "============================================================`n" -ForegroundColor Cyan
    
    Write-Host "[ROLLBACK] Stelle alte Version wieder her:" -ForegroundColor Yellow
    Write-Host "  1. cd $infraPath" -ForegroundColor Gray
    Write-Host "  2. Copy-Item compose.yml.backup compose.yml -Force" -ForegroundColor Gray
    Write-Host "  3. docker compose down" -ForegroundColor Gray
    Write-Host "  4. docker compose up -d`n" -ForegroundColor Gray
    
    Write-Host "Oder restore letztes Backup:" -ForegroundColor Yellow
    Write-Host "  .\scripts\n8n\restore-n8n.ps1`n" -ForegroundColor Gray
}

Write-Host "Backup verfügbar unter:" -ForegroundColor White
Write-Host "  $infraPath\backups\`n" -ForegroundColor Cyan

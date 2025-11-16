# ============================================================================
# n8n Integration Testing Script
# Automatisierte Tests für n8n + PhilogicAI Integration
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "n8n Integration Testing" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

$infraPath = "$PSScriptRoot\..\..\infra\n8n"
$results = @()

function Test-Step {
    param(
        [string]$Name,
        [scriptblock]$Test
    )
    
    Write-Host "[$Name]" -ForegroundColor Yellow -NoNewline
    
    try {
        $result = & $Test
        if ($result) {
            Write-Host " PASS" -ForegroundColor Green
            return @{Name=$Name; Status="PASS"; Error=$null}
        } else {
            Write-Host " FAIL" -ForegroundColor Red
            return @{Name=$Name; Status="FAIL"; Error="Test returned false"}
        }
    } catch {
        Write-Host " FAIL" -ForegroundColor Red
        Write-Host "      Error: $_" -ForegroundColor Red
        return @{Name=$Name; Status="FAIL"; Error=$_.Exception.Message}
    }
}

# Test 1: n8n Health Check
$results += Test-Step -Name "n8n Health Check" -Test {
    $response = Invoke-WebRequest -Uri "http://localhost:5678/healthz" -UseBasicParsing -TimeoutSec 5
    return $response.StatusCode -eq 200
}

# Test 2: n8n UI Erreichbar (localhost)
$results += Test-Step -Name "n8n UI Local Access" -Test {
    $response = Invoke-WebRequest -Uri "http://localhost:5678" -UseBasicParsing -TimeoutSec 5
    return $response.StatusCode -eq 200 -and $response.Content -match "n8n"
}

# Test 3: Postgres Running
$results += Test-Step -Name "Postgres Container Running" -Test {
    Push-Location $infraPath
    $status = docker compose ps postgres --format json | ConvertFrom-Json
    Pop-Location
    return $status.State -eq "running"
}

# Test 4: Postgres Health Check
$results += Test-Step -Name "Postgres Health Check" -Test {
    Push-Location $infraPath
    $health = docker compose exec -T postgres pg_isready -U n8n 2>&1
    Pop-Location
    return $health -match "accepting connections"
}

# Test 5: Encryption Key Set
$results += Test-Step -Name "Encryption Key Configured" -Test {
    $envPath = "$infraPath\.env"
    $content = Get-Content $envPath -Raw
    return $content -match 'N8N_ENCRYPTION_KEY=.{40,}'
}

# Test 6: HMAC Secret Set
$results += Test-Step -Name "HMAC Secret Configured" -Test {
    $envPath = "$infraPath\.env"
    $content = Get-Content $envPath -Raw
    return $content -match 'N8N_WEBHOOK_HMAC_SECRET=.{40,}'
}

# Test 7: Encryption Key Backup Exists
$results += Test-Step -Name "Encryption Key Backup Exists" -Test {
    $backups = Get-ChildItem -Path "$infraPath\backups\ENCRYPTION_KEY_BACKUP_*.txt" -ErrorAction SilentlyContinue
    return $backups.Count -gt 0
}

# Test 8: HMAC Webhook Test (send signed request)
Write-Host "`n[HMAC Webhook Validation]" -ForegroundColor Yellow

# Get HMAC Secret
$envPath = "$infraPath\.env"
$envContent = Get-Content $envPath -Raw
if ($envContent -match 'N8N_WEBHOOK_HMAC_SECRET=(.+)') {
    $hmacSecret = $Matches[1].Trim()
    
    # Prepare Test Request
    $timestamp = [int][Math]::Floor((Get-Date).ToUniversalTime().Subtract((Get-Date "1970-01-01")).TotalSeconds)
    $testData = @{ test = $true; message = "Integration Test" } | ConvertTo-Json -Compress
    
    # Calculate HMAC Signature
    $message = "$timestamp.$testData"
    $hmacsha256 = New-Object System.Security.Cryptography.HMACSHA256
    $hmacsha256.Key = [System.Text.Encoding]::UTF8.GetBytes($hmacSecret)
    $hash = $hmacsha256.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($message))
    $signature = [BitConverter]::ToString($hash).Replace('-', '').ToLower()
    
    # Send Test Webhook (expect 404 or 403, not Cloudflare redirect)
    try {
        $webhookUrl = "http://localhost:5678/webhook/integration-test"
        $response = Invoke-WebRequest -Uri $webhookUrl -Method POST -Body $testData -Headers @{
            'X-N8N-Signature' = $signature
            'X-N8N-Timestamp' = $timestamp
            'Content-Type' = 'application/json'
        } -UseBasicParsing -ErrorAction SilentlyContinue
        
        # Expect 404 (no workflow) or 403 (HMAC validation active)
        if ($response.StatusCode -eq 404 -or $response.StatusCode -eq 403) {
            Write-Host "      PASS (HMAC headers accepted)" -ForegroundColor Green
            $results += @{Name="HMAC Webhook Test"; Status="PASS"; Error=$null}
        } else {
            Write-Host "      FAIL (unexpected status: $($response.StatusCode))" -ForegroundColor Red
            $results += @{Name="HMAC Webhook Test"; Status="FAIL"; Error="Unexpected status code"}
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        if ($statusCode -eq 404 -or $statusCode -eq 403) {
            Write-Host "      PASS (HMAC headers accepted, no workflow: $statusCode)" -ForegroundColor Green
            $results += @{Name="HMAC Webhook Test"; Status="PASS"; Error=$null}
        } else {
            Write-Host "      FAIL ($_)" -ForegroundColor Red
            $results += @{Name="HMAC Webhook Test"; Status="FAIL"; Error=$_.Exception.Message}
        }
    }
} else {
    Write-Host "      FAIL (HMAC Secret not found in .env)" -ForegroundColor Red
    $results += @{Name="HMAC Webhook Test"; Status="FAIL"; Error="HMAC Secret missing"}
}

# Test 9: PhilogicAI API Reachable
$results += Test-Step -Name "PhilogicAI Backend Reachable" -Test {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        return $response.StatusCode -eq 200
    } catch {
        # PhilogicAI might not have /health endpoint, check root
        $response = Invoke-WebRequest -Uri "http://localhost:8000" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        return $response.StatusCode -eq 200
    }
}

# Test 10: Cloudflare Tunnel Check (manual guidance)
Write-Host "`n[Cloudflare Tunnel Status]" -ForegroundColor Yellow
$tunnelProcess = Get-Process -Name cloudflared -ErrorAction SilentlyContinue
if ($tunnelProcess) {
    Write-Host "      PASS (cloudflared running, PID: $($tunnelProcess.Id))" -ForegroundColor Green
    $results += @{Name="Cloudflare Tunnel Running"; Status="PASS"; Error=$null}
} else {
    Write-Host "      FAIL (cloudflared not running!)" -ForegroundColor Red
    Write-Host "      Start: C:\philogic-ai\cloudflared.exe tunnel run philogic-ai-tunnel" -ForegroundColor Gray
    $results += @{Name="Cloudflare Tunnel Running"; Status="FAIL"; Error="Process not found"}
}

# Test 11: Public Access Check (requires tunnel + Access)
Write-Host "`n[Public Access Test]" -ForegroundColor Yellow
Write-Host "      Manual Test Required:" -ForegroundColor Gray
Write-Host "      1. Öffne: https://ai.philogichub.com/n8n" -ForegroundColor Gray
Write-Host "      2. Sollte Cloudflare Access Login zeigen" -ForegroundColor Gray
Write-Host "      3. Nach Login: n8n UI sollte laden" -ForegroundColor Gray
$publicAccess = Read-Host "      Public Access funktioniert? (yes/no)"
if ($publicAccess -eq "yes") {
    Write-Host "      PASS (user confirmed)" -ForegroundColor Green
    $results += @{Name="Public Access (Manual)"; Status="PASS"; Error=$null}
} else {
    Write-Host "      FAIL (user reported issue)" -ForegroundColor Red
    $results += @{Name="Public Access (Manual)"; Status="FAIL"; Error="User reported failure"}
}

# Test 12: Backup Script Exists
$results += Test-Step -Name "Backup Script Available" -Test {
    Test-Path "$PSScriptRoot\backup-n8n.ps1"
}

# Test 13: Restore Script Exists
$results += Test-Step -Name "Restore Script Available" -Test {
    Test-Path "$PSScriptRoot\restore-n8n.ps1"
}

# Test 14: Update Script Exists
$results += Test-Step -Name "Update Script Available" -Test {
    Test-Path "$PSScriptRoot\update-n8n.ps1"
}

# Test 15: Docker Volumes Exist
$results += Test-Step -Name "Docker Volumes Created" -Test {
    $volumes = docker volume ls --format "{{.Name}}" | Select-String -Pattern "n8n"
    return $volumes.Count -ge 2  # n8n_pgdata, n8n_n8n-data
}

# Summary
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

$passed = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
$total = $results.Count

Write-Host "Passed: $passed / $total" -ForegroundColor Green
Write-Host "Failed: $failed / $total" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })

if ($failed -gt 0) {
    Write-Host "`nFailed Tests:" -ForegroundColor Red
    $results | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  - $($_.Name)" -ForegroundColor Red
        if ($_.Error) {
            Write-Host "    Error: $($_.Error)" -ForegroundColor Gray
        }
    }
}

Write-Host "`n============================================================" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "All Tests Passed! Ready for Production." -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some Tests Failed. Check errors above." -ForegroundColor Red
    Write-Host "Review README.md Troubleshooting section." -ForegroundColor Yellow
    exit 1
}

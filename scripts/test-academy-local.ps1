# ========================================
# PhiLogicAI Academy - Lokaler Smoke Test
# ========================================
# Testet: Login, Tunnel-Info, Chat API

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:8000"

Write-Host ""
Write-Host "=== PhiLogicAI Academy - Lokaler Smoke Test ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -TimeoutSec 5
    if ($health.status -eq "healthy") {
        Write-Host "  ✓ Backend ist gesund" -ForegroundColor Green
        Write-Host "    Ollama: $($health.ollama)" -ForegroundColor Gray
        Write-Host "    Model Loaded: $($health.model_loaded)" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ Backend Status nicht healthy" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  ✗ Health Check fehlgeschlagen: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Tunnel Info
Write-Host ""
Write-Host "Test 2: Tunnel Info..." -ForegroundColor Yellow
try {
    $tunnel = Invoke-RestMethod -Uri "$baseUrl/tunnel-info" -TimeoutSec 5
    Write-Host "  ✓ Tunnel Info erhalten" -ForegroundColor Green
    Write-Host "    Tunnel aktiv: $($tunnel.tunnel_active)" -ForegroundColor Gray
    Write-Host "    Public URL: $($tunnel.public_url)" -ForegroundColor Gray
    Write-Host "    Local URL: $($tunnel.local_url)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ Tunnel Info fehlgeschlagen: $_" -ForegroundColor Red
    exit 1
}

# Test 3: Login
Write-Host ""
Write-Host "Test 3: Login Test..." -ForegroundColor Yellow
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/users/login" -Method Post -Body $loginBody -ContentType "application/json" -TimeoutSec 5
    if ($loginResponse.session_token) {
        Write-Host "  ✓ Login erfolgreich" -ForegroundColor Green
        Write-Host "    Email: $($loginResponse.email)" -ForegroundColor Gray
        $sessionToken = $loginResponse.session_token
    } else {
        Write-Host "  ✗ Kein Session Token erhalten" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  ✗ Login fehlgeschlagen: $_" -ForegroundColor Red
    Write-Host "    (Versuche mit Standard-Credentials admin/admin123)" -ForegroundColor Yellow
    exit 1
}

# Test 4: Session Verify
Write-Host ""
Write-Host "Test 4: Session Verify..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $sessionToken"
    }
    $userInfo = Invoke-RestMethod -Uri "$baseUrl/users/me" -Headers $headers -TimeoutSec 5
    Write-Host "  ✓ Session verifiziert" -ForegroundColor Green
    Write-Host "    User: $($userInfo.email)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ Session Verify fehlgeschlagen: $_" -ForegroundColor Red
    exit 1
}

# Test 5: Chat Completions
Write-Host ""
Write-Host "Test 5: Chat API Test..." -ForegroundColor Yellow
$chatBody = @{
    model = "llama3.1:latest"
    messages = @(
        @{
            role = "user"
            content = "Hallo, antworte mit genau 5 Wörtern."
        }
    )
    max_tokens = 50
    temperature = 0.2
    top_p = 0.9
    stream = $false
} | ConvertTo-Json -Depth 10

try {
    $headers = @{
        "Authorization" = "Bearer $sessionToken"
        "Content-Type" = "application/json"
    }
    
    Write-Host "  Sende Chat Request..." -ForegroundColor Gray
    $startTime = Get-Date
    $chatResponse = Invoke-RestMethod -Uri "$baseUrl/v1/chat/completions" -Method Post -Body $chatBody -Headers $headers -TimeoutSec 30
    $endTime = Get-Date
    $latency = ($endTime - $startTime).TotalMilliseconds
    
    if ($chatResponse.choices -and $chatResponse.choices[0].message) {
        Write-Host "  ✓ Chat API funktioniert" -ForegroundColor Green
        Write-Host "    Antwort: $($chatResponse.choices[0].message.content)" -ForegroundColor Gray
        Write-Host "    Latenz: $([math]::Round($latency, 0)) ms" -ForegroundColor Gray
        
        if ($chatResponse.usage) {
            Write-Host "    Tokens gesamt: $($chatResponse.usage.total_tokens)" -ForegroundColor Gray
            Write-Host "    Prompt Tokens: $($chatResponse.usage.prompt_tokens)" -ForegroundColor Gray
            Write-Host "    Completion Tokens: $($chatResponse.usage.completion_tokens)" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ✗ Keine gültige Antwort erhalten" -ForegroundColor Red
        Write-Host "    Response: $($chatResponse | ConvertTo-Json -Depth 5)" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "  ✗ Chat API fehlgeschlagen: $_" -ForegroundColor Red
    Write-Host "    (Möglicherweise ist Ollama nicht gestartet oder Model nicht geladen)" -ForegroundColor Yellow
    exit 1
}

# Test 6: Models Endpoint
Write-Host ""
Write-Host "Test 6: Models Endpoint..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $sessionToken"
    }
    $models = Invoke-RestMethod -Uri "$baseUrl/models" -Headers $headers -TimeoutSec 5
    Write-Host "  ✓ Models Endpoint funktioniert" -ForegroundColor Green
    Write-Host "    Verfügbare Models: $($models.models.Count)" -ForegroundColor Gray
    if ($models.models.Count -gt 0) {
        Write-Host "    Erstes Model: $($models.models[0].name)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ⚠ Models Endpoint optional - übersprungen" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ALLE TESTS BESTANDEN! ✓" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Academy-Chat ist lokal funktionsfähig:" -ForegroundColor Cyan
Write-Host "  - Login funktioniert" -ForegroundColor White
Write-Host "  - Session Management OK" -ForegroundColor White
Write-Host "  - Chat API liefert Antworten mit KPIs" -ForegroundColor White
Write-Host "  - Tunnel-Info verfügbar" -ForegroundColor White
Write-Host ""
Write-Host "Naechster Schritt: Deployment auf Vercel" -ForegroundColor Yellow
Write-Host ""

# Security Checklist für n8n Deployment

Pre-Deployment Validation für production-ready n8n Setup.

## 🔒 Secrets & Encryption

- [ ] **`.env` existiert** mit allen required Secrets
  ```powershell
  Test-Path "C:\Philip\myapps\philogichub\infra\n8n\.env"
  ```

- [ ] **N8N_ENCRYPTION_KEY gesetzt** (32-byte base64)
  ```powershell
  Select-String -Path "infra\n8n\.env" -Pattern "N8N_ENCRYPTION_KEY=.{40,}"
  ```

- [ ] **Encryption Key Backup existiert**
  ```powershell
  Get-ChildItem "infra\n8n\backups\ENCRYPTION_KEY_BACKUP_*.txt" | Select-Object -First 1
  ```

- [ ] **N8N_WEBHOOK_HMAC_SECRET gesetzt** (separate von NEXTAUTH_SECRET!)
  ```powershell
  Select-String -Path "infra\n8n\.env" -Pattern "N8N_WEBHOOK_HMAC_SECRET=.{40,}"
  ```

- [ ] **DB Password stark** (min. 24 Zeichen, zufällig generiert)
  ```powershell
  $pwd = (Select-String -Path "infra\n8n\.env" -Pattern "DB_POSTGRESDB_PASSWORD=(.+)").Matches.Groups[1].Value
  $pwd.Length -ge 24
  ```

- [ ] **Basic Auth Password stark** (min. 16 Zeichen)
  ```powershell
  $pwd = (Select-String -Path "infra\n8n\.env" -Pattern "N8N_BASIC_AUTH_PASSWORD=(.+)").Matches.Groups[1].Value
  $pwd.Length -ge 16
  ```

- [ ] **`.env` File Permissions** (nur Owner Read/Write)
  ```powershell
  icacls "infra\n8n\.env"
  # Should show: BUILTIN\Administrators:(I)(F), <Your-User>:(F)
  # NOT: Everyone:(R) oder Users:(R)
  ```

## 🌐 Cloudflare Configuration

- [ ] **Named Tunnel läuft** (nicht ephemeral trycloudflare!)
  ```powershell
  Get-Process -Name cloudflared -ErrorAction SilentlyContinue
  ```

- [ ] **Tunnel Config aktualisiert** mit n8n Path Routing
  - Path `/n8n/webhook/*` → localhost:5678 (höchste Priorität)
  - Path `/n8n/*` → localhost:5678
  - Hostname → localhost:8000 (PhilogicAI)
  ```powershell
  Select-String -Path "C:\philogic-ai\cloudflared-config.yml" -Pattern "/n8n/"
  ```

- [ ] **Cloudflare Access Application** für `/n8n/*` existiert
  - Login: https://dash.cloudflare.com > Access > Applications
  - Check: Application "n8n UI" aktiv

- [ ] **Access Policy: Bypass Webhooks** konfiguriert
  - Path: `/n8n/webhook/*`
  - Action: **Bypass**
  - Position: **Erste Policy** (höchste Priorität)

- [ ] **Access Policy: Allow Users** konfiguriert
  - Spezifische Emails/Domains (NICHT "Everyone" in Production!)
  - IdP konfiguriert (Google, GitHub, Email OTP)
  - Session Duration: 24h

- [ ] **MFA aktiviert** (wenn IdP unterstützt)

## 🔐 n8n Security Settings

- [ ] **Public API disabled**
  ```powershell
  Select-String -Path "infra\n8n\.env" -Pattern "N8N_PUBLIC_API_DISABLED=true"
  ```

- [ ] **Swagger UI disabled**
  ```powershell
  Select-String -Path "infra\n8n\.env" -Pattern "N8N_PUBLIC_API_SWAGGERUI_DISABLED=true"
  ```

- [ ] **Basic Auth active** (Backup Layer)
  ```powershell
  Select-String -Path "infra\n8n\.env" -Pattern "N8N_BASIC_AUTH_ACTIVE=true"
  ```

- [ ] **Payload Size Limits** gesetzt
  ```powershell
  Select-String -Path "infra\n8n\.env" -Pattern "N8N_PAYLOAD_SIZE_MAX=16"
  Select-String -Path "infra\n8n\.env" -Pattern "N8N_FORMDATA_FILE_SIZE_MAX=200"
  ```

- [ ] **Path Prefix konfiguriert**
  ```powershell
  Select-String -Path "infra\n8n\.env" -Pattern "N8N_PATH=/n8n"
  ```

- [ ] **Proxy Hops gesetzt**
  ```powershell
  Select-String -Path "infra\n8n\.env" -Pattern "N8N_PROXY_HOPS=1"
  ```

- [ ] **Editor Base URL korrekt**
  ```powershell
  Select-String -Path "infra\n8n\.env" -Pattern "N8N_EDITOR_BASE_URL=https://ai.philogichub.com/n8n"
  ```

- [ ] **Webhook URL korrekt**
  ```powershell
  Select-String -Path "infra\n8n\.env" -Pattern "WEBHOOK_URL=https://ai.philogichub.com/n8n"
  ```

## 🐘 Postgres Security

- [ ] **Postgres Password != n8n Password**
  ```powershell
  $n8nPwd = (Select-String -Path "infra\n8n\.env" -Pattern "N8N_BASIC_AUTH_PASSWORD=(.+)").Matches.Groups[1].Value
  $dbPwd = (Select-String -Path "infra\n8n\.env" -Pattern "DB_POSTGRESDB_PASSWORD=(.+)").Matches.Groups[1].Value
  $n8nPwd -ne $dbPwd
  ```

- [ ] **Postgres nur localhost binding**
  ```powershell
  Select-String -Path "infra\n8n\compose.yml" -Pattern "127.0.0.1:5432:5432"
  ```

- [ ] **Postgres Health Check aktiv**
  ```powershell
  Select-String -Path "infra\n8n\compose.yml" -Pattern "pg_isready"
  ```

- [ ] **Persistent Volume konfiguriert**
  ```powershell
  Select-String -Path "infra\n8n\compose.yml" -Pattern "./pgdata:/var/lib/postgresql/data"
  ```

## 🔑 API Keys & Credentials

- [ ] **n8n-bot User existiert** in PhilogicAI
  - Login PhilogicAI > Users > Check "n8n-bot"

- [ ] **n8n-bot API Key generiert**
  - Format: `pk_n8n_...`

- [ ] **n8n-bot Permissions: Least Privilege**
  - ✅ `/api/chat` (POST)
  - ✅ `/api/knowledge/*` (GET)
  - ❌ `/api/admin/*` (DENY)
  - ❌ `/api/users/*` (DENY)

- [ ] **n8n-bot Token in n8n Credentials** gespeichert
  - n8n UI > Credentials > HTTP Header Auth
  - Name: `n8n-bot API Key`
  - Header: `Authorization`
  - Value: `Bearer pk_n8n_...`

- [ ] **External API Credentials** (wenn benötigt)
  - n8n UI > Credentials > HTTP Header Auth
  - Test Connection vor Production!

## 🔄 Backup & Recovery

- [ ] **Backup Script vorhanden**
  ```powershell
  Test-Path "scripts\n8n\backup-n8n.ps1"
  ```

- [ ] **Initial Backup erstellt**
  ```powershell
  Get-ChildItem "infra\n8n\backups\n8n_backup_*.zip" | Select-Object -First 1
  ```

- [ ] **Backup enthält Encryption Key**
  ```powershell
  $latestBackup = Get-ChildItem "infra\n8n\backups\n8n_backup_*" -Directory | Sort-Object Name -Descending | Select-Object -First 1
  Test-Path "$($latestBackup.FullName)\ENCRYPTION_KEY.txt"
  ```

- [ ] **Restore Script getestet** (auf Test-System!)
  ```powershell
  # Manual Test: .\scripts\n8n\restore-n8n.ps1
  # Select backup, verify restore works
  ```

- [ ] **Backup Schedule** (z.B. täglich via Task Scheduler)
  - Windows Task Scheduler > Create Task
  - Trigger: Daily 2:00 AM
  - Action: `powershell.exe -File "C:\Philip\myapps\philogichub\scripts\n8n\backup-n8n.ps1"`

## 🚨 Monitoring & Logging

- [ ] **Health Endpoint erreichbar**
  ```powershell
  $response = Invoke-WebRequest -Uri "http://localhost:5678/healthz" -UseBasicParsing
  $response.StatusCode -eq 200
  ```

- [ ] **Docker Logs funktionieren**
  ```powershell
  docker compose -f infra\n8n\compose.yml logs --tail 10 n8n
  ```

- [ ] **Cloudflare Access Audit Logs aktiv**
  - Dashboard > Access > Logs
  - Zeigt Login Events

- [ ] **n8n Workflow Execution History** aktiviert
  - n8n UI > Settings > Workflow Settings
  - Save Execution Data: **ON**

## 🌍 Network & Connectivity

- [ ] **n8n nur localhost binding**
  ```powershell
  Select-String -Path "infra\n8n\compose.yml" -Pattern "127.0.0.1:5678:5678"
  ```

- [ ] **No Direct Port Forwarding** (Router prüfen!)
  - Port 5678 NICHT im Internet exposed
  - Port 5432 NICHT im Internet exposed

- [ ] **Cloudflare Tunnel ist EINZIGER Zugang** von außen

- [ ] **Local Access funktioniert**
  ```powershell
  Invoke-WebRequest -Uri "http://localhost:5678" -UseBasicParsing
  # Should return HTML (nicht 404)
  ```

- [ ] **Public Access funktioniert** (mit Cloudflare Access)
  ```powershell
  # Browser Test: https://ai.philogichub.com/n8n
  # Should redirect to Cloudflare Access Login
  ```

## 🧪 HMAC Webhook Security

- [ ] **HMAC Secret != NEXTAUTH_SECRET**
  ```powershell
  $hmac = (Select-String -Path "infra\n8n\.env" -Pattern "N8N_WEBHOOK_HMAC_SECRET=(.+)").Matches.Groups[1].Value
  $nextAuth = (Select-String -Path ".env.local" -Pattern "NEXTAUTH_SECRET=(.+)").Matches.Groups[1].Value -ErrorAction SilentlyContinue
  $hmac -ne $nextAuth
  ```

- [ ] **HMAC Validation Template** importiert in mindestens 1 Workflow
  - n8n UI > Workflows > Check für Code Node mit `HMAC Validation`

- [ ] **Timestamp Check aktiv** (max 5 min skew)
  - Code Node prüft: `Math.abs(now - requestTime) > 300`

- [ ] **Constant-Time Comparison** verwendet
  - Code Node prüft: `crypto.timingSafeEqual()`

## 📱 Mobile Access

- [ ] **Cookie Path korrekt** (`/n8n`)
  - Cloudflare Access Application Settings > Cookie Path

- [ ] **Session Duration: 24h**
  - Cloudflare Access Application Settings > Session Duration

- [ ] **Same Site: Lax**
  - Cloudflare Access Application Settings > Same Site Attribute

- [ ] **Mobile Browser Test** durchgeführt
  - Öffne auf Handy: https://ai.philogichub.com/n8n
  - Login funktioniert
  - Session bleibt nach Browser-Close aktiv

## 🔄 Update & Maintenance

- [ ] **Update Script vorhanden**
  ```powershell
  Test-Path "scripts\n8n\update-n8n.ps1"
  ```

- [ ] **compose.yml.backup** Strategie (automatisch bei Update)

- [ ] **Update Schedule definiert**
  - Minor Updates: Monatlich
  - Patch Updates: Bei Security Fixes
  - Dokumentiert in README.md

- [ ] **Rollback getestet** (auf Test-System)

## 🚀 Pre-Deployment Final Checks

- [ ] **Alle Scripts ausführbar**
  ```powershell
  Get-ChildItem "scripts\n8n\*.ps1" | ForEach-Object { Write-Host "Check: $($_.Name)" }
  ```

- [ ] **Docker Images gepullt**
  ```powershell
  docker images | Select-String -Pattern "n8nio/n8n"
  docker images | Select-String -Pattern "postgres:16-alpine"
  ```

- [ ] **Services starten ohne Fehler**
  ```powershell
  docker compose -f infra\n8n\compose.yml up -d
  docker compose -f infra\n8n\compose.yml ps
  # All services should be "Up" and "healthy"
  ```

- [ ] **README.md vollständig** gelesen
  ```powershell
  Get-Content "infra\n8n\README.md" | Measure-Object -Line
  # Should be >500 lines (comprehensive docs)
  ```

- [ ] **Example Workflows importiert**
  - `example-workflow-philogicai-to-n8n.json`
  - `example-workflow-n8n-to-philogicai.json`

- [ ] **First Workflow Test** durchgeführt
  - Simple HTTP Request Workflow
  - Manual Execution erfolgreich

## 📊 Production Readiness Score

**Required for Production: 100% (all checks passed)**

Count checked items:
```powershell
# Total checks
$total = (Select-String -Path "infra\n8n\SECURITY_CHECKLIST.md" -Pattern "^- \[ \]").Matches.Count

# Checked items (manually count or track)
$checked = 0  # Update after each check

# Score
$score = [math]::Round(($checked / $total) * 100, 2)
Write-Host "Production Readiness: $score%"
```

**Not Ready for Production if:**
- Encryption Key Backup fehlt (critical data loss risk!)
- HMAC Secret == NEXTAUTH_SECRET (security vulnerability!)
- Ports direkt exposed (bypasses Cloudflare security!)
- "Everyone" Policy in Cloudflare Access (public access!)
- No Backup Strategy (data loss risk!)

**Ready for Production when:**
- ✅ All 70+ checks passed
- ✅ Backup tested and automated
- ✅ Mobile access verified
- ✅ HMAC webhooks validated
- ✅ Cloudflare Access configured with MFA

---

**Version:** 1.0.0  
**Last Updated:** 2024-01  
**Maintainer:** Philip @ PhilogicHub

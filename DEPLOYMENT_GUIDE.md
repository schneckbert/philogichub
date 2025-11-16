# n8n Deployment Guide - Go Live Checklist

Finaler Guide für produktionsreifes n8n Deployment mit PhilogicAI Integration.

## 📋 Pre-Deployment Checklist

Arbeite **sequenziell** durch diese Checkliste. Jeder Schritt baut auf dem vorherigen auf.

### Phase 1: Vorbereitung (ca. 10 Minuten)

- [ ] **1.1** Docker Desktop läuft
  ```powershell
  docker --version
  docker ps
  ```

- [ ] **1.2** PhilogicAI Backend läuft auf localhost:8000
  ```powershell
  Invoke-WebRequest -Uri "http://localhost:8000" -UseBasicParsing
  ```

- [ ] **1.3** Cloudflare Tunnel Setup Script vorhanden
  ```powershell
  Test-Path "C:\philogic-ai\setup-cloudflare-tunnel.ps1"
  ```

- [ ] **1.4** Workspace Verzeichnis korrekt
  ```powershell
  cd C:\Philip\myapps\philogichub
  Get-Location
  ```

### Phase 2: n8n Setup (ca. 5 Minuten)

- [ ] **2.1** Setup Script ausführen
  ```powershell
  .\scripts\n8n\setup-n8n.ps1
  ```
  
  **Erwartung:**
  - ✅ Docker Check: OK
  - ✅ Verzeichnisse erstellt
  - ✅ .env generiert mit Secrets
  - ✅ Encryption Key Backup erstellt
  - ✅ Docker Images gepullt

- [ ] **2.2** Encryption Key Backup sichern (KRITISCH!)
  ```powershell
  # Kopiere zu sicherem Ort (USB Stick, Cloud, etc.)
  $latestBackup = Get-ChildItem "infra\n8n\backups\ENCRYPTION_KEY_BACKUP_*.txt" | Sort-Object Name -Descending | Select-Object -First 1
  Copy-Item $latestBackup.FullName "D:\SafeBackups\" -ErrorAction SilentlyContinue
  
  Write-Host "Backup Location: $($latestBackup.FullName)"
  ```

- [ ] **2.3** .env Datei validieren
  ```powershell
  Get-Content "infra\n8n\.env"
  
  # Check: Alle Secrets gefüllt (keine CHANGE_ME Placeholders)
  ```

### Phase 3: Cloudflare Tunnel Update (ca. 10 Minuten)

- [ ] **3.1** Cloudflare Tunnel Config sichern
  ```powershell
  Copy-Item "C:\philogic-ai\cloudflared-config.yml" "C:\philogic-ai\cloudflared-config.yml.backup"
  ```

- [ ] **3.2** Config editieren
  ```powershell
  notepad "C:\philogic-ai\cloudflared-config.yml"
  ```
  
  **Neue Ingress Rules** (siehe [CLOUDFLARE_INGRESS_UPDATE.md](../infra/n8n/CLOUDFLARE_INGRESS_UPDATE.md)):
  
  ```yaml
  ingress:
    # Webhooks (highest priority)
    - hostname: ai.philogichub.com
      path: /n8n/webhook/*
      service: http://localhost:5678
    
    # n8n UI/REST
    - hostname: ai.philogichub.com
      path: /n8n/*
      service: http://localhost:5678
    
    # PhilogicAI (catch-all)
    - hostname: ai.philogichub.com
      service: http://localhost:8000
    
    # Fallback
    - service: http_status:404
  ```

- [ ] **3.3** Tunnel neu starten
  ```powershell
  # Stoppe alten Tunnel
  Stop-Process -Name cloudflared -Force -ErrorAction SilentlyContinue
  
  # Starte mit neuer Config
  Start-Process -FilePath "C:\philogic-ai\cloudflared.exe" `
                -ArgumentList "tunnel", "run", "philogic-ai-tunnel" `
                -WorkingDirectory "C:\philogic-ai" `
                -WindowStyle Hidden
  
  # Warte 5 Sekunden
  Start-Sleep -Seconds 5
  
  # Check Prozess läuft
  Get-Process -Name cloudflared
  ```

- [ ] **3.4** Tunnel Logs prüfen (optional)
  ```powershell
  # Logs sollten zeigen: "Connection registered" für alle Ingress Rules
  Get-Content "C:\philogic-ai\cloudflared.log" -Tail 20 -ErrorAction SilentlyContinue
  ```

### Phase 4: Cloudflare Access Setup (ca. 15 Minuten)

Siehe detaillierte Anleitung: [CLOUDFLARE_ACCESS_SETUP.md](../infra/n8n/CLOUDFLARE_ACCESS_SETUP.md)

- [ ] **4.1** Cloudflare Dashboard öffnen
  - https://dash.cloudflare.com
  - Domain: `philogichub.com`
  - Access > Applications

- [ ] **4.2** Application erstellen
  - **Name:** `n8n UI - PhilogicHub`
  - **Domain:** `ai.philogichub.com`
  - **Path:** `/n8n` (Include subpaths: ✅)
  - **Session Duration:** 24 hours

- [ ] **4.3** Identity Provider konfigurieren
  - **Empfohlen:** Google OAuth (mobile-friendly)
  - **Alternative:** Email OTP
  - Team Name notieren: `<your-team>.cloudflareaccess.com`

- [ ] **4.4** Policies erstellen (in dieser Reihenfolge!)
  
  **Policy 1: Bypass Webhooks** (ERSTE Policy!)
  - Action: **Bypass**
  - Path: `/n8n/webhook/*`
  
  **Policy 2: Allow Users**
  - Action: **Allow**
  - Emails: `your-email@example.com` (oder Domain)
  - IdP: Google/GitHub/Email OTP

- [ ] **4.5** Application speichern und aktivieren

### Phase 5: n8n Startup (ca. 5 Minuten)

- [ ] **5.1** Services starten
  ```powershell
  .\scripts\n8n\start-n8n.ps1
  ```
  
  **Erwartung:**
  - ✅ Services starting...
  - ✅ Health check (max 60 Sekunden)
  - ✅ Services healthy
  - ✅ URLs angezeigt

- [ ] **5.2** Health Check manuell verifizieren
  ```powershell
  Invoke-WebRequest -Uri "http://localhost:5678/healthz" -UseBasicParsing
  # Expected: StatusCode 200
  ```

- [ ] **5.3** Services Status prüfen
  ```powershell
  cd infra\n8n
  docker compose ps
  
  # Beide Services sollten "Up (healthy)" sein
  ```

### Phase 6: First Login (ca. 5 Minuten)

- [ ] **6.1** Lokaler Test (ohne Cloudflare Access)
  ```
  Browser: http://localhost:5678
  ```
  
  **Erwartung:**
  - ✅ n8n Setup Wizard lädt
  - ✅ Basic Auth Prompt (falls aktiviert)

- [ ] **6.2** Public Access Test (mit Cloudflare Access)
  ```
  Browser: https://ai.philogichub.com/n8n
  ```
  
  **Erwartung:**
  - ✅ Redirect zu Cloudflare Access Login
  - ✅ IdP Auswahl (Google/GitHub/Email)
  - ✅ Nach Login: Redirect zu n8n
  - ✅ n8n Setup Wizard lädt

- [ ] **6.3** Owner Account erstellen
  - **Email:** (deine Email, wird n8n Owner)
  - **Password:** Stark, min. 12 Zeichen
  - **First Name / Last Name:** (optional)
  - **Skip** "Connect to n8n Cloud" (Self-Hosted)

- [ ] **6.4** Initial Settings
  - n8n UI > Settings > General
  - **Timezone:** Europe/Berlin (oder deine Timezone)
  - **Default Execution Timeout:** 300 seconds
  - **Save Execution Data:** ✅ ON (für Debugging)

### Phase 7: Credentials Setup (ca. 10 Minuten)

- [ ] **7.1** PhilogicAI n8n-bot Token generieren
  ```powershell
  # In PhilogicAI Backend (oder Admin UI wenn vorhanden)
  # Erstelle User: n8n-bot
  # Generiere API Key: pk_n8n_...
  # Permissions: ONLY /api/chat, /api/knowledge/* (least privilege!)
  ```

- [ ] **7.2** n8n Credential: PhilogicAI API Key
  - n8n UI > Credentials > **Add Credential**
  - Type: **HTTP Header Auth**
  - Name: `n8n-bot API Key`
  - **Header Name:** `Authorization`
  - **Header Value:** `Bearer pk_n8n_...`
  - **Save**

- [ ] **7.3** Test PhilogicAI Connection
  - Erstelle Simple Workflow:
    1. Manual Trigger
    2. HTTP Request
       - URL: `https://ai.philogichub.com/api/chat`
       - Method: POST
       - Authentication: `n8n-bot API Key`
       - Body:
         ```json
         {
           "model": "gpt-4",
           "messages": [{"role": "user", "content": "Test"}],
           "stream": false
         }
         ```
    3. Execute Workflow
  
  **Erwartung:** Response mit `choices[0].message.content`

### Phase 8: Example Workflows Import (ca. 5 Minuten)

- [ ] **8.1** Workflow 1: PhilogicAI → n8n
  - n8n UI > Workflows > **Import from File**
  - File: `infra\n8n\example-workflow-philogicai-to-n8n.json`
  - **Save**

- [ ] **8.2** Workflow 2: n8n → PhilogicAI
  - n8n UI > Workflows > **Import from File**
  - File: `infra\n8n\example-workflow-n8n-to-philogicai.json`
  - **Update Credentials:** Alle HTTP Requests auf `n8n-bot API Key` setzen
  - **Save**

- [ ] **8.3** Activate Workflow 2 (scheduled)
  - Workflow 2 öffnen
  - Toggle **Active** auf ON
  - Nächste Execution: Täglich 9:00 Uhr

### Phase 9: Security Validation (ca. 10 Minuten)

- [ ] **9.1** Security Checklist durchgehen
  ```powershell
  Get-Content "infra\n8n\SECURITY_CHECKLIST.md"
  
  # Arbeite durch alle Punkte, markiere mit [x]
  ```

- [ ] **9.2** HMAC Validation Template prüfen
  - Workflow 1 öffnen
  - Code Node "HMAC Validation" prüfen:
    - ✅ `crypto.timingSafeEqual()` verwendet
    - ✅ Timestamp Check (5 min)
    - ✅ `$env.N8N_WEBHOOK_HMAC_SECRET`

- [ ] **9.3** File Permissions prüfen
  ```powershell
  icacls "infra\n8n\.env"
  # Should show: Only Administrators + Your User (not Everyone!)
  ```

### Phase 10: Backup & Testing (ca. 10 Minuten)

- [ ] **10.1** Initial Backup erstellen
  ```powershell
  .\scripts\n8n\backup-n8n.ps1
  ```
  
  **Erwartung:**
  - ✅ Postgres dump created
  - ✅ Workflows exported
  - ✅ Credentials exported
  - ✅ Encryption Key backed up
  - ✅ Zip archive created

- [ ] **10.2** Backup Location verifizieren
  ```powershell
  Get-ChildItem "infra\n8n\backups\n8n_backup_*.zip" | Select-Object -First 1
  ```

- [ ] **10.3** Integration Tests laufen lassen
  ```powershell
  .\scripts\n8n\test-n8n-integration.ps1
  ```
  
  **Erwartung:**
  - ✅ All tests passed (15/15)
  - ✅ Manual public access test confirmed

### Phase 11: Mobile Access Test (ca. 5 Minuten)

- [ ] **11.1** Mobile Browser öffnen
  - URL: `https://ai.philogichub.com/n8n`

- [ ] **11.2** Cloudflare Access Login
  - IdP auswählen (Google empfohlen)
  - Login durchführen

- [ ] **11.3** n8n UI Responsive Check
  - ✅ UI lädt
  - ✅ Touch Navigation funktioniert
  - ✅ Workflows sichtbar
  - ✅ Executions sichtbar

- [ ] **11.4** Session Persistence Test
  - Browser schließen
  - Browser neu öffnen
  - URL erneut öffnen
  - **Erwartung:** Kein Re-Login nötig (24h Session)

### Phase 12: PhilogicAI Backend Adjustment (ca. 2 Minuten)

- [ ] **12.1** Ephemeral Tunnel deaktivieren
  
  Erstelle/Editiere `.env` im PhilogicAI Backend:
  
  ```powershell
  # PhilogicAI Backend .env
  notepad "C:\Philip\myapps\philogicai\backend\.env"
  
  # Füge hinzu:
  DISABLE_EPHEMERAL_TUNNEL=true
  ```

- [ ] **12.2** PhilogicAI Backend neu starten
  ```powershell
  # Stoppe Backend (Ctrl+C in Terminal)
  # Starte Backend neu
  # uvicorn app.main:app --reload --port 8000
  
  # Check Logs: "Ephemeral tunnel disabled (using named tunnel)"
  ```

### Phase 13: Production Readiness (ca. 5 Minuten)

- [ ] **13.1** README vollständig gelesen
  ```powershell
  Get-Content "infra\n8n\README.md" | Measure-Object -Line
  # Should be 500+ lines
  ```

- [ ] **13.2** Troubleshooting Section bookmarken
  - README.md > Troubleshooting
  - Für schnelle Referenz bei Problemen

- [ ] **13.3** Backup Schedule erstellen (optional)
  
  **Windows Task Scheduler:**
  1. Start > Task Scheduler
  2. Create Task
  3. **Name:** `n8n Daily Backup`
  4. **Trigger:** Daily at 2:00 AM
  5. **Action:** Start a program
     - Program: `powershell.exe`
     - Arguments: `-File "C:\Philip\myapps\philogichub\scripts\n8n\backup-n8n.ps1"`
  6. **Settings:** Run whether user is logged on or not
  7. **Save**

- [ ] **13.4** Monitoring Setup (optional)
  
  **Health Check Monitoring:**
  - UptimeRobot (kostenlos): https://uptimerobot.com
  - Monitor: `https://ai.philogichub.com/n8n/healthz`
  - Alert bei Down (Email/SMS)

## 🚀 Go-Live!

Alle Schritte abgeschlossen? **Herzlichen Glückwunsch!**

Dein n8n Setup ist jetzt:
- ✅ **Production-Ready**: Postgres, Health Checks, Persistent Volumes
- ✅ **Secure**: Cloudflare Access, HMAC Webhooks, Encryption Key Backups
- ✅ **Mobile-Accessible**: Sicherer Zugriff von überall
- ✅ **Fully Automated**: PowerShell Scripts für alle Lifecycle Operations
- ✅ **Bi-directional Integrated**: PhilogicAI ↔ n8n mit JWT Bridge

## 📊 Post-Deployment

### Daily Operations

**Starten:**
```powershell
.\scripts\n8n\start-n8n.ps1
```

**Stoppen:**
```powershell
.\scripts\n8n\stop-n8n.ps1
```

**Logs checken:**
```powershell
cd infra\n8n
docker compose logs -f n8n
```

**Health Status:**
```powershell
Invoke-WebRequest -Uri "http://localhost:5678/healthz"
docker compose ps
```

### Weekly Tasks

- [ ] Cloudflare Access Audit Logs prüfen (Dashboard > Access > Logs)
- [ ] n8n Executions prüfen (UI > Executions > Failed)
- [ ] Backup validieren (neuestes Backup existiert?)
- [ ] Disk Space prüfen (min. 2 GB frei)

### Monthly Tasks

- [ ] n8n Version Update prüfen (Release Notes lesen)
- [ ] Security Updates (n8n, Postgres, Cloudflare Tunnel)
- [ ] Backup Restore Test (auf Test-System)
- [ ] Credentials Rotation (API Keys, HMAC Secret alle 90 Tage empfohlen)

## 🆘 Rollback Plan

Wenn etwas schiefgeht:

### Rollback 1: Services neu starten
```powershell
.\scripts\n8n\stop-n8n.ps1
.\scripts\n8n\start-n8n.ps1
```

### Rollback 2: Backup restore
```powershell
.\scripts\n8n\restore-n8n.ps1
# Select latest backup
```

### Rollback 3: Cloudflare Tunnel Config
```powershell
# Restore backup
Copy-Item "C:\philogic-ai\cloudflared-config.yml.backup" "C:\philogic-ai\cloudflared-config.yml" -Force

# Restart tunnel
Stop-Process -Name cloudflared -Force
Start-Process -FilePath "C:\philogic-ai\cloudflared.exe" -ArgumentList "tunnel", "run", "philogic-ai-tunnel" -WorkingDirectory "C:\philogic-ai"
```

### Rollback 4: Complete Reset
```powershell
# WARNUNG: Löscht ALLE Daten!
cd infra\n8n
docker compose down -v  # Volumes auch löschen
Remove-Item pgdata -Recurse -Force
Remove-Item n8n-data -Recurse -Force
Remove-Item .env

# Dann: Setup neu durchführen
cd ..\..\scripts\n8n
.\setup-n8n.ps1
```

## 📚 Next Steps

- **Workflows entwickeln:** n8n Docs https://docs.n8n.io
- **PhilogicAI Integration erweitern:** Custom Nodes, Advanced Workflows
- **Monitoring:** UptimeRobot, Grafana (advanced)
- **Scaling:** Multi-Instance n8n mit Queue Mode (advanced)

## ✅ Deployment Complete!

Du hast erfolgreich ein **production-ready n8n Setup** mit **PhilogicAI Integration** deployed!

**Dokumentation:**
- [README.md](../infra/n8n/README.md) - Hauptdokumentation
- [CLOUDFLARE_ACCESS_SETUP.md](../infra/n8n/CLOUDFLARE_ACCESS_SETUP.md) - Access Details
- [HMAC_VALIDATION.md](../infra/n8n/HMAC_VALIDATION.md) - Webhook Security
- [SECURITY_CHECKLIST.md](../infra/n8n/SECURITY_CHECKLIST.md) - Security Validation

**Support:**
- n8n Community: https://community.n8n.io
- Cloudflare Docs: https://developers.cloudflare.com

---

**Version:** 1.0.0  
**Last Updated:** 2024-01  
**Maintainer:** Philip @ PhilogicHub

**Viel Erfolg mit deinem n8n Setup!** 🚀

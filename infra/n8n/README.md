# n8n Integration für PhilogicAI

Production-ready n8n Community Edition Setup mit Cloudflare Tunnel, HMAC Webhooks und bidirektionaler PhilogicAI Integration.

## 📋 Inhaltsverzeichnis

- [Architektur](#architektur)
- [Features](#features)
- [Voraussetzungen](#voraussetzungen)
- [Quick Start](#quick-start)
- [Sicherheit](#sicherheit)
- [Backup & Restore](#backup--restore)
- [Updates](#updates)
- [Workflows](#workflows)
- [Troubleshooting](#troubleshooting)
- [Mobile Zugriff](#mobile-zugriff)

## 🏗️ Architektur

```
Internet
   │
   ├─ ai.philogichub.com/n8n/*          ← UI/REST (Cloudflare Access protected)
   ├─ ai.philogichub.com/n8n/webhook/*  ← Webhooks (HMAC protected)
   └─ ai.philogichub.com/*              ← PhilogicAI Backend
          │
          ↓ Cloudflare Tunnel (localhost only)
          │
   ┌──────┴────────────────────┐
   │                            │
   ↓                            ↓
localhost:5678                localhost:8000
n8n Community Edition         PhilogicAI FastAPI
   │
   ├─ n8n-data volume (workflows/config)
   └─ postgres:5432 (persistent DB)
      └─ pgdata volume
```

### Komponenten

- **n8n CE**: Workflow-Engine auf localhost:5678, hinter `/n8n` Path
- **Postgres 16**: Production DB für Workflows, Credentials, Execution History
- **Cloudflare Tunnel**: Path-based routing für n8n + PhilogicAI
- **Cloudflare Access**: IdP/MFA-geschützter UI-Zugriff
- **HMAC Webhooks**: SHA-256 signierte Webhook-Anfragen

### Security Layers

1. **UI Access**: Cloudflare Access (IdP, MFA, Session Cookie)
2. **Webhooks**: HMAC-SHA256 Signatur + Timestamp Validation
3. **Backup Layer**: n8n Basic Auth (falls Access fehlschlägt)
4. **API Calls**: n8n-bot Token (least-privilege, nur Chat/Knowledge)
5. **Encryption**: n8n Credentials verschlüsselt mit 32-Byte Key

## ✨ Features

- ✅ **Production-Ready**: Postgres DB, Health Checks, Persistent Volumes
- ✅ **Secure by Default**: Cloudflare Access, HMAC, Encryption Key Backups
- ✅ **Full Automation**: PowerShell Scripts für Setup, Start, Stop, Backup, Restore, Update
- ✅ **Mobile Access**: Sicher über Cloudflare Tunnel + Access von überall
- ✅ **Bi-directional Integration**: PhilogicAI ↔ n8n mit JWT Bridge
- ✅ **Example Workflows**: Ready-to-use Templates für PhilogicAI Integration
- ✅ **Backup Strategy**: Automated Postgres Dump, Workflow/Credential Export, Encryption Key Backup
- ✅ **Zero Downtime Updates**: Rolling Updates mit Rollback-Option

## 📦 Voraussetzungen

- **Docker Desktop**: Windows mit Docker Compose
- **Cloudflare Tunnel**: Named Tunnel "philogic-ai-tunnel" (bereits konfiguriert)
- **PowerShell 5.1+**: Für Automation Scripts
- **PhilogicAI Backend**: Läuft auf localhost:8000
- **Disk Space**: Min. 5 GB für Images, DB, Backups

## 🚀 Quick Start

### 1. Setup ausführen

```powershell
# Wechsle zum Scripts-Verzeichnis
cd C:\Philip\myapps\philogichub\scripts\n8n

# Führe Setup aus (generiert Secrets, erstellt .env, zieht Images)
.\setup-n8n.ps1
```

**Was passiert:**
- Docker-Check (läuft Docker Desktop?)
- Verzeichnisse erstellt (pgdata, n8n-data, backups)
- `.env` generiert mit sicheren Secrets (DB Password, Encryption Key, HMAC Secret)
- Encryption Key Backup erstellt
- Docker Images gepullt

### 2. Cloudflare Tunnel aktualisieren

Siehe [CLOUDFLARE_INGRESS_UPDATE.md](./CLOUDFLARE_INGRESS_UPDATE.md) für Details.

**Kurzfassung:**

Editiere `C:\philogic-ai\cloudflared-config.yml`:

```yaml
ingress:
  # Webhooks (höchste Priorität)
  - hostname: ai.philogichub.com
    path: /n8n/webhook/*
    service: http://localhost:5678
  
  # n8n UI/REST
  - hostname: ai.philogichub.com
    path: /n8n/*
    service: http://localhost:5678
  
  # PhilogicAI (Catch-All)
  - hostname: ai.philogichub.com
    service: http://localhost:8000
  
  # Fallback
  - service: http_status:404
```

Tunnel neu starten:

```powershell
Stop-Process -Name cloudflared -Force
Start-Process -FilePath "C:\philogic-ai\cloudflared.exe" -ArgumentList "tunnel", "run", "philogic-ai-tunnel" -WorkingDirectory "C:\philogic-ai"
```

### 3. Cloudflare Access konfigurieren

Siehe [CLOUDFLARE_ACCESS_SETUP.md](./CLOUDFLARE_ACCESS_SETUP.md) für Schritt-für-Schritt Guide.

**Essentials:**
- Application für `/n8n/*` (außer `/n8n/webhook/*`)
- Policy: Allow mit IdP (Google, GitHub, etc.) oder MFA
- Session Duration: 24h empfohlen

### 4. n8n starten

```powershell
# Starte Services
.\start-n8n.ps1
```

**Was passiert:**
- Startet Postgres + n8n mit `docker compose up -d`
- Health Check Loop (max 60 Sekunden)
- Zeigt Status + URLs

**Output:**

```
n8n erreichbar unter:
  Lokal:  http://localhost:5678
  Public: https://ai.philogichub.com/n8n

Login Credentials: siehe .env
  N8N_BASIC_AUTH_USER
  N8N_BASIC_AUTH_PASSWORD
```

### 5. Erster Login

1. Öffne: https://ai.philogichub.com/n8n
2. Cloudflare Access Login (IdP oder Email OTP)
3. n8n Setup Wizard:
   - Email/Password für Owner Account
   - Optional: Connect to Cloud (überspringen für Self-Hosted)

**Done!** 🎉

## 🔒 Sicherheit

### Secrets Management

Alle Secrets in `.env`:

```env
# Database
DB_POSTGRESDB_PASSWORD=<generiert>

# n8n Encryption (KRITISCH: Backup aufbewahren!)
N8N_ENCRYPTION_KEY=<32-byte base64>

# Webhook HMAC (separate von NEXTAUTH_SECRET!)
N8N_WEBHOOK_HMAC_SECRET=<32-byte base64>

# Basic Auth Backup Layer
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=<generiert>
```

**WICHTIG:**
- `N8N_ENCRYPTION_KEY`: Verlust = Credentials unlesbar! Backup bei Setup erstellt (`backups/ENCRYPTION_KEY_BACKUP_*.txt`)
- `N8N_WEBHOOK_HMAC_SECRET`: Separates Secret für Webhook-Signaturen (NICHT NEXTAUTH_SECRET!)
- `.env` Permissions: Nur Owner Read/Write (`icacls` wird bei Setup gesetzt)

### HMAC Webhook Validation

Alle Webhooks MÜSSEN HMAC-signiert sein:

```
X-N8N-Signature: <hex digest>
X-N8N-Timestamp: <unix timestamp>
```

Template: [HMAC_VALIDATION.md](./HMAC_VALIDATION.md)

Beispiel (Python):

```python
import hmac, hashlib, time, json

timestamp = int(time.time())
body = json.dumps(data)
signature = hmac.new(
    HMAC_SECRET.encode(),
    f"{timestamp}.{body}".encode(),
    hashlib.sha256
).hexdigest()

headers = {
    'X-N8N-Signature': signature,
    'X-N8N-Timestamp': str(timestamp)
}
```

### n8n-bot API Key

Für n8n → PhilogicAI Calls:

1. Erstelle User `n8n-bot` in PhilogicAI
2. Generiere API Key (z.B. `pk_n8n_...`)
3. Setze Permissions: **NUR** `/api/chat` und `/api/knowledge/*` (least-privilege!)
4. In n8n: Credentials > HTTP Header Auth
   - Name: `Authorization`
   - Value: `Bearer pk_n8n_...`

### Security Checklist

Siehe [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) für Pre-Deployment Validation.

## 💾 Backup & Restore

### Backup erstellen

```powershell
.\backup-n8n.ps1
```

**Backups enthalten:**
- Postgres Dump (alle Workflows, Executions, Credentials)
- Workflow Export (JSON)
- Credential Export (JSON, verschlüsselt)
- Encryption Key
- HMAC Secret
- n8n-data Volume Copy (Fallback)

**Location:** `infra\n8n\backups\n8n_backup_YYYYMMDD_HHMMSS.zip`

### Restore durchführen

```powershell
.\restore-n8n.ps1
```

**Ablauf:**
1. Liste verfügbare Backups
2. Wähle Backup (Nummer eingeben)
3. Bestätigung (Warnung: überschreibt aktuelle Daten!)
4. Services stoppen
5. Restore Encryption Key + HMAC Secret zu `.env`
6. Postgres Dump restore
7. Workflow/Credential Import
8. Services neu starten
9. Health Check

**WICHTIG:** Restore überschreibt aktuelle Daten! Bei Unsicherheit: Backup VORHER erstellen.

## 🔄 Updates

### n8n auf neue Version updaten

```powershell
.\update-n8n.ps1
```

**Ablauf:**
1. Zeigt aktuelle Version
2. Fragt nach neuer Version (z.B. `1.21.0` oder `latest`)
3. Erstellt automatisch Backup
4. Updated `compose.yml` Image Tag
5. Pulled neues Image
6. Restart Services
7. Health Check + Version Verification

**Bei Fehler:**
- Rollback compose.yml: `Copy-Item compose.yml.backup compose.yml -Force`
- Oder restore letztes Backup: `.\restore-n8n.ps1`

### Update Schedule

- **Minor Updates** (1.x.0): Monatlich prüfen
- **Patch Updates** (1.x.y): Bei Security Fixes sofort
- **Breaking Changes**: Release Notes lesen!

## 🔄 Workflows

### Example Workflows importieren

1. Login in n8n UI: https://ai.philogichub.com/n8n
2. Workflows > Import from File
3. Wähle JSON:
   - `example-workflow-philogicai-to-n8n.json` (PhilogicAI → n8n mit HMAC)
   - `example-workflow-n8n-to-philogicai.json` (n8n → PhilogicAI Chat/Knowledge)

### Workflow 1: PhilogicAI → n8n

**Use Case:** PhilogicAI sendet Event, n8n verarbeitet via External API, meldet zurück.

**Nodes:**
1. Webhook Trigger (`/webhook/philogicai-event`)
2. HMAC Validation (Code Node)
3. Check Validation (IF Node)
4. Transform Event Data (Code Node)
5. Call External API (HTTP Request mit Retry)
6. Callback to PhilogicAI (HTTP Request)
7. Respond Success (200)
8. Error Handling Path (Respond 403 bei HMAC Fail)

**Credentials benötigt:**
- External API Key (HTTP Header Auth)
- PhilogicAI Internal Token (HTTP Header Auth)

### Workflow 2: n8n → PhilogicAI

**Use Case:** Scheduled Daily Report (9am), fragt PhilogicAI Chat + Knowledge, speichert Report.

**Nodes:**
1. Schedule Trigger (täglich 9:00 Uhr)
2. Prepare Chat Request (Code Node)
3. Call PhilogicAI Chat (HTTP Request mit Exponential Backoff)
4. Check Response (IF Node)
5. Extract Summary (Code Node)
6. Query Knowledge Base (HTTP Request)
7. Combine Results (Code Node)
8. Store Report (HTTP Request)
9. Rate Limit Handling (429 → Wait 60s → Retry max 3x)

**Credentials benötigt:**
- n8n-bot API Key (HTTP Header Auth mit `Authorization: Bearer pk_n8n_...`)

## 🔧 Troubleshooting

### n8n startet nicht

```powershell
# Check Logs
cd C:\Philip\myapps\philogichub\infra\n8n
docker compose logs n8n

# Häufige Ursachen:
# 1. Postgres nicht ready → warte 10s, prüfe: docker compose ps
# 2. Port 5678 belegt → netstat -ano | findstr 5678
# 3. .env fehlt → .\scripts\n8n\setup-n8n.ps1 erneut ausführen
```

### Health Check fehlgeschlagen

```powershell
# Manual Health Check
Invoke-WebRequest -Uri "http://localhost:5678/healthz"

# 200 = OK, 503 = Service Unavailable

# Prüfe n8n Logs:
docker compose logs -f n8n
```

### HMAC Validation schlägt fehl

```
Error: "Invalid HMAC signature"
```

**Checks:**
1. `N8N_WEBHOOK_HMAC_SECRET` identisch bei Sender und n8n?
2. Timestamp korrekt? (Unix Seconds, max 5 min Abweichung)
3. Raw Body unverändert? (kein Pretty-Print, keine Encoding-Änderungen!)
4. Header Case-Sensitive: `X-N8N-Signature`, `X-N8N-Timestamp`

**Debug:**

Füge in HMAC Validation Code Node hinzu:

```javascript
console.log('Given Signature:', signature);
console.log('Expected Signature:', expectedSignature);
console.log('Message:', `${timestamp}.${rawBody}`);
```

Check Logs: `docker compose logs n8n`

### Cloudflare Access zeigt 403

```
Error: Access Denied
```

**Checks:**
1. Policy aktiv? (Cloudflare Dashboard > Access > Applications)
2. User in Allow List? (Email oder IdP User)
3. Path korrekt? (`/n8n/*` aber NICHT `/n8n/webhook/*`)
4. Session abgelaufen? (Re-Login)

### Postgres Connection Failed

```
Error: Connection to database failed
```

**Checks:**

```powershell
# Ist Postgres running?
docker compose ps postgres

# Health Check
docker compose exec postgres pg_isready -U n8n

# Connection String korrekt?
# In .env: DB_POSTGRESDB_HOST=postgres (nicht localhost!)
```

### Encryption Key Lost

```
Error: Cannot decrypt credentials
```

**Restore von Backup:**

```powershell
# Suche letzten Key Backup
cd C:\Philip\myapps\philogichub\infra\n8n\backups
Get-ChildItem -Filter "ENCRYPTION_KEY_BACKUP_*.txt" | Sort-Object Name -Descending | Select-Object -First 1

# Kopiere Key zu .env
$key = Get-Content "ENCRYPTION_KEY_BACKUP_XXXXXXXX_XXXXXX.txt"
# Editiere .env: N8N_ENCRYPTION_KEY=<key>

# Restart Services
cd ..\
docker compose restart n8n
```

**Wenn kein Backup:** Credentials sind verloren! Musst neu eingeben.

### Port Conflicts

```
Error: port is already allocated
```

**Lösung:**

```powershell
# Finde Prozess auf Port 5678
netstat -ano | findstr 5678

# Kill Prozess (PID aus netstat)
Stop-Process -Id <PID> -Force

# Oder: Ändere Port in compose.yml
# ports: "127.0.0.1:5679:5678"
```

## 📱 Mobile Zugriff

### Setup

1. **Cloudflare Access konfiguriert** (siehe [CLOUDFLARE_ACCESS_SETUP.md](./CLOUDFLARE_ACCESS_SETUP.md))
2. **PC läuft** mit Docker Services (`.\start-n8n.ps1`)
3. **Tunnel aktiv** (`cloudflared tunnel run philogic-ai-tunnel`)

### Testen

1. Öffne auf Handy: https://ai.philogichub.com/n8n
2. Cloudflare Access Login:
   - Email OTP (One-Time PIN via Email)
   - Oder IdP (Google, GitHub, etc.)
3. Session Cookie bleibt 24h gültig
4. n8n UI sollte laden (mobile-optimiert)

### Tipps

- **Offline?** Prüfe: Ist PC am Strom? Docker läuft? Tunnel aktiv?
- **Session abgelaufen?** Re-Login über Cloudflare Access
- **Mobile Daten:** n8n UI ist leicht (~2 MB), aber Workflow-Executions können größer sein
- **Touch-Optimierung:** n8n UI ist touch-friendly, aber große Workflows besser am PC editieren

### Sicherheit unterwegs

- ✅ **Cloudflare Access**: Kein direkter Zugriff ohne IdP/MFA
- ✅ **Session Timeout**: 24h, danach Re-Login
- ✅ **TLS Encryption**: Alle Daten verschlüsselt via HTTPS
- ✅ **No Port Forwarding**: Kein offener Port 5678 im Internet
- ✅ **Audit Logs**: Cloudflare Access loggt alle Zugriffe

## 📚 Weitere Dokumentation

- [CLOUDFLARE_INGRESS_UPDATE.md](./CLOUDFLARE_INGRESS_UPDATE.md) - Tunnel Routing Setup
- [CLOUDFLARE_ACCESS_SETUP.md](./CLOUDFLARE_ACCESS_SETUP.md) - Access Policies (step-by-step)
- [HMAC_VALIDATION.md](./HMAC_VALIDATION.md) - Webhook Security Template
- [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) - Pre-Deployment Validation
- [compose.yml](./compose.yml) - Docker Stack Definition
- [.env.example](./.env.example) - Environment Variable Template

## 🆘 Support

**Logs:**

```powershell
# n8n Logs
docker compose logs -f n8n

# Postgres Logs
docker compose logs -f postgres

# Alle Services
docker compose logs -f
```

**Status:**

```powershell
docker compose ps
```

**Restart:**

```powershell
docker compose restart n8n    # Nur n8n
docker compose restart         # Alle Services
```

**Stop/Start:**

```powershell
.\scripts\n8n\stop-n8n.ps1     # Graceful Shutdown
.\scripts\n8n\start-n8n.ps1    # Startup mit Health Check
```

---

**Version:** 1.0.0  
**Last Updated:** 2024-01  
**Maintainer:** Philip @ PhilogicHub

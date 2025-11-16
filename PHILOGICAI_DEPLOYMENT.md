# PhilogicAI Integration - Production Deployment

## Überblick

PhilogicHub integriert den lokalen PhilogicAI Server (70B LLM) über einen API-Proxy. In der Production läuft PhilogicHub auf Vercel, während PhilogicAI auf einem lokalen Server mit GPU bleibt.

## Architektur

```
Internet → Vercel (PhilogicHub)
              ↓
         API Proxy (/api/philogic-ai/*)
              ↓
         Cloudflare Tunnel
              ↓
         Lokaler Server (PhilogicAI:8000)
              ↓
         Ollama + LLaMA 3.1 70B (GPU)
```

## Production Setup

### 1. Cloudflare Tunnel einrichten (Empfohlen)

Cloudflare Tunnel ist die beste Lösung für sicheren, stabilen Zugriff ohne Port-Forwarding:

```powershell
# Vollautomatisch (empfohlen):
.\scripts\\windows\\Setup-Cloudflared.ps1 -Hostname philogicai.yourdomain.com -AutoLogin -CreateDns -Start

# Manuell (Alternative):
# 1. Cloudflared installieren
winget install Cloudflare.cloudflared
# 2. Bei Cloudflare anmelden
cloudflared tunnel login
# 3. Tunnel erstellen
cloudflared tunnel create philogicai
# 4. Konfigurationsdatei erstellen
# Datei: C:\Users\<username>\.cloudflared\config.yml
```

**config.yml:**
```yaml
tunnel: <TUNNEL_ID>
credentials-file: C:\Users\<username>\.cloudflared\<TUNNEL_ID>.json

ingress:
  - hostname: philogicai.yourdomain.com
    service: http://localhost:8000
  - service: http_status:404
```

```powershell
# 5. DNS konfigurieren (alternativ automatisch per CLI)
cloudflared tunnel route dns philogicai philogicai.yourdomain.com

# 6. Optional: als Windows Service
cloudflared service install
cloudflared service start
```

### 2. Alternative: ngrok (einfacher, aber kostenpflichtig für custom domain)

```powershell
# ngrok installieren und Token einrichten
ngrok config add-authtoken <YOUR_TOKEN>

# Tunnel starten
ngrok http 8000 --region eu
```

### 3. Vercel Environment Variables

In den Vercel Project Settings → Environment Variables:

```bash
# Production
PHILOGIC_AI_URL=https://philogicai.yourdomain.com
PHILOGIC_AI_API_KEY=<your-jwt-token>

# Optional: Preview/Development
PHILOGIC_AI_URL=http://localhost:8000
PHILOGIC_AI_API_KEY=local
```

### 4. JWT Token generieren

Auf dem lokalen Server im PhilogicAI-Ordner:

```powershell
cd C:\Philip\myapps\philogicai
python -m app.auth <username>
```

Kopiere den generierten Token in die Vercel Environment Variables.

## Lokale Entwicklung

### Voraussetzungen

1. PhilogicAI Server läuft auf `localhost:8000`
2. `.env.local` ist konfiguriert:

```bash
PHILOGIC_AI_URL=http://localhost:8000
PHILOGIC_AI_API_KEY=local
```

### Dev Server starten

```powershell
npm run dev
```

Navigiere zu http://localhost:3000/philogic-ai

## API Endpoints

### Chat (Streaming)

```typescript
POST /api/philogic-ai/chat
Content-Type: application/json
Authorization: Bearer <nextauth-session>

{
  "model": "llama3.1:latest",
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "stream": true,
  "temperature": 0.7,
  "max_tokens": 2000
}
```

Response: Server-Sent Events (SSE)

### Models

```typescript
GET /api/philogic-ai/models
Authorization: Bearer <nextauth-session>

Response:
{
  "models": [
    { "name": "llama3.1:latest" }
  ]
}
```

## Fehlerbehebung

### PhilogicAI nicht erreichbar

**Problem:** API-Fehler "PhilogicAI API request failed"

**Lösung:**
1. Prüfe ob PhilogicAI Server läuft:
   ```powershell
   Invoke-WebRequest -Uri http://localhost:8000/health -UseBasicParsing
   ```

2. Prüfe Cloudflare Tunnel Status:
   ```powershell
   cloudflared tunnel info philogicai
   ```

3. Teste öffentliche URL:
   ```powershell
   Invoke-WebRequest -Uri https://philogicai.yourdomain.com/health -UseBasicParsing
   ```

### Authentifizierungsfehler

**Problem:** 401 Unauthorized

**Lösung:**
- Prüfe ob JWT Token in Vercel Environment Variables korrekt ist
- Generiere neuen Token wenn nötig
- Stelle sicher, dass PhilogicAI Backend den Token akzeptiert

### Streaming funktioniert nicht

**Problem:** Antwort kommt auf einmal statt Streaming

**Lösung:**
- Vercel unterstützt Streaming, aber prüfe ob `stream: true` im Request ist
- Prüfe Browser DevTools Network Tab → Response sollte `text/event-stream` sein

## Sicherheit

### Production Best Practices

1. **JWT Rotation:** Erneuere API Keys alle 30-90 Tage
2. **Rate Limiting:** PhilogicAI hat Redis-basiertes Rate Limiting (30 req/min default)
3. **HTTPS Only:** Cloudflare Tunnel bietet automatisch HTTPS
4. **Session-basiert:** Nur authentifizierte PhilogicHub-User haben Zugriff
5. **No Direct Access:** PhilogicAI ist nur über den Tunnel erreichbar

### Firewall Konfiguration

Lokaler Server (Windows Firewall):
- **Ausgehend:** Port 443 (HTTPS) für Cloudflare Tunnel
- **Eingehend:** Keine Ports öffnen (Tunnel nutzt ausgehende Verbindung)

## Performance

### Erwartete Latenz

- **Lokal:** 1-3s First Token, 15-30 tokens/s
- **Mit Tunnel:** +50-200ms zusätzliche Latenz
- **Vercel → Tunnel:** Abhängig von Region (EU: <100ms)

### Optimierung

1. **Vercel Region:** Wähle Region nah am Server (EU für Deutschland)
2. **Ollama Keep-Alive:** Model im VRAM laden:
   ```bash
   # In PhilogicAI backend/app/main.py
   KEEP_ALIVE_MINUTES=60  # Model 60min im RAM halten
   ```

3. **Cloudflare Tunnel:** Verwende Warp für schnellere Verbindung

## Monitoring

### Health Check

```bash
# Lokaler Server
curl http://localhost:8000/health

# Production (via Tunnel)
curl https://philogicai.yourdomain.com/health
```

**Erwartete Response:**
```json
{
  "status": "healthy",
  "ollama": "connected",
  "model_loaded": true,
  "timestamp": "2025-11-15T15:03:45.349840"
}
```

### Logs

**PhilogicAI Logs:**
```powershell
# Windows
Get-Content C:\Philip\myapps\philogicai\logs\*.log -Tail 50
```

**Cloudflare Tunnel Logs:**
```powershell
cloudflared tunnel logs philogicai
```

**Vercel Logs:**
- Dashboard → Project → Logs
- Oder via CLI: `vercel logs`

## MCP Server (optional)

Für wiederkehrende Betriebsaufgaben gibt es einen kleinen MCP-Server im Repo:

- Pfad: `tools/philogicai-mcp`
- Startet einen MCP-Server über stdio und bietet Tools an:
  - `philogic.health` – prüft `${PHILOGIC_AI_URL}/health`
  - `philogic.tunnelStatus` – führt `cloudflared tunnel list` aus
  - `philogic.tunnelRun` – startet einen Tunnel (`name`, optional `background`)
  - `philogic.generateJwt` – erzeugt HS256-Tokens per `PHILOGIC_AI_JWT_SECRET`

Verwendung mit einem MCP-fähigen Client (Beispiel-Konfiguration in `tools/philogicai-mcp/README.md`).

## Windows-Automation (Optional)

- `scripts\windows\Setup-Cloudflared.ps1` — Installiert (falls nötig), logged ein, erstellt/erkennt Tunnel, schreibt config, legt DNS an und startet Tunnel.
- `scripts\windows\Write-CloudflaredConfig.ps1` — Schreibt `config.yml` für eine gegebene Tunnel-ID und Hostname.
- `scripts\windows\Start-Cloudflared.ps1` — Startet den benannten Tunnel.
- `scripts\windows\Generate-PhilogicJwt.ps1` — Erzeugt HS256-JWT (setzt `PHILOGIC_AI_JWT_SECRET` voraus). Optional: Node-Helper `scripts\node\generate-jwt.mjs`.

## Backup & Disaster Recovery

### Server Ausfall

Wenn der lokale Server ausfällt:
1. PhilogicHub bleibt erreichbar
2. PhilogicAI-Chat zeigt Fehlermeldung
3. Andere Features (CRM, Dashboard) funktionieren normal

### Wiederherstellung

```powershell
# 1. Server neustarten
cd C:\Philip\myapps\philogicai
.\START_SERVER.ps1

# 2. Cloudflare Tunnel neustarten
cloudflared service stop
cloudflared service start

# 3. Health Check
Invoke-WebRequest -Uri https://philogicai.yourdomain.com/health
```

## Kosten

### Cloudflare Tunnel
- **Free Tier:** Unbegrenzte Bandwidth, unbegrenzte Tunnels
- **Keine Kreditkarte erforderlich**

### ngrok (Alternative)
- **Free:** Random URLs, keine custom domain
- **Pro ($8/mo):** Custom domains, mehr Verbindungen
- **Business ($12/mo):** IP Whitelisting, mehr Tunnel

### Vercel
- **Hobby:** Free für kleine Projekte
- **Pro ($20/mo):** Production-ready, mehr Bandwidth
- **Enterprise:** Custom Pricing

### Hardware (bereits vorhanden)
- GPU Server mit 48GB VRAM (RTX A6000 oder ähnlich)
- Keine zusätzlichen Cloud-GPU-Kosten

## Support

Bei Problemen:
1. Prüfe Health Endpoints
2. Checke Logs (Vercel, PhilogicAI, Cloudflare)
3. Teste Verbindung Schritt für Schritt
4. Vercel Support für Platform-Issues
5. GitHub Issues für PhilogicHub-Bugs

---

**Zuletzt aktualisiert:** 15. November 2025
**PhilogicHub Version:** 0.1.0
**PhilogicAI Backend:** FastAPI + Ollama + LLaMA 3.1 70B

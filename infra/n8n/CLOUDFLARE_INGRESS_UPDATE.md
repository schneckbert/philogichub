# Cloudflare Tunnel Ingress Rules für n8n Integration

## WICHTIG: Anleitung zum Anpassen der Tunnel-Konfiguration

Die Datei `C:\philogic-ai\cloudflared-config.yml` muss erweitert werden, um n8n zu exponieren.

### Aktuelle Konfiguration (aus setup-cloudflare-tunnel.ps1):

```yaml
tunnel: <TUNNEL_ID>
credentials-file: %USERPROFILE%\.cloudflared\<TUNNEL_ID>.json

ingress:
  # PhilogicAI - nur für deine Domain
  - hostname: ai.philogichub.com
    service: http://localhost:8000
    originRequest:
      connectTimeout: 30s
      noTLSVerify: false
  
  # Catch-all
  - service: http_status:404
```

### Neue Konfiguration (mit n8n):

**WICHTIG: Reihenfolge ist entscheidend! Spezifischere Pfade zuerst.**

```yaml
tunnel: <TUNNEL_ID>
credentials-file: %USERPROFILE%\.cloudflared\<TUNNEL_ID>.json

ingress:
  # n8n Webhooks (höchste Priorität - spezifischster Pfad)
  - hostname: ai.philogichub.com
    path: /n8n/webhook/*
    service: http://localhost:5678
    originRequest:
      connectTimeout: 30s
      noTLSVerify: false
      noHappyEyeballs: false
  
  # n8n UI & REST API
  - hostname: ai.philogichub.com
    path: /n8n/*
    service: http://localhost:5678
    originRequest:
      connectTimeout: 30s
      noTLSVerify: false
      noHappyEyeballs: false
  
  # PhilogicAI (alle anderen Pfade)
  - hostname: ai.philogichub.com
    service: http://localhost:8000
    originRequest:
      connectTimeout: 30s
      noTLSVerify: false
  
  # Catch-all
  - service: http_status:404
```

## Manuelle Schritte:

1. **Öffne die Datei:** `C:\philogic-ai\cloudflared-config.yml`
2. **Ersetze** den gesamten `ingress:` Block mit der neuen Konfiguration oben
3. **Behalte** die Zeilen `tunnel:` und `credentials-file:` unverändert
4. **Speichern** und Cloudflare Tunnel neu starten

## Tunnel neu starten:

```powershell
# Stoppe den aktuellen Tunnel (wenn läuft)
Stop-Process -Name cloudflared -Force -ErrorAction SilentlyContinue

# Starte Tunnel mit neuer Config
cd C:\philogic-ai
Start-Process -FilePath ".\cloudflared.exe" -ArgumentList "tunnel", "--config", "cloudflared-config.yml", "run", "philogic-ai-tunnel" -NoNewWindow
```

## Verifizierung:

Nach dem Neustart sollten folgende URLs funktionieren:

- `https://ai.philogichub.com/` → PhilogicAI (Port 8000)
- `https://ai.philogichub.com/n8n/` → n8n UI (Port 5678, via Cloudflare Access geschützt)
- `https://ai.philogichub.com/n8n/webhook/<id>` → n8n Webhooks (Port 5678, HMAC-signiert)

**Test:**
```powershell
# Prüfe PhilogicAI
Invoke-WebRequest https://ai.philogichub.com/health

# Prüfe n8n (erfordert Access-Login im Browser)
# https://ai.philogichub.com/n8n/
```

## Wichtig:

- **UI-Zugriff:** Über Cloudflare Access absichern (siehe CLOUDFLARE_ACCESS_SETUP.md)
- **Webhooks:** Bleiben öffentlich erreichbar, aber HMAC-signiert (siehe HMAC_TEMPLATE.md)
- **Lokaler Zugriff:** n8n läuft weiterhin auf `http://localhost:5678`

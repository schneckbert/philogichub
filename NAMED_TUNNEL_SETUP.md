# 🎯 Named Tunnel Setup - Fertiggestellt!

## ✅ Status

Der Named Tunnel **`philogicai`** ist eingerichtet und konfiguriert!

### Tunnel-Details:
- **Name:** philogicai
- **ID:** 64c17a7d-b17e-4505-8d02-f7d3ec7582f8
- **Config:** `C:\Users\Philip\.cloudflared\config.yml`
- **Hostname:** ai.philogichub.com *(DNS noch nicht aktiv)*

## 🚀 Tunnel starten

### Option 1: Manuell (Aktuell)

```powershell
cloudflared tunnel run philogicai
```

Der Tunnel läuft dann, bis du das Terminal schließt.

### Option 2: Als Windows-Service (Empfohlen)

```powershell
# Installieren
cloudflared service install

# Starten
cloudflared service start

# Status prüfen
cloudflared service status

# Logs ansehen
cloudflared service logs
```

**Vorteil:** Tunnel startet automatisch bei System-Neustart!

## 🌐 DNS-Konfiguration (Ausstehend)

Der Tunnel ist ready, aber **DNS fehlt noch**. Du hast zwei Optionen:

### Option A: Domain registrieren (Empfohlen für Production)

1. **Registriere Domain:** `philogichub.com` bei einem Registrar
   - Empfehlung: Cloudflare Registrar (günstiger)
   - Oder: Namecheap, GoDaddy, etc.

2. **Füge zu Cloudflare hinzu:**
   ```powershell
   # Im Cloudflare Dashboard:
   # 1. "Add Site" → philogichub.com
   # 2. Nameserver beim Registrar aktualisieren
   # 3. Warte auf DNS-Propagierung (bis zu 24h)
   ```

3. **DNS ist dann automatisch aktiv!**
   - Der CNAME-Eintrag `ai.philogichub.com` wurde bereits erstellt
   - URL funktioniert sofort: `https://ai.philogichub.com`

### Option B: Quick Access (Funktioniert sofort)

Für jetzt kannst du weiter mit ephemeren Tunnels arbeiten:

```powershell
cd c:\Philip\myapps\philogicai
.\START_WITH_TUNNEL.ps1
```

Das gibt dir eine `*.trycloudflare.com`-URL, die sofort funktioniert.

## 📝 Was wurde konfiguriert?

### Config-Datei: `C:\Users\Philip\.cloudflared\config.yml`

```yaml
tunnel: 64c17a7d-b17e-4505-8d02-f7d3ec7582f8
credentials-file: C:\Users\Philip\.cloudflared\64c17a7d-b17e-4505-8d02-f7d3ec7582f8.json

ingress:
  - hostname: ai.philogichub.com
    service: http://localhost:8000
  - service: http_status:404
```

### DNS-Route (vorbereitet)

```
ai.philogichub.com → Tunnel philogicai → localhost:8000
```

Route ist in Cloudflare gespeichert, aktiviert sich sobald Domain hinzugefügt wird!

## 🔄 Nächste Schritte

### Sofort loslegen (Quick Access):

```powershell
# Terminal 1: Backend starten
cd c:\Philip\myapps\philogicai\backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Terminal 2: Quick Tunnel
cd c:\Philip\myapps\philogicai
.\START_WITH_TUNNEL.ps1
```

→ Nutze die angezeigte `*.trycloudflare.com`-URL in der Academy-App

### Später mit fester Domain:

1. Domain `philogichub.com` registrieren
2. Zu Cloudflare hinzufügen
3. Named Tunnel als Service installieren:
   ```powershell
   cloudflared service install
   cloudflared service start
   ```
4. Fertig! → `https://ai.philogichub.com` funktioniert dauerhaft

## 🎯 Academy-Integration

### Frontend-Config aktualisieren

Wenn Domain aktiv ist:

```javascript
// Im Browser Console oder in localStorage:
localStorage.setItem("api_url", "https://ai.philogichub.com");
location.reload();
```

### Oder: Vercel Environment Variable

```powershell
# In Vercel Dashboard:
# Settings → Environment Variables
# Name: NEXT_PUBLIC_API_URL
# Value: https://ai.philogichub.com
```

## 📊 Tunnel-Management

### Status prüfen

```powershell
cloudflared tunnel info philogicai
```

### Logs ansehen

```powershell
# Windows Service:
cloudflared service logs

# Manuell (im laufenden Terminal):
# Logs werden direkt angezeigt
```

### Tunnel stoppen

```powershell
# Service:
cloudflared service stop

# Manuell:
# Ctrl+C im Terminal oder Prozess beenden:
Get-Process cloudflared | Stop-Process -Force
```

## ✅ Zusammenfassung

**Was funktioniert:**
- ✅ Named Tunnel `philogicai` erstellt
- ✅ Config auf `ai.philogichub.com` konfiguriert
- ✅ DNS-Route vorbereitet
- ✅ Credentials gespeichert

**Was fehlt:**
- ⏳ Domain `philogichub.com` in Cloudflare (dann funktioniert DNS)

**Aktueller Workaround:**
- 👍 Nutze weiter Quick Access Tunnels (`*.trycloudflare.com`)
- 👍 Funktioniert sofort, keine Domain nötig

**Sobald Domain registriert:**
- 🚀 `https://ai.philogichub.com` funktioniert automatisch
- 🚀 Keine URL-Änderungen mehr nötig
- 🚀 Als Service immer verfügbar

---

**Der Named Tunnel ist ready für Production, sobald die Domain verfügbar ist!** 🎉

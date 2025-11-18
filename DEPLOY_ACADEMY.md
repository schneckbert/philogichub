# 🚀 PhiLogicAI Academy - One-Command Deployment

Dieses Dokument beschreibt den **einfachsten Weg**, die neue Academy-Chat-UI live zu schalten.

## ✅ Voraussetzungen

- [x] Backend läuft (`c:\Philip\myapps\philogicai\backend`)
- [x] Vercel CLI installiert (`npm install -g vercel`)
- [x] Vercel Account eingerichtet (`vercel login`)
- [x] Optional: Cloudflare Tunnel für öffentlichen Backend-Zugriff

## 🎯 Quick Deploy (2 Kommandos)

### 1. Preview Deployment (zum Testen)

```powershell
cd c:\Philip\myapps\philogichub
.\scripts\deploy-academy.ps1
```

Das erstellt eine **Preview-URL** (z.B. `https://philogicai-academy-xyz.vercel.app`).

### 2. Production Deployment

```powershell
cd c:\Philip\myapps\philogichub
.\scripts\deploy-academy.ps1 -Production
```

Das deployed auf die **Production-Domain**.

## 🧪 Smoke Test nach Deployment

```powershell
cd c:\Philip\myapps\philogichub
.\scripts\test-academy-prod.ps1
```

Das Skript fragt nach:
- Vercel Production URL
- Backend URL (optional)

Und prüft dann:
- ✓ Frontend erreichbar
- ✓ Neue Chat-UI vorhanden
- ✓ Backend gesund (wenn URL gegeben)

## 🔧 Setup-Schritte (einmalig)

### Vercel CLI installieren

```powershell
npm install -g vercel
```

### Bei Vercel einloggen

```powershell
vercel login
```

Browser öffnet sich → Mit GitHub/GitLab/Email anmelden.

### Projekt verlinken (beim ersten Deploy)

```powershell
cd c:\Philip\myapps\philogicai\vercel-frontend
vercel
```

Vercel fragt:
- "Set up and deploy?" → **Y**
- "Which scope?" → Dein Account
- "Link to existing project?" → **N** (beim ersten Mal)
- "Project name?" → `philogicai-academy`
- "Directory?" → `./`
- "Modify settings?" → **N**

Danach ist das Projekt verlinkt und alle weiteren Deploys sind automatisch.

## 📋 Kompletter Production-Flow

### Option A: Mit Tunnel (öffentlicher Backend-Zugriff)

```powershell
# 1. Backend + Tunnel starten
cd c:\Philip\myapps\philogicai
.\START_WITH_TUNNEL.ps1

# 2. Tunnel URL notieren (wird angezeigt)
# z.B. https://abc-def.trycloudflare.com

# 3. Frontend deployen
cd c:\Philip\myapps\philogichub
.\scripts\deploy-academy.ps1 -Production

# 4. Smoke Test
.\scripts\test-academy-prod.ps1
# (Vercel URL und Tunnel URL eingeben)
```

### Option B: Nur lokales Backend

```powershell
# 1. Backend starten
cd c:\Philip\myapps\philogicai\backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# 2. Frontend deployen
cd c:\Philip\myapps\philogichub
.\scripts\deploy-academy.ps1 -Production

# 3. Smoke Test (ohne Backend URL)
.\scripts\test-academy-prod.ps1
```

Bei Option B muss die Backend-URL **manuell im Browser** eingegeben werden.

## 🌐 Nach dem Deployment

1. **Öffne die Vercel-URL** in deinem Browser
2. **Klicke auf "Anmelden"**
3. **Falls Backend-URL-Dialog erscheint:**
   - Gib deine Cloudflare Tunnel URL ein
   - Oder lokale URL (nur im WLAN): `http://192.168.x.x:8000`
4. **Logge dich ein** mit deinen Credentials
5. **Teste die Chat-Funktion:**
   - Schreibe eine Nachricht
   - Prüfe, ob KPIs angezeigt werden (Latenz, Tokens)
   - Teste Modellwahl, Prompt-Bibliothek

## 📊 Vercel Dashboard

Nach dem Deployment findest du dein Projekt hier:
- https://vercel.com/dashboard

Dort kannst du:
- **Domains** verwalten (Custom Domain hinzufügen)
- **Environment Variables** setzen
- **Deployments** ansehen und verwalten
- **Logs** einsehen

## 🔄 Updates deployen

Wenn du die `index.html` änderst:

```powershell
cd c:\Philip\myapps\philogichub
.\scripts\deploy-academy.ps1 -Production
```

Das war's! Vercel deployed die neue Version.

## 🐛 Troubleshooting

### "Vercel CLI not found"

```powershell
npm install -g vercel
```

### "Not logged in"

```powershell
vercel login
```

### "Project not linked"

```powershell
cd c:\Philip\myapps\philogicai\vercel-frontend
vercel link
```

### Backend nicht erreichbar

1. **Prüfe Backend lokal:**
   ```powershell
   Invoke-RestMethod http://localhost:8000/health
   ```

2. **Prüfe Tunnel:**
   ```powershell
   # Tunnel-URL sollte im START_WITH_TUNNEL.ps1 Output erscheinen
   Invoke-RestMethod https://deine-tunnel-url.trycloudflare.com/health
   ```

3. **CORS-Fehler im Browser:**
   - Öffne `c:\Philip\myapps\philogicai\backend\app\main.py`
   - Prüfe `allow_origins` in CORS Middleware
   - Sollte `["*"]` oder deine Vercel-Domain enthalten

### Chat funktioniert nicht

1. **Prüfe Browser Console (F12):**
   - Gibt es API-Fehler?
   - Ist die Backend-URL korrekt?

2. **Prüfe Network Tab:**
   - Schlägt `/v1/chat/completions` fehl?
   - Status 401? → Login-Token abgelaufen
   - Status 500? → Backend-Fehler (siehe Backend-Logs)

3. **Backend-Logs:**
   ```powershell
   # Im Backend-Terminal
   # Sollte Request/Response Logs zeigen
   ```

## 📝 Zusammenfassung

**Minimum für Prod:**
```powershell
cd c:\Philip\myapps\philogichub
.\scripts\deploy-academy.ps1 -Production
```

**Mit vollem Workflow:**
1. Backend + Tunnel starten
2. `.\scripts\deploy-academy.ps1 -Production`
3. `.\scripts\test-academy-prod.ps1`
4. Manuell im Browser testen

**Das war's! 🎉**

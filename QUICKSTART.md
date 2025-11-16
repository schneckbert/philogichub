# PhilogicAI - Schnellstart Anleitung

## Übersicht

PhilogicAI verbindet deine lokale AI (llama.cpp) mit der Production Website über Cloudflare Tunnel.

```
┌─────────────────────────┐
│  Cloudflare Pages       │
│  (philogichub.com)      │
└───────────┬─────────────┘
            │ HTTPS + Auth Token
            ▼
┌─────────────────────────┐
│  Cloudflare Tunnel      │
│  ai.philogichub.com     │
└───────────┬─────────────┘
            │ Localhost only
            ▼
┌─────────────────────────┐
│  Flask Server           │
│  localhost:8000         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  llama.cpp              │
│  + Qwen3-14B Model      │
└─────────────────────────┘
```

## 🚀 Schnellstart (5 Schritte)

### 1. Auth Token generieren

```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Kopiere den generierten Token - du brauchst ihn 3x:
- Im Server
- In .env.local
- In Cloudflare Pages

### 2. Python Dependencies installieren

```powershell
cd C:\philogic-ai
pip install flask flask-cors
```

### 3. Server Datei kopieren

```powershell
# Aus philogichub Ordner
copy philogic-ai-server.py C:\philogic-ai\server.py

# Öffne C:\philogic-ai\server.py und passe Pfade an:
# - LLAMA_CPP_PATH (Zeile 23)
# - MODEL_PATH (Zeile 24)
```

### 4. Cloudflare Tunnel Setup

```powershell
# Im philogichub Ordner
.\setup-cloudflare-tunnel.ps1

# Script führt dich durch:
# - cloudflared Download
# - Cloudflare Login (Browser öffnet sich)
# - Tunnel Erstellung
# - DNS Setup
```

### 5. Starte Services

**Terminal 1 - PhilogicAI Server:**
```powershell
cd C:\philogic-ai
$env:PHILOGIC_AUTH_TOKEN = "DEIN_TOKEN_VON_SCHRITT_1"
python server.py
```

**Terminal 2 - Cloudflare Tunnel:**
```powershell
cd C:\philogic-ai
.\start-tunnel.bat
```

**Terminal 3 - Next.js Dev Server:**
```powershell
cd C:\Philip\myapps\philogichub
npm run dev
```

### 6. Teste lokal

Öffne http://localhost:3000 → Klicke auf Chat-Button (unten rechts) → Teste eine Frage!

---

## 🔧 Production Deployment

### Cloudflare Pages Environment Variables

In deinem Cloudflare Pages Dashboard:

1. Gehe zu: Settings → Environment Variables
2. Füge hinzu:
   ```
   PHILOGIC_AI_URL=https://ai.philogichub.com/api/chat
   PHILOGIC_AUTH_TOKEN=<DEIN_TOKEN>
   ```
3. Deploy neu

### Wichtig: Tunnel muss laufen!

Der Cloudflare Tunnel muss auf deinem PC laufen, damit Production funktioniert.

**Option A: Terminal offen lassen**
```powershell
cd C:\philogic-ai
.\start-tunnel.bat
```

**Option B: Windows Service installieren**
```powershell
cd C:\philogic-ai
.\cloudflared.exe service install
```

---

## 🔒 Sicherheit

✅ **Auth Token** - Nur autorisierte Requests werden verarbeitet
✅ **Localhost only** - Server nicht direkt erreichbar von außen
✅ **Cloudflare Tunnel** - End-to-End verschlüsselt, keine offenen Ports
✅ **Keine Logs** - Conversation History wird NICHT gespeichert

### Zusätzliche Sicherheit (Optional)

**IP Whitelist in Cloudflare:**

1. Gehe zu Cloudflare Dashboard
2. Wähle deine Domain
3. Security → WAF
4. Create Rule:
   - Name: "PhilogicAI IP Whitelist"
   - Field: Hostname
   - Operator: equals
   - Value: ai.philogichub.com
   - Action: Block
   - Expression: `(ip.src ne YOUR_OFFICE_IP)`

**Email Authentication (Cloudflare Zero Trust):**

1. Cloudflare Dashboard → Zero Trust
2. Access → Applications
3. Add application:
   - Type: Self-hosted
   - Domain: ai.philogichub.com
   - Policy: Email authentication
   - Allowed emails: deine@firmen-emails.com

---

## 🎮 Model Konfiguration

### GPU Nutzung optimieren

In `C:\philogic-ai\server.py` (Zeile 30):

```python
GPU_LAYERS = 32  # Erhöhe für mehr VRAM usage
```

**Empfehlungen:**
- 8GB VRAM: `GPU_LAYERS = 24`
- 12GB VRAM: `GPU_LAYERS = 32`
- 16GB+ VRAM: `GPU_LAYERS = 40`
- Nur CPU: `GPU_LAYERS = 0`

### Anderes Model verwenden

Ändere in `server.py` (Zeile 24):

```python
MODEL_PATH = r"C:\philogic-ai\models\DEIN-MODEL.gguf"
```

**Empfohlene Models:**
- Qwen3-14B-Q5_K_M.gguf (9.8 GB) - Beste Balance
- Qwen3-32B-Q4_K_M.gguf (19.2 GB) - Mehr Qualität
- Qwen3-7B-Q5_K_M.gguf (5.4 GB) - Schneller

---

## 📊 Monitoring

### Server Status prüfen

```powershell
# Health Check
curl http://localhost:8000/health

# Tunnel Status
cd C:\philogic-ai
.\cloudflared.exe tunnel info philogic-ai-tunnel

# Tunnel List
.\cloudflared.exe tunnel list
```

### Logs ansehen

- **Server Logs:** Terminal 1 wo `python server.py` läuft
- **Tunnel Logs:** Terminal 2 wo Tunnel läuft
- **Next.js Logs:** Terminal 3 Dev Server

---

## 🐛 Troubleshooting

### Problem: "Model not found"

```powershell
# Prüfe ob Model existiert
dir C:\philogic-ai\models\

# Passe Pfad in server.py an (Zeile 24)
```

### Problem: "llama-cli.exe not found"

```powershell
# Prüfe ob llama.cpp kompiliert ist
dir C:\philogic-ai\llama.cpp\build\bin\Release\

# Falls nicht, kompiliere:
cd C:\philogic-ai\llama.cpp
cmake -B build
cmake --build build --config Release
```

### Problem: Tunnel verbindet nicht

```powershell
# Stoppe Tunnel
# Drücke CTRL+C im Tunnel Terminal

# Starte neu
cd C:\philogic-ai
.\cloudflared.exe tunnel --config cloudflared-config.yml run philogic-ai-tunnel

# Prüfe DNS
nslookup ai.philogichub.com
```

### Problem: "Unauthorized" im Chat

1. Prüfe ob Token identisch ist:
   - `C:\philogic-ai\server.py` (Zeile 22)
   - `.env.local` im philogichub Ordner
   - Cloudflare Pages Environment Variables

2. Starte Server neu nach Token-Änderung

### Problem: Langsame Inference

1. Erhöhe GPU Layers: `GPU_LAYERS = 40` in server.py
2. Reduziere Max Tokens: `MAX_TOKENS = 256`
3. Verwende kleineres Model (Q4 statt Q5)

---

## 📝 Dateien Übersicht

```
C:\philogic-ai\
├── server.py                    # Flask Server (kopiert von philogic-ai-server.py)
├── cloudflared.exe              # Cloudflare Tunnel binary
├── cloudflared-config.yml       # Tunnel Konfiguration
├── start-tunnel.bat             # Tunnel Startup Script
├── llama.cpp\                   # llama.cpp Installation
│   └── build\bin\Release\
│       └── llama-cli.exe
└── models\
    └── Qwen3-14B-Q5_K_M.gguf

C:\Philip\myapps\philogichub\
├── .env.local                   # Lokale Environment Variables
├── philogic-ai-server.py        # Server Source (zu kopieren)
├── start-philogic-ai.bat        # Server Startup Script
├── setup-cloudflare-tunnel.ps1  # Tunnel Setup Script
├── PHILOGIC_AI_SETUP.md         # Ausführliche Doku
└── app\
    ├── components\
    │   └── PhilogicAIChat.tsx   # Chat UI Component
    └── api\philogic-ai\chat\
        └── route.ts             # API Proxy Route
```

---

## ✅ Checkliste

- [ ] Python installiert (3.9+)
- [ ] Flask installiert (`pip install flask flask-cors`)
- [ ] llama.cpp kompiliert
- [ ] Model heruntergeladen (Qwen3-14B-Q5_K_M.gguf)
- [ ] Auth Token generiert
- [ ] `server.py` Pfade angepasst
- [ ] Cloudflare Tunnel Setup durchgeführt
- [ ] `.env.local` mit Token konfiguriert
- [ ] Server läuft (Terminal 1)
- [ ] Tunnel läuft (Terminal 2)
- [ ] Next.js läuft (Terminal 3)
- [ ] Lokaler Test erfolgreich
- [ ] Cloudflare Pages Environment Variables gesetzt
- [ ] Production Test erfolgreich

---

## 🆘 Support

Bei Problemen prüfe:
1. Alle 3 Services laufen (Server, Tunnel, Next.js)
2. Token ist überall identisch
3. Pfade in server.py sind korrekt
4. Model existiert und ist nicht korrupt
5. Firewall blockiert nicht Port 8000 (localhost)

**Logs prüfen:**
```powershell
# Server Ausgabe im Terminal 1
# Tunnel Ausgabe im Terminal 2
# Browser Console (F12) für Frontend-Fehler
```

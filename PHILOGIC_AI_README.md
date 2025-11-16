# PhilogicAI Integration

Sichere Verbindung zwischen Production Website und lokaler AI-Inference.

## 🎯 Was wurde gebaut?

- **Chat UI Component** (`app/components/PhilogicAIChat.tsx`)
  - Floating Chat Button (unten rechts)
  - Expandable Chat Window
  - Message History
  - Loading States
  
- **API Proxy Route** (`app/api/philogic-ai/chat/route.ts`)
  - Proxied Requests zu deiner lokalen AI
  - Bearer Token Authentication
  - Error Handling
  
- **Lokaler AI Server** (`philogic-ai-server.py`)
  - Flask Server auf localhost:8000
  - llama.cpp Integration
  - Conversation Context Management
  - Auth Token Protection
  
- **Cloudflare Tunnel Setup** (`setup-cloudflare-tunnel.ps1`)
  - Automatisches Setup Script
  - Sicherer Tunnel von Production zu deinem PC
  - DNS Konfiguration

## 🚀 Schnellstart

### Option 1: Automatisches Setup

```powershell
# 1. Cloudflare Tunnel einrichten
.\setup-cloudflare-tunnel.ps1

# 2. Server starten
.\start-philogic-ai.bat

# 3. Next.js starten
npm run dev
```

### Option 2: Manuelles Setup

Siehe `QUICKSTART.md` für detaillierte Schritt-für-Schritt Anleitung.

## 📁 Neue Dateien

| Datei | Beschreibung |
|-------|--------------|
| `app/components/PhilogicAIChat.tsx` | React Chat Component |
| `app/api/philogic-ai/chat/route.ts` | Next.js API Route |
| `philogic-ai-server.py` | Flask Server (zu kopieren nach C:\philogic-ai\) |
| `setup-cloudflare-tunnel.ps1` | Automatisches Cloudflare Setup |
| `start-philogic-ai.bat` | Server Startup Script |
| `PHILOGIC_AI_SETUP.md` | Ausführliche Dokumentation |
| `QUICKSTART.md` | Schnellstart Anleitung |

## ⚙️ Konfiguration

### Lokale Entwicklung (.env.local)

```env
PHILOGIC_AI_URL=http://localhost:8000/api/chat
PHILOGIC_AUTH_TOKEN=your-secure-token-here
```

### Production (Cloudflare Pages)

```env
PHILOGIC_AI_URL=https://ai.philogichub.com/api/chat
PHILOGIC_AUTH_TOKEN=your-secure-token-here
```

**Wichtig:** Token muss identisch sein in:
1. `.env.local`
2. `C:\philogic-ai\server.py`
3. Cloudflare Pages Environment Variables

## 🔒 Sicherheit

✅ Bearer Token Authentication
✅ Localhost-only Server
✅ Cloudflare Tunnel (keine offenen Ports)
✅ HTTPS End-to-End Verschlüsselung
✅ Optional: IP Whitelist via Cloudflare WAF
✅ Optional: Email Auth via Cloudflare Zero Trust

## 📊 Architektur

```
┌─────────────────────────────────────────────────────────┐
│                    Production Flow                       │
└─────────────────────────────────────────────────────────┘

User Browser
    ↓
philogichub.com (Cloudflare Pages)
    ↓
/api/philogic-ai/chat (Next.js API Route)
    ↓ HTTPS + Bearer Token
ai.philogichub.com (Cloudflare Tunnel)
    ↓ Localhost
127.0.0.1:8000 (Flask Server auf deinem PC)
    ↓
llama.cpp (Lokale GPU/CPU Inference)
    ↓
Qwen3-14B Model
```

## 🎮 Model Einstellungen

Im `philogic-ai-server.py` anpassbar:

```python
MAX_TOKENS = 512        # Antwort-Länge
THREADS = 8             # CPU Threads
TEMPERATURE = 0.7       # Kreativität (0.0-1.0)
TOP_P = 0.9            # Sampling
GPU_LAYERS = 32         # GPU VRAM Nutzung
```

## 🐛 Troubleshooting

### Chat lädt nicht

1. Prüfe Dev Server Logs (Terminal)
2. Öffne Browser Console (F12)
3. Schaue nach Network Errors

### "PhilogicAI ist nicht verfügbar"

1. Server läuft? → `http://localhost:8000/health` öffnen
2. Token korrekt? → Vergleiche alle 3 Stellen
3. Tunnel läuft? → Terminal 2 prüfen

### "Unauthorized" Error

Auth Token ist nicht identisch oder fehlt:
- In `.env.local`
- In `server.py` (Zeile 22)
- In Cloudflare Pages Environment Variables

## 📚 Weitere Dokumentation

- **QUICKSTART.md** - Schnellstart Guide (5 Schritte)
- **PHILOGIC_AI_SETUP.md** - Ausführliche Setup Dokumentation
- **llama.cpp Docs** - https://github.com/ggerganov/llama.cpp

## ✅ Deployment Checkliste

### Lokal
- [ ] Flask & flask-cors installiert
- [ ] server.py in C:\philogic-ai\ kopiert
- [ ] Pfade in server.py angepasst
- [ ] Auth Token generiert und gesetzt
- [ ] Server startet ohne Fehler
- [ ] Health Check funktioniert (localhost:8000/health)
- [ ] Chat im Browser funktioniert

### Production
- [ ] Cloudflare Tunnel Setup durchgeführt
- [ ] Tunnel läuft und ist connected
- [ ] DNS für ai.philogichub.com zeigt auf Tunnel
- [ ] Environment Variables in Cloudflare Pages gesetzt
- [ ] Production Build deployed
- [ ] Chat auf Production Website funktioniert

## 🆘 Support Kontakte

- **llama.cpp Issues:** https://github.com/ggerganov/llama.cpp/issues
- **Cloudflare Tunnel Docs:** https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **Next.js Docs:** https://nextjs.org/docs

## 📈 Performance Tipps

1. **GPU nutzen:** Stelle sicher dass `GPU_LAYERS > 0` in server.py
2. **Mehr VRAM:** Erhöhe `GPU_LAYERS` bis max. Model Layers
3. **Weniger Tokens:** Reduziere `MAX_TOKENS` für schnellere Antworten
4. **Kleineres Model:** Nutze Q4 statt Q5 quantization
5. **Mehr Threads:** Erhöhe `THREADS` auf CPU Core Count

## 📝 Changelog

### Version 1.0 (15.11.2025)
- ✅ Initial PhilogicAI Integration
- ✅ Chat UI Component mit floating button
- ✅ API Proxy Route mit Authentication
- ✅ Flask Server mit llama.cpp
- ✅ Cloudflare Tunnel Setup Script
- ✅ Vollständige Dokumentation

---

**Status:** ✅ Production Ready

Deine lokale AI läuft jetzt sicher auf deinem PC und ist über Cloudflare Tunnel für die Production Website erreichbar!

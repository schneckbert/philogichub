# 🔧 Backend-URL konfigurieren

## Problem

Die Production-App auf Vercel braucht die URL deines Backend-Servers. Da dieser lokal läuft und über einen Cloudflare Tunnel erreichbar ist, ändert sich die URL bei jedem Tunnel-Neustart (ephemerer Tunnel).

## Lösung

### Option 1: Tunnel-URL beim App-Start eingeben (Aktuell)

**Vorteil:** Flexibel, keine Konfiguration  
**Nachteil:** Muss bei jedem neuen Backend-URL-Wechsel wiederholt werden

**Schritte:**
1. Starte Backend mit Tunnel:
   ```powershell
   cd c:\Philip\myapps\philogicai
   .\START_WITH_TUNNEL.ps1
   ```

2. Notiere die Tunnel-URL (z.B. `https://abc-xyz.trycloudflare.com`)

3. Öffne die Academy-App: https://philogicai-7o45cv2z3-schneckberts-projects.vercel.app

4. Bei der ersten Anmeldung erscheint ein Prompt: **Backend-URL eingeben**

5. Gib die Tunnel-URL ein

6. Die URL wird in `localStorage` gespeichert

**Backend-URL später ändern:**
```javascript
// Im Browser Console (F12):
localStorage.setItem("api_url", "https://neue-tunnel-url.trycloudflare.com");
location.reload();
```

### Option 2: Named Tunnel (Empfohlen für Production)

**Vorteil:** Feste URL, die sich nicht ändert  
**Nachteil:** Einmalige Setup-Zeit

**Setup:**
```powershell
cd c:\Philip\myapps\philogichub
.\scripts\windows\Setup-Cloudflared.ps1 -Hostname philogicai.yourdomain.com -AutoLogin -CreateDns -Start
```

Das erstellt einen **Named Tunnel** mit fester URL wie:
- `https://philogicai.yourdomain.com`

Diese URL bleibt dauerhaft gleich, auch nach Tunnel-Neustarts!

### Option 3: Vercel Environment Variable

**Vorteil:** URL ist im Frontend hardcoded  
**Nachteil:** Benötigt Redeploy bei URL-Änderung

**Setup:**
1. Gehe zu: https://vercel.com/schneckberts-projects/philogicai/settings/environment-variables

2. Füge hinzu:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://deine-tunnel-url.trycloudflare.com`
   - **Environment:** Production

3. Im `index.html` anpassen:
   ```javascript
   // Statt:
   API_URL = "http://localhost:8000";
   
   // Verwende:
   API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
   ```

4. Redeploy:
   ```powershell
   cd c:\Philip\myapps\philogichub
   .\scripts\deploy-academy.ps1 -Production
   ```

## Aktueller Status

- ✅ Frontend deployed mit intelligentem Backend-URL-Prompt
- ✅ Localhost als Fallback (funktioniert im lokalen Netzwerk)
- ✅ LocalStorage speichert die URL dauerhaft
- ⚠️ URL muss bei jedem ephemeren Tunnel-Neustart neu eingegeben werden

## Empfehlung

Für Production: **Named Tunnel einrichten** (Option 2)

Das gibt dir eine feste URL wie `https://philogicai.yourdomain.com`, die du:
- Einmal in der App eingibst
- In Dokumentation/Anleitungen verwenden kannst
- Nicht mehr ändern musst

**Quick Setup:**
```powershell
# Named Tunnel erstellen
cloudflared tunnel create philogicai

# Config schreiben (automatisch via Skript)
cd c:\Philip\myapps\philogichub
.\scripts\windows\Setup-Cloudflared.ps1 -Hostname philogicai.yourdomain.com

# Als Windows Service installieren (optional)
cloudflared service install
cloudflared service start
```

Dann ist der Tunnel dauerhaft aktiv, auch nach System-Neustarts!

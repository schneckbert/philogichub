# PhilogicAI Setup für Lokale Inference + Production Zugriff

## Architektur

```
Cloudflare Pages (philogichub) 
    ↓ HTTPS + Auth Token
Cloudflare Tunnel (auf deinem PC)
    ↓ localhost only
PhilogicAI Server (C:\philogic-ai)
    ↓ 
llama.cpp (lokale GPU/CPU Inference)
```

## Schritt 1: PhilogicAI Server mit Authentication

Erstelle `C:\philogic-ai\server.py`:

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import subprocess
import json

app = Flask(__name__)
CORS(app)

# WICHTIG: Sicherer Auth Token - generiere einen neuen mit:
# python -c "import secrets; print(secrets.token_urlsafe(32))"
AUTH_TOKEN = os.getenv('PHILOGIC_AUTH_TOKEN', 'DEIN_SICHERER_TOKEN_HIER')

# Pfade zu deinen Models
LLAMA_CPP_PATH = r"C:\philogic-ai\llama.cpp\build\bin\Release\llama-cli.exe"
MODEL_PATH = r"C:\philogic-ai\models\Qwen3-14B-Q5_K_M.gguf"

def verify_auth():
    """Prüft ob Authorization Header korrekt ist"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return False
    token = auth_header.split(' ')[1]
    return token == AUTH_TOKEN

@app.route('/health', methods=['GET'])
def health():
    """Health check ohne Auth für Tunnel monitoring"""
    return jsonify({"status": "ok", "service": "PhilogicAI"})

@app.route('/api/chat', methods=['POST'])
def chat():
    """Chat Endpoint mit llama.cpp"""
    # Auth Check
    if not verify_auth():
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        data = request.json
        message = data.get('message', '')
        history = data.get('history', [])
        
        if not message:
            return jsonify({"error": "Message required"}), 400
        
        # Baue Prompt mit History
        prompt = ""
        for msg in history[-10:]:  # Letzte 10 Messages als Context
            role = "User" if msg['role'] == 'user' else "Assistant"
            prompt += f"{role}: {msg['content']}\n"
        prompt += f"User: {message}\nAssistant: "
        
        # Rufe llama.cpp auf
        cmd = [
            LLAMA_CPP_PATH,
            "-m", MODEL_PATH,
            "-p", prompt,
            "-n", "512",  # Max tokens
            "-t", "8",    # Threads
            "--temp", "0.7",
            "--top-p", "0.9",
            "-ngl", "32",  # GPU layers (anpassen je nach VRAM)
        ]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=60
        )
        
        # Parse Output
        output = result.stdout
        # llama.cpp gibt oft mehr aus - extrahiere nur die Antwort
        if "Assistant:" in output:
            response_text = output.split("Assistant:")[-1].strip()
        else:
            response_text = output.strip()
        
        return jsonify({
            "response": response_text,
            "model": "Qwen3-14B-Q5_K_M",
            "status": "success"
        })
        
    except subprocess.TimeoutExpired:
        return jsonify({"error": "Request timeout"}), 504
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Nur localhost - Tunnel exposed es nach außen
    app.run(host='127.0.0.1', port=8000, debug=False)
```

## Schritt 2: Python Dependencies

Erstelle `C:\philogic-ai\requirements.txt`:

```
flask==3.0.0
flask-cors==4.0.0
```

Installiere:
```powershell
cd C:\philogic-ai
pip install -r requirements.txt
```

## Schritt 3: Cloudflare Tunnel Setup (SICHER!)

### 3.1 Cloudflared installieren

```powershell
# Download cloudflared für Windows
Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "C:\philogic-ai\cloudflared.exe"
```

### 3.2 Cloudflare Tunnel erstellen

```powershell
cd C:\philogic-ai

# Login zu Cloudflare
.\cloudflared.exe tunnel login

# Erstelle Tunnel
.\cloudflared.exe tunnel create philogic-ai-tunnel

# Notiere die Tunnel ID die ausgegeben wird!
```

### 3.3 Tunnel Config

Erstelle `C:\philogic-ai\cloudflared-config.yml`:

```yaml
tunnel: <DEINE_TUNNEL_ID>
credentials-file: C:\philogic-ai\.cloudflared\<DEINE_TUNNEL_ID>.json

ingress:
  # Nur für deine Domain - nicht öffentlich!
  - hostname: ai.philogichub.com
    service: http://localhost:8000
  - service: http_status:404
```

### 3.4 DNS Setup in Cloudflare

```powershell
.\cloudflared.exe tunnel route dns philogic-ai-tunnel ai.philogichub.com
```

## Schritt 4: Starte Services

### 4.1 PhilogicAI Server starten

```powershell
cd C:\philogic-ai
$env:PHILOGIC_AUTH_TOKEN = "GENERIERE_EINEN_SICHEREN_TOKEN_32_ZEICHEN"
python server.py
```

### 4.2 Cloudflare Tunnel starten

Neues Terminal:
```powershell
cd C:\philogic-ai
.\cloudflared.exe tunnel --config cloudflared-config.yml run philogic-ai-tunnel
```

### 4.3 Als Windows Service einrichten (startet automatisch)

```powershell
# PhilogicAI Server als Service
.\cloudflared.exe service install
```

## Schritt 5: philogichub Production Config

### In Cloudflare Pages Environment Variables:

```
PHILOGIC_AI_URL=https://ai.philogichub.com/api/chat
PHILOGIC_AUTH_TOKEN=<DERSELBE_TOKEN_WIE_OBEN>
```

## Schritt 6: Zusätzliche Sicherheit (IP Whitelist)

In Cloudflare Dashboard für `ai.philogichub.com`:

1. **WAF Rule erstellen**:
   - Firewall → WAF
   - "Create Rule"
   - Regel: Block all traffic EXCEPT from Cloudflare Pages IPs
   
2. **Access Policy**:
   - Zero Trust → Access → Applications
   - Add application: `ai.philogichub.com`
   - Policy: Allow only mit Email authentication (deine Firmen-Emails)

## Testen

### Lokal:
```powershell
# Test ohne Auth (sollte 401 geben)
curl http://localhost:8000/api/chat -X POST -H "Content-Type: application/json" -d '{"message":"Hallo"}'

# Test mit Auth
curl http://localhost:8000/api/chat -X POST -H "Content-Type: application/json" -H "Authorization: Bearer DEIN_TOKEN" -d '{"message":"Hallo"}'
```

### Production:
Öffne https://philogichub.com → Chat sollte funktionieren

## Monitoring

### Status prüfen:
```powershell
# Tunnel Status
.\cloudflared.exe tunnel info philogic-ai-tunnel

# Server logs
# Terminal wo server.py läuft
```

## Startup Scripts

### start-philogic-ai.bat
```batch
@echo off
cd C:\philogic-ai
set PHILOGIC_AUTH_TOKEN=DEIN_TOKEN_HIER
start "PhilogicAI Server" python server.py
start "Cloudflare Tunnel" cloudflared.exe tunnel --config cloudflared-config.yml run philogic-ai-tunnel
echo PhilogicAI Services gestartet!
pause
```

## Ressourcen Nutzung

- **GPU**: llama.cpp nutzt automatisch CUDA/ROCm wenn verfügbar
- **CPU**: Multi-threaded mit -t Parameter
- **RAM**: ~16GB für Qwen3-14B-Q5_K_M Model

## Sicherheitsfeatures

✅ **Auth Token** - Nur autorisierte Requests
✅ **Localhost Only** - Server nicht direkt erreichbar
✅ **Cloudflare Tunnel** - Verschlüsselt + keine offenen Ports
✅ **WAF** - Zusätzlicher Schutz auf Cloudflare Ebene
✅ **Access Policy** - Email Authentication möglich

## Troubleshooting

### Problem: Tunnel verbindet nicht
```powershell
# Prüfe Cloudflare Status
.\cloudflared.exe tunnel list
.\cloudflared.exe tunnel info philogic-ai-tunnel
```

### Problem: llama.cpp findet Model nicht
```powershell
# Prüfe Pfade in server.py
dir C:\philogic-ai\models
```

### Problem: Langsame Inference
- `-ngl` Parameter erhöhen (mehr GPU layers)
- Kleineres Model nutzen (z.B. Qwen3-7B)
- Quantization level ändern (Q4 statt Q5)

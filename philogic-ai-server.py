"""
PhilogicAI Server - Lokaler LLM Inference Server mit llama.cpp
Läuft auf localhost:8000 und wird via Cloudflare Tunnel exposed
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import subprocess
import json
import time
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ============================================================================
# KONFIGURATION - Passe diese Pfade an!
# ============================================================================

# AUTH TOKEN - Generiere einen sicheren Token mit:
# python -c "import secrets; print(secrets.token_urlsafe(32))"
AUTH_TOKEN = os.getenv('PHILOGIC_AUTH_TOKEN', 'your-secure-token-change-this-32-chars')

# Pfade zu llama.cpp und Models
LLAMA_CPP_PATH = r"C:\philogic-ai\llama.cpp\build\bin\llama-cli.exe"
MODEL_PATH = r"C:\philogic-ai\models\Qwen3-14B-Q5_K_M.gguf"

# Inference Parameter (anpassbar)
MAX_TOKENS = 128  # Reduziert für schnellere Tests
THREADS = 8
TEMPERATURE = 0.7
TOP_P = 0.9
GPU_LAYERS = 0  # CPU only für stabileren Start (später auf 32 erhöhen)

# ============================================================================
# AUTHENTICATION
# ============================================================================

def verify_auth():
    """Prüft Authorization Header"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return False
    token = auth_header.split(' ')[1]
    return token == AUTH_TOKEN

# ============================================================================
# ROUTES
# ============================================================================

@app.route('/health', methods=['GET'])
def health():
    """Health check - kein Auth für Monitoring"""
    return jsonify({
        "status": "ok",
        "service": "PhilogicAI",
        "timestamp": datetime.now().isoformat(),
        "model": os.path.basename(MODEL_PATH)
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """Chat Endpoint mit llama.cpp Inference"""
    
    # Auth Check
    if not verify_auth():
        return jsonify({"error": "Unauthorized - Invalid token"}), 401
    
    try:
        data = request.json
        message = data.get('message', '')
        history = data.get('history', [])
        
        if not message:
            return jsonify({"error": "Message required"}), 400
        
        print(f"\n[{datetime.now().strftime('%H:%M:%S')}] New chat request: {message[:50]}...")
        
        # TEST MODE - Ohne llama.cpp für ersten Test
        TEST_MODE = os.getenv('PHILOGIC_TEST_MODE', 'false').lower() == 'true'
        
        if TEST_MODE:
            response_text = f"PhilogicAI Test-Antwort: Ich habe deine Nachricht '{message}' erhalten. Der echte AI-Server würde hier mit llama.cpp antworten. Alles funktioniert! 🎉"
            inference_time = 0.1
            print(f"[{datetime.now().strftime('%H:%M:%S')}] TEST MODE - Simulated response")
        else:
            # Baue Prompt mit Conversation History
            prompt = build_prompt(message, history)
            
            # Rufe llama.cpp auf
            start_time = time.time()
            response_text = call_llama_cpp(prompt)
            inference_time = time.time() - start_time
            
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Response generated in {inference_time:.2f}s")
        
        return jsonify({
            "response": response_text,
            "model": os.path.basename(MODEL_PATH) if not TEST_MODE else "Test Mode",
            "inference_time": round(inference_time, 2),
            "status": "success"
        })
        
    except subprocess.TimeoutExpired:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] ERROR: Request timeout")
        return jsonify({"error": "Request timeout - Model inference took too long"}), 504
        
    except FileNotFoundError as e:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] ERROR: File not found - {e}")
        return jsonify({
            "error": "Model or llama.cpp executable not found",
            "details": str(e)
        }), 500
        
    except Exception as e:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] ERROR: {e}")
        return jsonify({"error": str(e)}), 500

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def build_prompt(message, history):
    """Baut Prompt aus Message und History"""
    
    # System Prompt für Business Context
    system_prompt = """Du bist PhilogicAI, ein intelligenter Assistent für das PhilogicHub CRM System.
Du hilfst bei Fragen zu:
- Unternehmensdaten und CRM-Funktionen
- Verkaufschancen und Pipeline-Management
- Kontaktverwaltung und Aktivitäten
- Analysen und Reportings

Antworte auf Deutsch, präzise und professionell."""

    prompt = f"{system_prompt}\n\n"
    
    # Füge die letzten 10 Messages als Context hinzu
    for msg in history[-10:]:
        role = "Benutzer" if msg['role'] == 'user' else "PhilogicAI"
        content = msg['content']
        prompt += f"{role}: {content}\n"
    
    prompt += f"Benutzer: {message}\nPhilogicAI: "
    
    return prompt

def call_llama_cpp(prompt):
    """Ruft llama.cpp CLI auf und gibt Antwort zurück"""
    
    # Prüfe ob Dateien existieren
    if not os.path.exists(LLAMA_CPP_PATH):
        raise FileNotFoundError(f"llama-cli.exe nicht gefunden: {LLAMA_CPP_PATH}")
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model nicht gefunden: {MODEL_PATH}")
    
    # Baue llama.cpp Command
    cmd = [
        LLAMA_CPP_PATH,
        "-m", MODEL_PATH,
        "-p", prompt,
        "-n", str(MAX_TOKENS),
        "-t", str(THREADS),
        "--temp", str(TEMPERATURE),
        "--top-p", str(TOP_P),
        "-ngl", str(GPU_LAYERS),
        "--no-display-prompt",  # Zeige Prompt nicht im Output
        "--log-disable",        # Kein Debug-Logging
    ]
    
    # Führe Command aus
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        timeout=60,  # 1 Minute max für Tests
        encoding='utf-8',
        errors='replace'
    )
    
    # Parse Output
    output = result.stdout.strip()
    
    # llama.cpp gibt manchmal Prompt mit zurück - entferne es
    if "PhilogicAI:" in output:
        # Nimm alles nach dem letzten "PhilogicAI:"
        parts = output.split("PhilogicAI:")
        response_text = parts[-1].strip()
    else:
        response_text = output
    
    # Cleanup - entferne trailing artifacts
    response_text = response_text.strip()
    
    # Fallback wenn leer
    if not response_text:
        response_text = "Entschuldigung, ich konnte keine Antwort generieren. Bitte versuche es erneut."
    
    return response_text

# ============================================================================
# STARTUP
# ============================================================================

def check_setup():
    """Prüft ob alle Dateien existieren beim Start"""
    print("\n" + "="*60)
    print("PhilogicAI Server Starting...")
    print("="*60)
    
    errors = []
    
    if not os.path.exists(LLAMA_CPP_PATH):
        errors.append(f"❌ llama-cli.exe nicht gefunden: {LLAMA_CPP_PATH}")
    else:
        print(f"✅ llama-cli.exe gefunden")
    
    if not os.path.exists(MODEL_PATH):
        errors.append(f"❌ Model nicht gefunden: {MODEL_PATH}")
    else:
        model_size_gb = os.path.getsize(MODEL_PATH) / (1024**3)
        print(f"✅ Model geladen: {os.path.basename(MODEL_PATH)} ({model_size_gb:.1f} GB)")
    
    if AUTH_TOKEN == 'your-secure-token-change-this-32-chars':
        print("⚠️  WARNING: Standard Auth Token - bitte ändern!")
        print("   Generiere mit: python -c \"import secrets; print(secrets.token_urlsafe(32))\"")
    else:
        print(f"✅ Auth Token konfiguriert")
    
    print(f"\nKonfiguration:")
    print(f"  Max Tokens: {MAX_TOKENS}")
    print(f"  Threads: {THREADS}")
    print(f"  GPU Layers: {GPU_LAYERS}")
    print(f"  Temperature: {TEMPERATURE}")
    
    if errors:
        print("\n" + "="*60)
        print("SETUP FEHLER:")
        for error in errors:
            print(error)
        print("="*60)
        print("\nBitte korrigiere die Pfade in server.py!")
        return False
    
    print("="*60)
    print("✅ Server bereit!")
    print("="*60 + "\n")
    return True

if __name__ == '__main__':
    if check_setup():
        # Server nur auf localhost - Cloudflare Tunnel exposed es
        print("🚀 PhilogicAI Server läuft auf http://127.0.0.1:8001")
        print("   Health: http://127.0.0.1:8001/health")
        print("   Chat: POST http://127.0.0.1:8001/api/chat")
        print("\nDrücke CTRL+C zum Beenden\n")
        
        app.run(
            host='127.0.0.1',
            port=8001,
            debug=False,
            threaded=True
        )
    else:
        print("\n❌ Server konnte nicht gestartet werden - siehe Fehler oben")
        input("\nDrücke Enter zum Beenden...")

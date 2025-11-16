# HMAC Webhook Validation für n8n

Dieses Template validiert eingehende Webhooks mit HMAC-SHA256 Signaturen.

## Setup

1. **Environment Variable**: Setze `N8N_WEBHOOK_HMAC_SECRET` in deiner `.env` Datei
2. **Workflow**: Füge einen **Code Node** direkt nach dem **Webhook Trigger** ein
3. **Code**: Kopiere den Code unten in den Code Node

## JavaScript Code für Code Node

```javascript
// ============================================================================
// HMAC Webhook Validation
// Validiert HMAC-SHA256 Signatur von eingehenden Webhooks
// ============================================================================

const crypto = require('crypto');

// HMAC Secret aus Environment
const HMAC_SECRET = $env.N8N_WEBHOOK_HMAC_SECRET;

if (!HMAC_SECRET) {
  throw new Error('N8N_WEBHOOK_HMAC_SECRET nicht gesetzt!');
}

// Headers auslesen
const headers = $input.item.json.headers;
const signature = headers['x-n8n-signature'];
const timestamp = headers['x-n8n-timestamp'];

// Validierung: Header vorhanden?
if (!signature || !timestamp) {
  return [{
    json: {
      error: 'Missing HMAC headers',
      message: 'X-N8N-Signature and X-N8N-Timestamp required'
    }
  }];
}

// Validierung: Timestamp nicht zu alt (5 Minuten)
const now = Math.floor(Date.now() / 1000);
const requestTime = parseInt(timestamp, 10);
const maxAge = 300; // 5 Minuten in Sekunden

if (Math.abs(now - requestTime) > maxAge) {
  return [{
    json: {
      error: 'Timestamp expired',
      message: `Request timestamp ${requestTime} is too old or in the future`
    }
  }];
}

// Raw Body auslesen (wichtig: unveränderte Bytes!)
const rawBody = $input.item.binary?.data?.data || JSON.stringify($input.item.json.body);

// Signatur berechnen
const expectedSignature = crypto
  .createHmac('sha256', HMAC_SECRET)
  .update(`${timestamp}.${rawBody}`)
  .digest('hex');

// Constant-Time Comparison (schützt gegen Timing Attacks)
const givenSignature = Buffer.from(signature, 'hex');
const expectedBuffer = Buffer.from(expectedSignature, 'hex');

const isValid = givenSignature.length === expectedBuffer.length &&
                crypto.timingSafeEqual(givenSignature, expectedBuffer);

// Validierung fehlgeschlagen?
if (!isValid) {
  return [{
    json: {
      error: 'Invalid HMAC signature',
      message: 'Signature verification failed'
    }
  }];
}

// Erfolg: Webhook ist authentisch!
return [{
  json: {
    validated: true,
    timestamp: requestTime,
    body: $input.item.json.body
  }
}];
```

## Error Handling

Nach dem Code Node:

1. **IF Node** hinzufügen mit Condition: `{{ $json.error }} exists`
2. **True Branch** (Fehler):
   - **Respond to Webhook Node**
   - Status Code: `403`
   - Response Body: `{{ $json }}`
3. **False Branch** (Erfolg):
   - Weiter mit deiner Business Logic

## Beispiel: Request mit HMAC signieren (Python)

```python
import hmac
import hashlib
import time
import json
import requests

HMAC_SECRET = "your-secret-here"
WEBHOOK_URL = "https://ai.philogichub.com/n8n/webhook/your-path"

def send_signed_webhook(data):
    timestamp = int(time.time())
    body = json.dumps(data)
    
    # Signatur berechnen
    message = f"{timestamp}.{body}"
    signature = hmac.new(
        HMAC_SECRET.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    
    # Request senden
    response = requests.post(
        WEBHOOK_URL,
        json=data,
        headers={
            'X-N8N-Signature': signature,
            'X-N8N-Timestamp': str(timestamp),
            'Content-Type': 'application/json'
        }
    )
    
    return response

# Beispiel
result = send_signed_webhook({"message": "Hello n8n!"})
print(result.status_code, result.text)
```

## Beispiel: Request mit HMAC signieren (PowerShell)

```powershell
$HMAC_SECRET = "your-secret-here"
$WEBHOOK_URL = "https://ai.philogichub.com/n8n/webhook/your-path"

function Send-SignedWebhook {
    param($Data)
    
    $timestamp = [int][Math]::Floor((Get-Date).ToUniversalTime().Subtract((Get-Date "1970-01-01")).TotalSeconds)
    $body = $Data | ConvertTo-Json -Compress
    
    # Signatur berechnen
    $message = "$timestamp.$body"
    $hmac = New-Object System.Security.Cryptography.HMACSHA256
    $hmac.Key = [System.Text.Encoding]::UTF8.GetBytes($HMAC_SECRET)
    $hash = $hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($message))
    $signature = [BitConverter]::ToString($hash).Replace('-', '').ToLower()
    
    # Request senden
    Invoke-WebRequest -Uri $WEBHOOK_URL -Method POST -Body $body -Headers @{
        'X-N8N-Signature' = $signature
        'X-N8N-Timestamp' = $timestamp
        'Content-Type' = 'application/json'
    }
}

# Beispiel
Send-SignedWebhook -Data @{ message = "Hello n8n!" }
```

## Troubleshooting

### "Missing HMAC headers"
- Prüfe: Header `X-N8N-Signature` und `X-N8N-Timestamp` werden mitgesendet
- Case-sensitive! Header müssen genau so heißen

### "Timestamp expired"
- Prüfe: Systemzeit ist korrekt synchronisiert
- Max. Abweichung: 5 Minuten
- Erhöhe `maxAge` im Code wenn nötig

### "Invalid HMAC signature"
- Prüfe: `N8N_WEBHOOK_HMAC_SECRET` ist identisch bei Sender und n8n
- Prüfe: Raw Body wird unverändert verwendet (kein Pretty-Print!)
- Prüfe: Timestamp ist derselbe Wert für Signatur und Header

### Debug: Signatur ausgeben

```javascript
// Füge vor der Validation hinzu:
console.log('Given Signature:', signature);
console.log('Expected Signature:', expectedSignature);
console.log('Message:', `${timestamp}.${rawBody}`);
```

## Security Notes

- **Constant-Time Comparison**: Verhindert Timing Attacks
- **Timestamp Check**: Verhindert Replay Attacks (alte Requests werden abgelehnt)
- **Raw Body**: Wichtig für korrekte Signatur (keine Manipulationen!)
- **Secret Rotation**: Ändere HMAC Secret regelmäßig (alle 90 Tage empfohlen)

## Integration mit PhilogicAI

PhilogicAI Backend kann Webhooks signieren:

```python
# backend/app/webhooks.py (Beispiel)
import hmac
import hashlib
import time
import httpx
from app.core.config import settings

async def send_to_n8n(workflow_path: str, data: dict):
    timestamp = int(time.time())
    body = json.dumps(data)
    message = f"{timestamp}.{body}"
    
    signature = hmac.new(
        settings.N8N_WEBHOOK_HMAC_SECRET.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://ai.philogichub.com/n8n/webhook/{workflow_path}",
            json=data,
            headers={
                'X-N8N-Signature': signature,
                'X-N8N-Timestamp': str(timestamp)
            },
            timeout=30.0
        )
    
    return response
```

# Cloudflare Access Setup für n8n

Step-by-step Guide für Cloudflare Access Konfiguration um n8n UI sicher mobil zugänglich zu machen.

## 🎯 Ziel

- **UI Access**: `/n8n/*` mit IdP/MFA geschützt
- **Webhook Access**: `/n8n/webhook/*` ohne Access (HMAC-protected)
- **Mobile friendly**: Session Cookie funktioniert auf Handy
- **Production ready**: MFA, Audit Logs, Session Management

## 📋 Voraussetzungen

- Cloudflare Account mit aktiver Domain (ai.philogichub.com)
- Cloudflare Tunnel "philogic-ai-tunnel" läuft
- n8n Services laufen auf localhost:5678
- Mindestens Free Plan (Access für bis zu 50 User)

## 🚀 Setup Schritte

### 1. Cloudflare Dashboard öffnen

1. Login: https://dash.cloudflare.com
2. Wähle Domain: `philogichub.com`
3. Sidebar: **Access** > **Applications**

### 2. Application für n8n UI erstellen

#### Application Basics

Click **Add an Application** > **Self-hosted**

**Name:** `n8n UI - PhilogicHub`

**Session Duration:** `24 hours` (empfohlen für Mobile Use)

**Application domain:**
- **Subdomain:** `ai`
- **Domain:** `philogichub.com`
- **Path:** `/n8n`

**Important:** Bei Path folgende Einstellung:
- ✅ Include subpaths: **Enabled** (damit `/n8n/*` alle Unterseiten abdeckt)

#### Identity Providers (IdP)

Wähle mindestens einen IdP:

**Option 1: One-time PIN (Email OTP)**
- **Vorteil:** Keine externe IdP nötig, nur Email
- **Setup:** Add > One-time PIN
- **Email Domains:** `*@gmail.com`, `*@outlook.com`, etc. (oder spezifische Emails)

**Option 2: Google (empfohlen für Mobile)**
- **Vorteil:** Fast Login, bereits auf Handy eingeloggt
- **Setup:**
  1. Add > Google
  2. Erstelle Google OAuth App:
     - https://console.cloud.google.com/apis/credentials
     - OAuth 2.0 Client ID
     - Authorized redirect URIs: `https://<your-team-name>.cloudflareaccess.com/cdn-cgi/access/callback`
  3. Client ID + Secret in Cloudflare einfügen

**Option 3: GitHub**
- **Vorteil:** Developer-friendly
- **Setup:**
  1. Add > GitHub
  2. GitHub Settings > Developer settings > OAuth Apps > New
  3. Authorization callback URL: `https://<your-team-name>.cloudflareaccess.com/cdn-cgi/access/callback`
  4. Client ID + Secret in Cloudflare einfügen

**Team Name finden:**
- Cloudflare Dashboard > Access > Settings > General
- Team domain: `<your-team-name>.cloudflareaccess.com`

#### Block Page

**Enable:** On

**Text:** "Zugriff verweigert. Bitte kontaktiere den Administrator für Freigabe."

#### CORS Settings

**CORS Allowed Origins:** (leer lassen, nicht benötigt)

**CORS Allow All Origins:** Off

**CORS Allow Credentials:** Off

#### Cookie Settings

**Cookie Mode:** `HTTP Only` (empfohlen)

**Same Site Attribute:** `Lax` (wichtig für Mobile!)

**Cookie Duration:** `24 hours` (synchron mit Session Duration)

**Path:** `/n8n` (scope auf n8n begrenzt)

### 3. Access Policy erstellen

#### Policy 1: Allow Specific Users

**Policy Name:** `Allowed Users`

**Action:** **Allow**

**Configure Rules:**

**Rule 1: Emails**
- **Selector:** `Emails`
- **Value:** 
  ```
  your-email@example.com
  another-user@example.com
  ```

**Oder Rule 2: Email Domain**
- **Selector:** `Emails ending in`
- **Value:** `@yourcompany.com`

**Oder Rule 3: Everyone (für Testing)**
- **Selector:** `Everyone`
- **Value:** (keine)
- ⚠️ **WARNUNG:** Nur für Testing! Production: spezifische Emails/Domains!

#### Policy 2: Require MFA (Optional, empfohlen)

**Policy Name:** `MFA Required`

**Action:** **Allow**

**Configure Rules:**

**Rule 1:** (wie oben, z.B. Emails)

**Session Duration Override:** `12 hours`

**Require MFA:** ✅ Enabled (wenn IdP MFA unterstützt)

#### Policy 3: Block Webhooks (wichtig!)

**Policy Name:** `Bypass Webhooks`

**Action:** **Bypass** (kein Access Check)

**Configure Rules:**

**Rule:** `Path`
- **Path:** `/n8n/webhook/*`

**Why Bypass?**
- Webhooks kommen von PhilogicAI (localhost) oder externen APIs
- Haben keine Browser-Session für Access Cookie
- Sind mit HMAC geschützt (separate Security Layer)

**WICHTIG:** Diese Policy muss **VOR** der Allow Policy sein (höhere Priorität)!

### 4. Policy Reihenfolge prüfen

Policies werden von oben nach unten ausgewertet:

1. **Bypass Webhooks** (Path `/n8n/webhook/*`)
2. **Allow Specific Users** (UI Access)
3. **(Optional) Block All** (Fallback Deny)

Drag & Drop um Reihenfolge zu ändern.

### 5. Application speichern

Click **Save Application**

### 6. Testen

#### Desktop Test

1. Öffne: https://ai.philogichub.com/n8n
2. Sollte redirecten zu Cloudflare Access Login
3. Wähle IdP (z.B. Google)
4. Login durchführen
5. Redirect zurück zu n8n UI
6. n8n sollte laden

#### Mobile Test

1. Öffne auf Handy: https://ai.philogichub.com/n8n
2. Cloudflare Access Login (IdP oder Email OTP)
3. n8n UI sollte laden
4. Session bleibt 24h aktiv (kein Re-Login nötig)

#### Webhook Test

```powershell
# Test von localhost (sollte Access bypassen)
Invoke-WebRequest -Uri "https://ai.philogichub.com/n8n/webhook/test" -Method POST -Body '{"test": true}' -ContentType "application/json"

# Expected: 404 (kein Workflow mit diesem Path) oder 403 (HMAC fehlt)
# NOT Expected: Cloudflare Access Redirect (HTML)
```

### 7. Audit Logs prüfen

Cloudflare Dashboard > Access > **Logs**

**Zeigt:**
- Alle Login-Versuche (User, IdP, Timestamp)
- Allow/Deny Decisions
- Session Refreshes
- IP Addresses

**Nützlich für:**
- Security Monitoring
- Troubleshooting (wer kommt nicht rein?)
- Compliance Audits

## 🔧 Advanced Settings

### Session Management

**Revoke Sessions:**
- Dashboard > Access > Users
- Suche User > Revoke Sessions
- User muss sofort Re-Login

**Session Timeout:**
- Default: 24h (konfiguriert in Application Settings)
- Override per Policy möglich (z.B. MFA = 12h)

### Country-based Blocking (Optional)

**Policy:**
- **Selector:** `Country`
- **Value:** `DE, AT, CH` (nur Deutschland, Österreich, Schweiz)
- **Action:** Allow

**Use Case:**
- Zusätzliche Security Layer wenn nur aus bestimmten Ländern zugreifen
- Achtung: Mobile Daten Roaming kann Country ändern!

### IP Allowlist (Optional)

**Policy:**
- **Selector:** `IP ranges`
- **Value:** `1.2.3.4/32` (deine Home IP)
- **Action:** Allow

**Use Case:**
- Zusätzliche Restriktion für Admin-Zugriff
- Kombination mit Email: `(Email = admin@example.com) AND (IP = 1.2.3.4/32)`

### Service Tokens (für API Calls)

**Use Case:** n8n-to-n8n Communication (Advanced)

**Setup:**
1. Access > Service Auth > **Create Service Token**
2. **Name:** `n8n Internal API`
3. **Duration:** `Indefinite` oder `1 year`
4. **Client ID + Client Secret** kopieren

**Usage:**
```bash
curl -H "CF-Access-Client-Id: <client-id>" \
     -H "CF-Access-Client-Secret: <client-secret>" \
     https://ai.philogichub.com/n8n/api/workflows
```

**Policy:**
- **Selector:** `Service Token`
- **Value:** `n8n Internal API`
- **Action:** Allow

## 🔐 Security Best Practices

### ✅ DO

- **Spezifische Emails:** Allowlist nur bekannte User
- **MFA aktivieren:** Wenn IdP unterstützt (Google, GitHub, etc.)
- **Session Timeout:** Max. 24h, für höhere Security 12h
- **Cookie Path:** Scope auf `/n8n` (nicht Root `/`)
- **Webhook Bypass:** Separate Policy für `/n8n/webhook/*`
- **Audit Logs:** Regelmäßig prüfen (wöchentlich)
- **Test Policies:** Vor Production mit "Everyone" testen, dann einschränken

### ❌ DON'T

- **Everyone Policy:** Nicht in Production (nur Testing!)
- **Root Cookie Path:** Nicht `/` (sonst gilt für gesamte Domain)
- **Kein Webhook Bypass:** Webhooks würden scheitern
- **Lange Sessions:** Nicht > 24h (Security Risk)
- **NEXTAUTH_SECRET für HMAC:** Separate Secrets!

## 🧪 Testing Checklist

- [ ] Desktop Browser: Login funktioniert
- [ ] Mobile Browser: Login funktioniert
- [ ] Session Persistence: Nach Browser-Close noch eingeloggt (24h)
- [ ] Webhook Bypass: `/n8n/webhook/*` ohne Access Challenge
- [ ] Logout: Revoke Session funktioniert
- [ ] MFA: Wenn aktiviert, wird prompted
- [ ] Audit Logs: Events werden geloggt
- [ ] Country Block: Wenn konfiguriert, funktioniert
- [ ] Multiple IdPs: Alle konfigurierten IdPs funktionieren

## 🆘 Troubleshooting

### Access Denied (alle User)

**Check:**
1. Policy Action = **Allow** (nicht Block!)
2. Policy Rules: Mindestens eine Rule matched User
3. IdP konfiguriert und aktiv
4. Application gespeichert

### Redirect Loop

**Check:**
1. Cookie Settings: Same Site = `Lax` (nicht `Strict`)
2. Cookie Path = `/n8n` (nicht `/n8n/`)
3. Browser Cache leeren
4. Cookies für `cloudflareaccess.com` und `philogichub.com` erlauben

### Webhooks scheitern (401/403)

**Check:**
1. Policy "Bypass Webhooks" existiert
2. Path = `/n8n/webhook/*` (genau so!)
3. Action = **Bypass** (nicht Service Auth)
4. Policy Reihenfolge: Bypass VOR Allow

### Mobile Login funktioniert nicht

**Check:**
1. Cookie Same Site = `Lax` (nicht `None` oder `Strict`)
2. IdP Mobile-kompatibel (Google, GitHub JA; Custom SAML evtl. NEIN)
3. Session Duration nicht abgelaufen
4. Mobile Browser Cookies aktiviert (keine Privacy Extensions)

### Session läuft zu schnell ab

**Check:**
1. Application Session Duration = 24h
2. Policy Override: Keine Policy setzt kürzere Session
3. Cloudflare Access Settings > Session Management: Global Timeout prüfen

### IdP Login scheitert

**Check:**
1. OAuth Redirect URI korrekt: `https://<team-name>.cloudflareaccess.com/cdn-cgi/access/callback`
2. OAuth App active (nicht suspended)
3. Client ID + Secret korrekt kopiert
4. IdP Logs prüfen (Google Console, GitHub Settings)

## 📚 Weiterführende Links

- **Cloudflare Access Docs:** https://developers.cloudflare.com/cloudflare-one/identity/access/
- **Policies Guide:** https://developers.cloudflare.com/cloudflare-one/policies/access/
- **Service Tokens:** https://developers.cloudflare.com/cloudflare-one/identity/service-tokens/
- **Audit Logs:** https://developers.cloudflare.com/cloudflare-one/insights/logs/

---

**Version:** 1.0.0  
**Last Updated:** 2024-01  
**Maintainer:** Philip @ PhilogicHub

# 🚀 Final Setup Steps - PhiLogic Hub Domains

## Status: DNS ✅ | Deployment ✅ | SSL ⏳ | ENV ⚠️

### Quick Actions Required

#### 1. Vercel Environment Variables (5 Min)

**site-Projekt** → https://vercel.com/schneckberts-projects/site/settings/environment-variables

```env
SITE_URL=https://www.hub.philogic-labs.de/
PUBLIC_WEB3FORMS_KEY=82690c1d-2243-4b47-a5f2-f85da2eb24ab
```

**philogichub-Projekt** → https://vercel.com/schneckberts-projects/philogichub/settings/environment-variables

Supabase Connection String holen:
1. Gehe zu https://supabase.com/dashboard/project/[your-project]/settings/database
2. Connection String → Transaction → Copy
3. In Vercel eintragen:

```env
DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
NEXT_PUBLIC_BASE_URL=https://ai.philogic-labs.de
```

Nach dem Speichern: **Redeploy** Button klicken!

#### 2. Primary Domain setzen (2 Min)

**site-Projekt** → https://vercel.com/schneckberts-projects/site/settings/domains

Bei `www.hub.philogic-labs.de`:
- Klick auf **"⋮"** Menu
- **"Set as Primary Domain"**

#### 3. SSL-Zertifikate prüfen (5-15 Min Wartezeit)

Vercel stellt automatisch Let's Encrypt Zertifikate aus. Prüfe Status:

```powershell
# Test site
Start-Process "https://www.hub.philogic-labs.de/"

# Test CRM
Start-Process "https://ai.philogic-labs.de/"
```

**Erwartung**: Grünes Schloss im Browser, keine Zertifikatswarnungen.

Falls noch "Certificate Pending":
- Warte 5-15 Minuten
- Vercel Dashboard → Domains → **"Refresh"**

#### 4. Cloudflare SSL/TLS Check

https://dash.cloudflare.com/ → philogic-labs.de Zone → SSL/TLS

**Stelle sicher**:
- SSL/TLS Encryption Mode: **"Full (strict)"** ✅
- Universal SSL: **On** ✅
- Edge Certificates: Status **Active** ✅

### ⚡ One-Line Commands

```powershell
# Teste DNS
nslookup hub.philogic-labs.de; nslookup ai.philogic-labs.de

# Öffne beide URLs
Start-Process "https://www.hub.philogic-labs.de/"; Start-Process "https://ai.philogic-labs.de/"

# Redeploy bei Problemen
cd c:\Philip\myapps\site; vercel --prod --force
cd c:\Philip\myapps\philogichub; vercel --prod --force
```

### 📋 Verification Checklist

Nach Setup-Completion teste:

**site (Astro)**:
- [ ] https://www.hub.philogic-labs.de/ lädt ohne Fehler
- [ ] Grünes SSL-Schloss im Browser
- [ ] Navigation funktioniert
- [ ] Kontaktformular sendet (Web3Forms)
- [ ] Tools-Seite lädt

**philogichub (Next.js CRM)**:
- [ ] https://ai.philogic-labs.de/ lädt ohne Fehler
- [ ] Grünes SSL-Schloss im Browser
- [ ] Dashboard zeigt Daten
- [ ] Companies-Liste lädt
- [ ] Analytics funktionieren
- [ ] Keine Database Connection Errors

### 🐛 Common Issues & Fixes

#### "Mixed Content" Errors
```powershell
# Fix: Stelle sicher, dass SITE_URL und NEXT_PUBLIC_BASE_URL https:// verwenden
# Vercel → Env Vars prüfen → Redeploy
```

#### "Database Connection Timeout"
```powershell
# Fix 1: Nutze Connection Pooling URL (Port 6543)
# Fix 2: Supabase Dashboard → Database → Enable Connection Pooling
# Fix 3: Vercel → DATABASE_URL updaten → Redeploy
```

#### "Domain not verified"
```powershell
# Wait for DNS propagation
Start-Sleep -Seconds 300  # 5 minutes
# Then: Vercel Dashboard → Domains → Refresh
```

#### SSL Certificate Pending > 15 Min
```powershell
# Cloudflare: Kurzzeitig "DNS only" (graue Wolke) aktivieren
# Vercel wartet auf SSL-Ausstellung
# Nach Erfolg: Cloudflare Proxy wieder aktivieren (orange Wolke)
```

### 🎯 Success Criteria

✅ **COMPLETE** wenn alle diese Tests erfolgreich:

```powershell
# Test 1: DNS auflösen
nslookup hub.philogic-labs.de
# ✅ Erwartet: Cloudflare IPs (172.67.x.x, 104.21.x.x)

# Test 2: HTTPS lädt
Invoke-WebRequest "https://www.hub.philogic-labs.de/" -UseBasicParsing
# ✅ Erwartet: StatusCode 200

# Test 3: HTTPS lädt
Invoke-WebRequest "https://ai.philogic-labs.de/" -UseBasicParsing
# ✅ Erwartet: StatusCode 200

# Test 4: SSL-Zertifikat gültig
curl -I "https://www.hub.philogic-labs.de/"
# ✅ Erwartet: HTTP/2 200, Kein SSL-Fehler
```

### 📞 Support

Bei Problemen:
1. Prüfe `HUB_DOMAIN_SETUP.md` → Troubleshooting
2. Vercel Build Logs: https://vercel.com/schneckberts-projects/[project]/deployments
3. Cloudflare Logs: https://dash.cloudflare.com/ → Analytics → Logs

---

**Geschätzte Zeit**: 15-30 Minuten (inkl. SSL-Wartezeit)  
**Schwierigkeit**: Einfach (nur Copy-Paste + Klicks)  
**Ziel**: https://www.hub.philogic-labs.de/ LIVE ✅

# PhiLogic Hub Domain Setup - LIVE ✅

## Status: PRODUCTION DEPLOYED

### 🌐 Live URLs

| Service | Domain | Status | Deployment |
|---------|--------|--------|------------|
| **Main Hub (Astro Site)** | https://www.hub.philogic-labs.de/ | ✅ Active | site-8cmmxdl6e-schneckberts-projects.vercel.app |
| **AI/CRM (Next.js)** | https://ai.philogic-labs.de/ | ✅ Active | philogichub-2ub9zjmn5-schneckberts-projects.vercel.app |

### 🔧 DNS Configuration (Cloudflare)

**Zone**: philogic-labs.de (ID: `9dfa5a37c494a97597a7bbcf6d803d35`)  
**Nameservers**: elijah.ns.cloudflare.com, eve.ns.cloudflare.com

#### DNS Records Created:

```
✅ CNAME hub.philogic-labs.de → cname.vercel-dns.com (proxied)
✅ CNAME www.hub.philogic-labs.de → cname.vercel-dns.com (proxied)
✅ CNAME ai.philogic-labs.de → cname.vercel-dns.com (proxied)
✅ A @ → 76.76.21.21 (Apex for www.philogic-labs.de)
✅ CNAME www → cname.vercel-dns.com (Main site)
```

**DNS Verification**:
```powershell
nslookup hub.philogic-labs.de
# Returns: 172.67.163.207, 104.21.15.196 (Cloudflare IPs) ✅

nslookup ai.philogic-labs.de
# Returns: 172.67.163.207, 104.21.15.196 (Cloudflare IPs) ✅
```

### 📦 Vercel Projects

#### 1. site (Astro - Main Hub)
- **Project**: schneckberts-projects/site
- **Domains**: 
  - hub.philogic-labs.de (Primary)
  - www.hub.philogic-labs.de
- **Framework**: Astro (static)
- **Build**: `npm run build`
- **Output**: `dist/`
- **Latest Deploy**: https://vercel.com/schneckberts-projects/site/S2WCb2k7rK7FuewrFihAyEBRNn9S

#### 2. philogichub (Next.js - CRM)
- **Project**: schneckberts-projects/philogichub
- **Domain**: ai.philogic-labs.de
- **Framework**: Next.js 14 (App Router)
- **Build**: `npm run build`
- **Output**: `.next/`
- **Latest Deploy**: https://vercel.com/schneckberts-projects/philogichub/EoaFvvc2gzTEBFX2Rcutqc4z2YxW

### 🔐 Environment Variables

#### site (.env.local)
```env
SITE_URL=https://www.hub.philogic-labs.de/
PUBLIC_WEB3FORMS_KEY=82690c1d-2243-4b47-a5f2-f85da2eb24ab
CLOUDFLARE_API_TOKEN=_lHGmzxO1PZkeJ66CPjWLUpo0SiWGdNoSpI2FmuL
CLOUDFLARE_ZONE_ID=9dfa5a37c494a97597a7bbcf6d803d35
CLOUDFLARE_ACCOUNT_ID=d4fe9dd06e68dccaac98b16f76cb128b
```

**Vercel Environment Variables für site:**
```
SITE_URL=https://www.hub.philogic-labs.de/
PUBLIC_WEB3FORMS_KEY=82690c1d-2243-4b47-a5f2-f85da2eb24ab
```

#### philogichub (.env)
Aus Supabase Dashboard holen:
```env
DATABASE_URL=postgresql://[user]:[password]@[host]:6543/postgres
NEXT_PUBLIC_BASE_URL=https://ai.philogic-labs.de
```

**Vercel Environment Variables für philogichub:**
```
DATABASE_URL=(Supabase Connection Pooling URL)
NEXT_PUBLIC_BASE_URL=https://ai.philogic-labs.de
```

### 🚀 Deployment Commands

#### site (Astro)
```powershell
cd c:\Philip\myapps\site
vercel --prod
# Preview: vercel
```

#### philogichub (Next.js)
```powershell
cd c:\Philip\myapps\philogichub
vercel --prod
# Preview: vercel
```

### 📝 Redirect Configuration

**vercel.json (site)**:
```json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [{ "type": "host", "value": "hub.philogic-labs.de" }],
      "destination": "https://www.hub.philogic-labs.de/:path*",
      "permanent": true
    }
  ]
}
```

Hub ohne www → www automatisch umgeleitet (308 Permanent Redirect).

### 🛠️ Management Scripts

#### DNS Setup (site/scripts/)
```powershell
# DNS in Cloudflare konfigurieren
node scripts/setup-hub-dns.mjs plan   # Dry-run
node scripts/setup-hub-dns.mjs apply  # Execute

# Vercel Domain hinzufügen
node scripts/add-hub-domain.mjs
```

#### Vercel CLI
```powershell
# Domains auflisten
vercel domains ls

# Domain hinzufügen
vercel domains add hub.philogic-labs.de

# Projekt verlinken
vercel link

# Status prüfen
vercel whoami
```

### ✅ Verification Checklist

- [x] DNS Records in Cloudflare erstellt
- [x] DNS-Auflösung funktioniert (nslookup)
- [x] Vercel Projekte verlinkt
- [x] Domains zu Vercel-Projekten hinzugefügt
- [x] site zu Production deployed
- [x] philogichub zu Production deployed
- [ ] SSL-Zertifikate ausgestellt (automatisch nach DNS-Verifikation)
- [ ] Primary Domain in Vercel Dashboard gesetzt
- [ ] Environment Variables in Vercel konfiguriert
- [ ] https://www.hub.philogic-labs.de/ getestet
- [ ] https://ai.philogic-labs.de/ getestet

### 🔄 Nächste Schritte

#### 1. Vercel Dashboard: Environment Variables setzen

**site-Projekt:**
1. Gehe zu https://vercel.com/schneckberts-projects/site/settings/environment-variables
2. Füge hinzu:
   - `SITE_URL` = `https://www.hub.philogic-labs.de/`
   - `PUBLIC_WEB3FORMS_KEY` = `82690c1d-2243-4b47-a5f2-f85da2eb24ab`
3. Redeploy triggern

**philogichub-Projekt:**
1. Gehe zu https://vercel.com/schneckberts-projects/philogichub/settings/environment-variables
2. Füge hinzu:
   - `DATABASE_URL` = (Supabase Connection String mit Port 6543)
   - `NEXT_PUBLIC_BASE_URL` = `https://ai.philogic-labs.de`
3. Redeploy triggern

#### 2. Vercel Dashboard: Primary Domain setzen

**site-Projekt:**
1. Gehe zu https://vercel.com/schneckberts-projects/site/settings/domains
2. Bei `www.hub.philogic-labs.de` → "Set as Primary Domain"

#### 3. SSL/TLS Zertifikate verifizieren

Vercel stellt automatisch Let's Encrypt Zertifikate aus. Nach DNS-Verifikation (~5-15 Min):
- https://www.hub.philogic-labs.de/ → sollte grünes Schloss zeigen
- https://ai.philogic-labs.de/ → sollte grünes Schloss zeigen

#### 4. Cloudflare SSL/TLS Settings

1. Gehe zu https://dash.cloudflare.com/
2. philogic-labs.de Zone → SSL/TLS
3. Stelle sicher: **"Full (strict)"** ist aktiviert
4. Universal SSL: On

#### 5. Browser-Test

```powershell
# Test site
Start-Process "https://www.hub.philogic-labs.de/"

# Test philogichub CRM
Start-Process "https://ai.philogic-labs.de/"
```

### 🐛 Troubleshooting

#### Problem: "Domain not verified" in Vercel

**Lösung**: 
```powershell
# Warte 5-15 Minuten für DNS-Propagation
# Dann prüfe:
nslookup hub.philogic-labs.de
# Sollte Cloudflare IPs zurückgeben (172.67.x.x, 104.21.x.x)

# In Vercel Dashboard: Domains → "Refresh"
```

#### Problem: SSL Certificate Error

**Lösung**:
1. Cloudflare SSL/TLS → "Full (strict)"
2. Warte auf Vercel SSL-Ausstellung (~5 Min)
3. Kurzzeitig "DNS only" (graue Wolke) in Cloudflare aktivieren
4. Nach Vercel SSL OK → Proxy wieder aktivieren (orange Wolke)

#### Problem: 404 oder Wrong Content

**Lösung**:
```powershell
# Redeploy mit Build-Cache löschen
cd c:\Philip\myapps\site
vercel --prod --force

cd c:\Philip\myapps\philogichub
vercel --prod --force
```

#### Problem: DATABASE_URL Connection Timeout (philogichub)

**Lösung**:
1. Supabase Dashboard → Settings → Database → Connection Pooling
2. Nutze Connection Pooling URL (Port `6543` statt `5432`)
3. Mode: "Transaction"
4. Update `DATABASE_URL` in Vercel

### 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                  philogic-labs.de                       │
│                  (Cloudflare DNS)                       │
└────────────┬────────────────────────┬───────────────────┘
             │                        │
             │                        │
    ┌────────▼────────┐      ┌────────▼────────┐
    │  hub.* / www.*  │      │  ai.*           │
    │  (Astro Site)   │      │  (Next.js CRM)  │
    └────────┬────────┘      └────────┬────────┘
             │                        │
             │                        │
    ┌────────▼────────┐      ┌────────▼────────┐
    │ Vercel: site    │      │ Vercel:         │
    │ Static (SSG)    │      │ philogichub     │
    │ No Backend      │      │ + Supabase DB   │
    └─────────────────┘      └─────────────────┘
```

### 📖 Documentation References

- **site**: `c:\Philip\myapps\site\README.md`
- **site deployment**: `c:\Philip\myapps\site\docs\DOMAINS.md`
- **philogichub**: `c:\Philip\myapps\philogichub\README.md`
- **philogichub deployment**: `c:\Philip\myapps\philogichub\DEPLOYMENT.md`

### 🎉 Success Metrics

- [x] DNS propagiert zu Cloudflare
- [x] 2 Vercel-Projekte deployed
- [x] 3 Subdomains konfiguriert (hub, www.hub, ai)
- [ ] SSL-Zertifikate aktiv (in Verifikation)
- [ ] Browser-Test erfolgreich

---

**Erstellt**: 2025-11-16  
**Status**: ✅ DNS & Deployment komplett, SSL-Verifikation läuft  
**Verantwortlich**: Philip Schneck  
**Support**: philip@philogic.de

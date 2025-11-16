# Deployment Guide - Vercel

## Voraussetzungen

- GitHub Account mit Repository `schneckbert/philogichub`
- Vercel Account (vercel.com)
- Supabase Datenbank eingerichtet

## Schritt 1: Projekt mit Vercel verbinden

1. Gehe zu [vercel.com](https://vercel.com)
2. Klicke auf **"New Project"**
3. Wähle **GitHub** als Git-Provider
4. Suche nach Repository **"schneckbert/philogichub"**
5. Klicke auf **"Import"**

## Schritt 2: Environment Variables konfigurieren

Im Vercel Dashboard unter **"Environment Variables"**:

```env
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
NEXT_PUBLIC_BASE_URL=https://[your-vercel-url].vercel.app
```

### DATABASE_URL von Supabase holen:
1. Gehe zu deinem Supabase Projekt
2. Settings → Database → Connection String
3. Wähle **"URI"** Mode
4. Kopiere den Connection String
5. Füge in Vercel als `DATABASE_URL` ein

### NEXT_PUBLIC_BASE_URL:
- Bei erstem Deployment leer lassen
- Nach Deployment: Vercel URL eintragen (z.B. `https://philogichub.vercel.app`)
- Danach Re-Deploy triggern

## Schritt 3: Build Settings

Vercel erkennt automatisch Next.js. Standardwerte:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

→ Diese Werte **nicht ändern**!

## Schritt 4: Deploy

1. Klicke auf **"Deploy"**
2. Warte bis Build durchläuft (~2-3 Minuten)
3. Bei Erfolg: **"Visit"** klicken

## Schritt 5: Prisma Client generieren (automatisch)

Vercel führt automatisch aus:
```bash
npm install
npx prisma generate
npm run build
```

Falls Fehler auftreten: `postinstall` Script in `package.json` prüfen:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

## Schritt 6: Custom Domain (optional)

1. Vercel Dashboard → **"Domains"**
2. Domain hinzufügen (z.B. `hub.philogic.de`)
3. DNS-Records bei Domain-Provider setzen:
   - `CNAME` → `cname.vercel-dns.com`
4. Warten auf SSL-Zertifikat (automatisch)
5. `NEXT_PUBLIC_BASE_URL` updaten auf Custom Domain
6. Re-Deploy

## Häufige Fehler & Lösungen

### Error: "Prisma Client could not be generated"
**Lösung**: 
- `postinstall` Script in `package.json` hinzufügen
- Re-Deploy

### Error: "DATABASE_URL not found"
**Lösung**:
- Environment Variables prüfen
- **Wichtig**: Auch für **Production** Environment setzen!
- Re-Deploy

### Error: 500 beim API-Aufruf
**Lösung**:
- Vercel Logs prüfen: Dashboard → Deployment → **"Functions"**
- Oft: Database Connection Timeout → Supabase Connection Pooling aktivieren

### Build erfolgreich, aber Runtime Error
**Lösung**:
- Supabase Connection String prüfen
- RLS (Row Level Security) deaktiviert? → `sql/03_disable_rls_baucrm.sql`
- Connection Pooling URL verwenden (endet auf `:6543` statt `:5432`)

## Performance-Optimierung

### 1. Supabase Connection Pooling
In Supabase: Settings → Database → **"Connection Pooling"**
- Mode: **"Transaction"**
- Port: `6543`
- URL kopieren und als `DATABASE_URL` verwenden

### 2. Vercel Edge Functions (optional)
Für schnellere API-Responses:
```typescript
// app/api/companies/route.ts
export const runtime = 'edge'; // Am Anfang hinzufügen
```

⚠️ Nicht bei allen Prisma-Queries kompatibel!

### 3. ISR (Incremental Static Regeneration)
Für statische Seiten:
```typescript
// app/analytics/page.tsx
export const revalidate = 60; // Alle 60 Sekunden neu generieren
```

## Monitoring & Logs

### Vercel Logs:
1. Dashboard → Projekt → **"Deployments"**
2. Aktuelles Deployment → **"View Function Logs"**
3. Real-Time Logs für API-Aufrufe

### Supabase Logs:
1. Supabase Dashboard → **"Logs"**
2. **"Postgres Logs"** für SQL-Queries
3. Filter nach Zeitraum

## Automatische Deployments

Vercel deployed automatisch bei:
- **Push auf `main`** → Production Deployment
- **Push auf andere Branches** → Preview Deployment
- **Pull Requests** → Preview mit eigener URL

### Production Branch ändern:
Vercel Dashboard → Settings → **"Git"** → Production Branch: `main`

## Rollback bei Fehler

1. Vercel Dashboard → **"Deployments"**
2. Vorheriges funktionierendes Deployment finden
3. **"⋮"** Menu → **"Promote to Production"**
4. Bestätigen

## Status Badge (optional)

Für GitHub README.md:
```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/schneckbert/philogichub)
```

---

**Support**: philip@philogic.de  
**Vercel Docs**: https://vercel.com/docs  
**Supabase Docs**: https://supabase.com/docs

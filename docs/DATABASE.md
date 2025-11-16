# Philogic-Hub – Database Management

## Philosophie

**Alle Datenbank-Änderungen werden direkt in Supabase gemacht.**

- ✅ SQL-Scripts in `sql/` Verzeichnis
- ✅ Ausführung in Supabase SQL Editor
- ✅ Prisma = Query Layer (kein `db push`, kein `migrate`)
- ✅ Schema-Sync mit `npx prisma db pull`

## Workflow: Neue Tabelle erstellen

### 1. SQL-Script schreiben

Erstelle neue Datei: `sql/05_meine_neue_tabelle.sql`

```sql
-- ============================================
-- Philogic-Hub: Neue Feature-Tabelle
-- ============================================
-- Ausführen in: Supabase SQL Editor
-- Datum: 2025-11-15
-- Zweck: Beschreibung der Tabelle

create table if not exists public.neue_tabelle (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  status            text not null default 'active',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Index
create index if not exists neue_tabelle_status_idx on public.neue_tabelle(status);

-- Updated-At Trigger
create trigger neue_tabelle_updated_at
  before update on public.neue_tabelle
  for each row
  execute function public.update_updated_at_column();

-- RLS deaktivieren (Backend-Zugriff)
alter table public.neue_tabelle disable row level security;

-- Kommentar
comment on table public.neue_tabelle is 'Philogic-Hub: Beschreibung';
```

### 2. In Supabase ausführen

- Öffne **Supabase Dashboard → SQL Editor**
- Kopiere SQL-Script-Inhalt
- **Run** klicken

### 3. Prisma-Schema aktualisieren

```powershell
# Schema aus Supabase importieren
.\sync-schema.ps1
```

### 4. API Route erstellen

```typescript
// app/api/neue-tabelle/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const items = await prisma.neueTabelle.findMany();
  return NextResponse.json(items);
}
```

## Workflow: Spalte hinzufügen

### 1. SQL ausführen

```sql
-- Spalte hinzufügen
alter table baucrm.company 
  add column if not exists neue_spalte text;

-- Optional: Index
create index if not exists company_neue_spalte_idx 
  on baucrm.company(neue_spalte);
```

### 2. Schema-Sync

```powershell
.\sync-schema.ps1
```

TypeScript-Typen werden automatisch aktualisiert.

## Workflow: View erstellen

```sql
-- View für Dashboard
create or replace view public.dashboard_neue_stats as
select
  count(*) as total,
  count(*) filter (where status = 'active') as active_count
from baucrm.company;

comment on view public.dashboard_neue_stats is 'Dashboard: Neue Stats';
```

```powershell
.\sync-schema.ps1
```

## Bestehende Tables

### baucrm-Schema (bereits vorhanden)

- `baucrm.company` – Baufirmen
- `baucrm.contact` – Kontakte
- `baucrm.opportunity` – Opportunities
- `baucrm.activity` – Aktivitäten
- `baucrm.company_location` – Standorte
- `baucrm.trade` – Gewerke
- `baucrm.company_trade` – Company-Gewerke-Verknüpfung
- `baucrm.company_tech_profile` – Tech-Stack-Profiling
- `baucrm.wz_code` – WZ-Codes

### public-Schema (Philogic-Hub)

- `public.agent` – Agent-Definitionen
- `public.agent_log` – Agent Execution Logs
- `public.project` – Interne Projekte
- `public.task` – Interne Tasks

### Views

- `public.dashboard_company_stats` – Company KPIs
- `public.dashboard_opportunity_pipeline` – Opportunity Pipeline
- `public.dashboard_recent_activities` – Letzte 50 Activities
- `public.dashboard_top_companies` – Top 20 Companies by Pipeline

## Scripts

```powershell
# Schema aus Supabase importieren + Client generieren
.\sync-schema.ps1

# Prisma Studio öffnen (DB-Browser)
npx prisma studio

# Installation (einmalig)
.\install.ps1

# Dev-Server
.\dev.ps1

# Git Commit
.\commit.ps1
```

## Naming Conventions

### Tables
- **Singular**: `company`, `contact`, `agent`
- **Snake_case**: `company_location`, `agent_log`

### Columns
- **Snake_case**: `name_legal`, `created_at`, `status_sales`

### Indexes
- **Format**: `{table}_{column}_idx`
- **Beispiel**: `company_status_sales_idx`

### Views
- **Prefix**: `dashboard_` für Dashboard-Views
- **Beispiel**: `dashboard_company_stats`

## Troubleshooting

### "Prisma schema out of sync"
```powershell
.\sync-schema.ps1
```

### "relation does not exist"
SQL-Script wurde nicht in Supabase ausgeführt → SQL Editor öffnen und Script ausführen

### Neue Spalte nicht in TypeScript sichtbar
```powershell
.\sync-schema.ps1
```
Restart VS Code / TypeScript Server

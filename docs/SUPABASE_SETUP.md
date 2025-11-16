# Philogic-Hub – Supabase Setup

## Philosophie: DB-Management

⚠️ **WICHTIG**: Philogic-Hub verwendet Prisma **NICHT für Migrations**!

- ✅ **Alle DB-Änderungen**: Direkt in Supabase mit SQL-Scripts
- ✅ **Prisma**: Nur als Type-Safe Query Layer
- ✅ **Schema-Sync**: `npx prisma db pull` um Prisma-Schema zu aktualisieren

## DATABASE_URL für .env

```bash
# PostgreSQL Connection String (Supabase)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**Port 6543** = Transaction Mode (für normale Queries, empfohlen)

## Setup-Schritte

### 1. SQL-Scripts in Supabase ausführen

Öffne **Supabase Dashboard → SQL Editor** und führe folgende Scripts aus:

```sql
-- 1) Agent-System (public schema)
-- Inhalt von: sql/01_agent_system.sql
-- Erstellt: agent, agent_log Tabellen

-- 2) Projekt-Management (public schema)  
-- Inhalt von: sql/02_project_management.sql
-- Erstellt: project, task Tabellen

-- 3) RLS für baucrm deaktivieren
-- Inhalt von: sql/03_disable_rls_baucrm.sql
-- Deaktiviert Row Level Security für Backend-Zugriff

-- 4) Dashboard-Views
-- Inhalt von: sql/04_dashboard_views.sql
-- Erstellt: dashboard_* Views für schnelle Queries
```

💡 **Tipp**: Scripts in richtiger Reihenfolge ausführen (01 → 04)

### 2. Prisma-Schema aktualisieren

Nach dem SQL-Ausführen in Supabase:

```powershell
# Schema aus Supabase importieren
npx prisma db pull

# Prisma Client generieren
npx prisma generate
```

### 3. Dev-Server starten

```powershell
.\dev.ps1
```

## Workflows

### Neue Tabelle in Supabase hinzufügen

```sql
-- 1) SQL in Supabase SQL Editor ausführen
create table baucrm.new_table (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- 2) RLS deaktivieren (für Backend-Zugriff)
alter table baucrm.new_table disable row level security;
```

```powershell
# 3) Prisma-Schema aktualisieren
npx prisma db pull

# 4) Client neu generieren
npx prisma generate
```

### Tabelle ändern

```sql
-- Spalte hinzufügen
alter table baucrm.company add column if not exists new_field text;

-- Index erstellen
create index if not exists company_new_field_idx on baucrm.company(new_field);
```

```powershell
# Schema aktualisieren
npx prisma db pull && npx prisma generate
```

## Schemas in Supabase

- **`public`** – Philogic-Hub eigene Tabellen (agent, project, task)
- **`baucrm`** – Bau-CRM Daten (bereits vorhanden)
- **`auth`** – Supabase Auth-System
- **`storage`** – Supabase File Storage

## Tools

### Prisma Studio (DB-Browser)

```powershell
npx prisma studio
```

Läuft auf: http://localhost:5555 (Read/Write auf DB)

### Supabase Dashboard

- **Table Editor**: Visuelle Tabellenansicht
- **SQL Editor**: SQL-Scripts ausführen
- **API Docs**: Auto-generierte REST/GraphQL Docs

## Troubleshooting

### Fehler: "prepared statement already exists"
→ **Transaction Mode** (Port 6543) verwenden

### Fehler: "relation does not exist"
→ Schema fehlt in Prisma: `npx prisma db pull` ausführen

### Fehler: "schema baucrm does not exist"
→ In Supabase SQL Editor erstellen:
```sql
create schema if not exists baucrm;
```

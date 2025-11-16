# SQL-Scripts für Supabase

Alle DB-Änderungen für Philogic-Hub werden als SQL-Scripts verwaltet und in **Supabase SQL Editor** ausgeführt.

## Ausführungsreihenfolge

1. **01_agent_system.sql** – Agent-Tabellen (public schema)
2. **02_project_management.sql** – Projekt/Task-Tabellen (public schema)
3. **03_disable_rls_baucrm.sql** – RLS für baucrm deaktivieren
4. **04_dashboard_views.sql** – Dashboard-Views erstellen

## Nach SQL-Änderungen

```powershell
# Prisma-Schema aktualisieren
npx prisma db pull

# Client neu generieren
npx prisma generate
```

## Neue Scripts hinzufügen

Benenne neue Scripts fortlaufend:

```
05_neue_feature.sql
06_weitere_tabellen.sql
```

**Format**:

```sql
-- ============================================
-- Philogic-Hub: Feature-Name
-- ============================================
-- Ausführen in: Supabase SQL Editor
-- Datum: YYYY-MM-DD
-- Zweck: Beschreibung

-- SQL Code hier...

-- Kommentare
comment on table xyz is 'Beschreibung';
```

## baucrm-Schema

Das **baucrm**-Schema wird **NICHT** hier verwaltet, da es bereits existiert. 

Änderungen am baucrm-Schema direkt in Supabase vornehmen und dokumentieren.

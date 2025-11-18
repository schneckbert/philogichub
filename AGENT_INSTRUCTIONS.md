# Philogic Hub – Agent Instructions (Frontend & API)

Diese Datei beschreibt, wie der AI-Agent (GitHub Copilot) im **Philogic-Hub** Projekt arbeiten soll.

WICHTIG: Philogic-Hub ist ein **eigenständiges Projekt** (Bau-CRM & Automation Platform) und darf nicht mit `philogicai` (lokale KI/Academy) vermischt werden.

## 1. Fokus & Scope

- **Projekt:** `philogichub` – Bau-CRM & Automation-Plattform mit Next.js 14, TypeScript, Prisma und Supabase.
- **Bereiche:**
  - Next.js App Router (`app/`)
  - API-Routen unter `app/api/**`
  - UI/Layouts/Components (`app/components`, `app/**/page.tsx`, `app/layout.tsx`)
  - Datenzugriff & Business-Logik (`lib/`, `prisma/`, `sql/`)
- **Kein Global-Refactor:** Änderungen immer fokussiert auf die konkrete Aufgabe, ohne unnötige Umbauten am Gesamtsystem.

## 2. Architektur – mentales Modell

- **Framework:** Next.js 14 (App Router) mit TypeScript.
- **Wichtige Pfade:**
  - `app/layout.tsx`: Root Layout (inkl. Sidebar/Navi).
  - `app/page.tsx`: Dashboard/Home.
  - `app/crm/*`: CRM-Views (Companies, Details, Contacts, Activities).
  - `app/opportunities/*`: Pipeline & Opportunity-Detail.
  - `app/analytics/*`: Analytics-Dashboards.
  - `app/agents/*`: Agenten-Management UI.
  - `app/settings/*`: Settings & System-Infos.
  - `app/api/**`: API-Routen für CRUD und Aggregationen.
  - `prisma/schema.prisma`: Datenmodell (Multi-Schema `public` + `baucrm`).
  - `sql/*.sql`: Setup-Scripts für Supabase.

- **Datenbank:** Supabase PostgreSQL, angebunden über Prisma Client.
- **Schemas:**
  - `baucrm`: fachliche CRM-Strukturen (Company, Contact, Opportunity, Activity, etc.).
  - `public`: Systemtabellen (Agent, AgentLog, ggf. weitere System-Entitäten).

## 3. API-Patterns & Backend im Hub

- **Standard-Routenmuster:**
  - `GET    /api/<resource>` – Liste (mit Query-Params für Filter/Suche).
  - `POST   /api/<resource>` – Create.
  - `GET    /api/<resource>/<id>` – Detail.
  - `PATCH  /api/<resource>/<id>` – Update.
  - `DELETE /api/<resource>/<id>` – Delete.
- **Spezialaktionen (Beispiele):**
  - `POST /api/agents/[id]/start` – Agent starten.
  - `POST /api/agents/[id]/stop` – Agent stoppen.

**Agent-Regel:**
- Neue API-Routen sollen sich an dieses Pattern anlehnen.
- Business-Logik eher in Hilfsfunktionen/Services kapseln (z.B. in `lib/`), nicht komplett im Route-Handler inline ausprogrammieren, wenn es umfangreicher wird.

## 4. UI/Frontend-Konventionen

- **App Router:**
  - Neue Seiten in `app/<bereich>/page.tsx` (oder verschachtelt) anlegen.
  - Gemeinsame UI-Elemente (z.B. Sidebar, Topbar, Layout-Raster) wiederverwenden und nicht duplizieren.
- **Design-System:**
  - Tailwind CSS einsetzen, Farben gemäß README/Design-System (`primary`, `success`, `warning`, `error`, Stage-Farben etc.).
  - Komponenten konsistent mit bestehenden Patterns gestalten (Buttons, Cards, Badges, Tabs, Tables etc.).
- **Datenfluss:**
  - Für einfache Seiten: server components/`fetch`/Prisma direkt im Server-Context nutzen.
  - Für interaktive Bereiche: Client Components und ggf. API-Routen für Mutationen.

**Agent-Regel:**
- Neues UI soll sich optisch und strukturell nahtlos einfügen (gleiche Abstände, Typografie, Farben, Interaktionsmuster).
- Keine eigenen CSS-Frameworks oder UI-Libraries zusätzlich einführen, ohne ausdrückliche Anforderung.

## 5. Prisma & Datenmodell – Umgangsregeln

- **Schema:** `prisma/schema.prisma` mit Multi-Schema Setup:
  - `datasource db` nutzt `schemas = ["public", "baucrm"]`.
  - Jedes Model hat explizites `@@schema("public")` oder `@@schema("baucrm")`.
- **Agent-Regel:**
  - Neue Tabellen/Models nur ergänzen, wenn fachlich wirklich notwendig – dann Schema-Trennlogik respektieren.
  - Bei Model-Änderungen immer Prisma-Client neu generieren (`npx prisma generate`).
  - SQL-Skripte (`sql/*.sql`) nur ergänzen/verändern, wenn die DB-Struktur sauber dokumentiert bleibt.

## 6. Supabase & ENV

- `.env` im Projekt:
  - `DATABASE_URL` (Supabase Connection String).
  - `NEXT_PUBLIC_BASE_URL` für Frontend-URLs.
- **Agent-Regel:**
  - Keine Secrets in Code commiten.
  - Neue env-Variablen, falls nötig, gut benannt und in README oder separater Env-Doku erwähnen.

## 7. Tests & Qualität

- Test-Setup: Jest/Testing Library (siehe `jest.config.js`, `jest.setup.js`, `jest.d.ts`).
- **Agent-Regel:**
  - Bei Änderungen an zentraler Logik (z.B. API-Routen, komplexen Helper-Funktionen) nach Möglichkeit passende Tests ergänzen.
  - Bereits existierende Test-Patterns übernehmen (z.B. Struktur, `describe`/`it`-Format, Mocks).

## 8. Agenten & Logging (Hub-spezifisch)

- **Agent-Entities:**
  - `Agent` und `AgentLog` im `public`-Schema.
  - UI unter `app/agents/*` und API-Routen unter `app/api/agents/**`.
- **Agent-Regel:**
  - Neue Funktionen rund um Agenten (Start/Stop, Status, Logs) sollen das bestehende Logging-Konzept respektieren (Level-Badges, Event-Tracking).
  - Keine parallele Agent- oder Log-Implementierung neben dem bestehenden Schema.

## 9. Arbeitsweise bei neuen Hub-Tasks

Wenn eine neue Aufgabe im Philogic-Hub ansteht, soll der Agent:

1. Relevanten Bereich identifizieren (z.B. `app/crm`, `app/opportunities`, `app/agents`, `app/api/companies` usw.).
2. Bestehende Seiten/API-Routen im selben Bereich kurz studieren und deren Pattern übernehmen.
3. Änderungen minimal-invasiv implementieren (kein großflächiger Umbau, wenn nicht gefordert).
4. Bei Datenzugriff Prisma-Patterns aus bestehenden Routen nutzen (inkl. Error-Handling, Typen).
5. Optional passende Tests ergänzen oder anpassen, wenn Logik komplexer ist.

## 10. Dinge, die vermieden werden sollen

- Keine Vermischung von `philogichub`-Code mit `philogicai` (Backend/Academy) – es sind zwei getrennte Systeme.
- Keine Einführung neuer State-Management-Lösungen (z.B. Redux, MobX), ohne dass das Projekt dies explizit erfordert.
- Keine Breaking Changes an API-Signaturen (z.B. Request/Response-Shape) ohne Anpassung der dazugehörigen Frontend-Views.
- Keine unkommentierten Änderungen an zentralen DB-Strukturen (Prisma-Models, SQL-Skripte), die bestehende Features beeinflussen könnten.

Diese Instructions dienen als Leitplanken, damit Änderungen im Philogic-Hub konsistent, stabil und im Sinne der bestehenden Architektur erfolgen.
# Rollen- und Berechtigungskonzept – PhilogicHub KI-Plattform

**Dokumentversion:** 1.0  
**Erstellt am:** 15.11.2025  
**Status:** Konzeptphase – Ready for Implementation

---

## 1. SYSTEMKONTEXT & ANNAHMEN

### 1.1 Technologie-Stack (IST-Zustand)

**Annahme:** Basierend auf Code-Analyse des `philogichub`-Repositories.

#### Frontend
- **Framework:** Next.js 15.x (App Router)
- **UI:** React 18+ mit TypeScript
- **Styling:** Tailwind CSS 3.x
- **State Management:** React Hooks (useState, useContext)

#### Backend
- **API:** Next.js API Routes (Edge-kompatibel)
- **ORM:** Prisma 5.x
- **Datenbank:** PostgreSQL (Supabase-hosted)
- **Auth (geplant):** NextAuth.js v5 mit Prisma-Adapter

#### KI-Services
- **PhilogicAI Server:** Flask 3.x + llama.cpp
- **Modell:** Qwen3-14B-Q5_K_M.gguf (lokal gehostet)
- **Inference:** CPU/GPU via llama.cpp-CLI
- **API:** REST mit Bearer-Token-Auth
- **Deployment:** Lokal + Cloudflare Tunnel (Production-Zugriff)

#### Automations-Stack
- **n8n:** Self-Hosted (Docker)
- **Integration:** REST/Webhook + JWT-basierte Authentifizierung

### 1.2 Geplante Erweiterungen

**Annahme:** Folgende Bausteine sind Zielbild des Systems:

- Zentrales Identity- & Rights-Layer (User, Rollen, Permissions)
- PhilogicAI-Academy als Wissens- und Trainingsplattform
- Gekoppeltes n8n (Workflows über das gleiche Identity-System)
- API-Key-Management-Layer (User-Keys, Limits, Auditing)

### 1.3 Unternehmenskontext

**Annahme:** Mittelständisches Unternehmen (10–50 Mitarbeiter), mehrere Teams:

- Rollen: Geschäftsführung, IT, Team-Leads, Mitarbeiter, externe Viewer
- Sicherheitsanforderungen: DSGVO, Least-Privilege, revisionssicheres Logging

---

## 2. ROLLEN- & NUTZERKONZEPT (RBAC + SCOPES)

### 2.1 Überblick RBAC

- **RBAC-Grundidee:**
  - User → hat 1..n Rollen
  - Rolle → bündelt Permissions (Scopes)
  - Permissions → feingranulare Rechte auf Ressourcen/Aktionen
- **Erweiterung:** Permissions sind als Strings im Format `resource:action:scope` definiert
  - Beispiel: `academy:content:approve`, `n8n:workflow:execute:team`, `apikey:self:create`.

### 2.2 Rollenübersicht

Mindestens fünf Kernrollen:

1. **Superadmin / Poweradmin** (du)
2. **Admin** (operativ)
3. **Domain-Owner / Team-Lead**
4. **Standard-User** (Mitarbeiter)
5. **Read-Only / Viewer**

Optional:
- **AI-Trainer** (spezialisierte Rolle, kann Academy-Trainingsdaten kuratieren)
- **Workflow-Manager** (spezialisierte Rolle für n8n-Workflows)

---

### 2.3 Rolle: Superadmin / Poweradmin

**Verantwortung:**
- Gesamtverantwortung für System, Sicherheit, Policies
- Letzte Instanz für Freigaben von kritischen Änderungen

**Erlaubte Aktionen (Auszug):**
- User-Management (inkl. Admins & Domain-Owner)
- Rollen & Permissions anlegen/ändern (außer Selbst-Löschung des Superadmin)
- System-Policies (Limits, Security-Settings) konfigurieren
- Vollzugriff auf PhilogicAI-Academy (alle Inhalte, Rollbacks, Training)
- Vollzugriff auf n8n (Workflows, globale Credentials, Settings)
- Vollzugriff auf API-Key-System (alle Keys, globale Limits)
- Vollständiger Zugriff auf Audit-Logs

**Explizit verboten (Guard-Rails):**
- ❌ Eigene Superadmin-Rolle entfernen
- ❌ Letzten Superadmin löschen (mindestens 1 Superadmin muss existieren)

**Typische Permissions:**
- `*` (Wildcard → Zugriff auf alle Scopes)
- Technisch trotzdem Guard-Rails auf DB-Ebene (z.B. `cannot_delete_superadmin`).

---

### 2.4 Rolle: Admin

**Verantwortung:**
- Operative Administration im Tagesgeschäft
- User- und Content-Verwaltung, aber keine System-Policies

**Erlaubt (Beispiele):**
- User anlegen/deaktivieren (nur Rollen ≤ Admin, keine Superadmins)
- Team/Rollen-Zuweisung für Standard-User & Domain-Owner
- Freigabe von Academy-Inhalten (Review-Queue)
- Verwaltung der meisten n8n-Workflows (nicht System-Workflows)
- Erstellen von API-Keys für andere User innerhalb Limits

**Verboten:**
- ❌ Systemweite Security-Policies ändern
- ❌ Globale n8n-Credentials ändern
- ❌ Superadmin-Rollen zuweisen oder entziehen
- ❌ Rollback von Academy-Inhalten (nur Superadmin)

**Beispiel-Scopes:**
- `user:manage:non_admin`
- `academy:content:approve`
- `n8n:workflow:manage`
- `apikey:other:create_with_default_limits`

---

### 2.5 Rolle: Domain-Owner / Team-Lead

**Verantwortung:**
- Fachliche Verantwortung für ein Team/Domain (z.B. "Sales", "Marketing")
- Koordination von Inhalten & Workflows im eigenen Bereich

**Erlaubt:**
- Team-Mitglieder im eigenen Bereich einsehen
- CRM-/Prozess-Daten im eigenen Bereich pflegen
- Academy-Inhalte im eigenen Bereich erstellen/vorschlagen
- n8n-Team-Workflows sehen und starten

**Verboten:**
- ❌ Systemweite Rollenänderungen
- ❌ Globale Konfigurationen
- ❌ Freigabe kritischer System-Workflows

**Beispiel-Scopes:**
- `team:member:read:self_domain`
- `academy:content:create:self_domain`
- `n8n:workflow:execute:self_domain`

---

### 2.6 Rolle: Standard-User

**Verantwortung:**
- Normale Nutzung der Plattform (Chat, CRM, Academy-Konsum, einfache Workflows)

**Erlaubt:**
- Eigene Daten bearbeiten (Profil, eigene Aufgaben)
- PhilogicAI-Chat nutzen (innerhalb Limits)
- Academy-Inhalte lesen
- Vorschläge/Drafts für Academy-Inhalte erstellen
- Eigene n8n-Workflows (persönlicher Scope) erstellen & ausführen (limitierte Anzahl)

**Verboten:**
- ❌ Andere User bearbeiten
- ❌ Globale Änderungen (Academy, n8n, API-Keys anderer)

**Beispiel-Scopes:**
- `profile:write:self`
- `academy:content:draft_create`
- `n8n:workflow:create:self`
- `apikey:self:manage`

---

### 2.7 Rolle: Read-Only / Viewer

**Verantwortung:**
- Audit/Reporting, passiver Zugang (z.B. Externe, Praktikanten)

**Erlaubt:**
- Lesen von freigegebenen Daten (CRM, Academy, bestimmte Dashboards)

**Verboten:**
- ❌ Alle Schreiboperationen
- ❌ Workflow-Ausführung
- ❌ API-Key-Erstellung

**Beispiel-Scopes:**
- `crm:read:reporting`
- `academy:content:read`

---

### 2.8 Hinweis: RBAC + permission strings

Ein Permission-Check könnte z.B. so aussehen:

```ts
function hasPermission(userPermissions: string[], required: string): boolean {
  if (userPermissions.includes('*')) return true;           // Superadmin
  if (userPermissions.includes(required)) return true;      // exakte Übereinstimmung

  // Wildcard-Unterstützung: z.B. "academy:content:*" deckt "academy:content:approve" ab
  const [res, act, scope] = required.split(':');

  return (
    userPermissions.includes(`${res}:${act}:*`) ||
    userPermissions.includes(`${res}:*:${scope}`) ||
    userPermissions.includes(`${res}:*:*`)
  );
}
```

---

## 3. SICHERER LERN- & FEEDBACK-MECHANISMUS DER KI

### 3.1 Trennung lernbarer / nicht-lernbarer Inhalte

**Nicht lernbar (immer tabu):**
- Systemkonfiguration (Env-Variablen, Secrets)
- Auth-/Security-Logik
- Internes Rollenmodell (konkrete Zuordnungen)
- Roh-Logs aus n8n, Datenbank-Dumps

**Lernbar (nach Freigabe):**
- FAQ-Antworten
- Prozesse und Playbooks (Sales, Marketing, Operations)
- Produktwissen
- Best-Practice-Beispiele

### 3.2 Datenfluss für Learning

1. User interagiert mit PhilogicAI (Chat, Academy, Workflows)
2. User markiert eine Antwort als "gut" und wählt "Als Wissen vorschlagen"
3. System erstellt einen **Draft-Eintrag** in `knowledge_contributions`
4. Automatischer Pre-Check filtert sensible Inhalte (Regex, Heuristik)
5. Beiträge landen in einer **Review-Queue** für Admin/AI-Trainer
6. Nach Freigabe wandert der Beitrag in `academy_content` (Version X)
7. Embeddings werden generiert und in einen Vektor-Index geschrieben
8. RAG-Pipeline nutzt nur genehmigte Inhalte

### 3.3 Review-Queue & Versionierung

**Tabellen (vereinfacht als SQL/Pseudo):**

```sql
CREATE TABLE knowledge_contributions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  source ENUM('chat', 'manual', 'import'),
  raw_text TEXT NOT NULL,
  category TEXT,            -- faq, process, product, ...
  risk_score INT,           -- 1 (low) – 5 (high)
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_comment TEXT
);

CREATE TABLE academy_content (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  current_version INT DEFAULT 1,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE academy_content_version (
  content_id UUID REFERENCES academy_content(id) ON DELETE CASCADE,
  version INT NOT NULL,
  markdown TEXT NOT NULL,
  embedding VECTOR(1536),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (content_id, version)
);
```

**Rollback-Strategie:**
- Jede Änderung erzeugt eine neue Version in `academy_content_version`
- `academy_content.current_version` zeigt immer auf die aktive Version
- Rollback = Erstellen einer neuen Version, die Inhalt einer älteren Version kopiert
- Rollback-Recht nur für Superadmin

### 3.4 Protecting Core Functions

- System-Prompts (Guard-Rails) sind **im Code** definiert, nicht in der DB
- KI sieht nur freigegebene, gefilterte Inhalte (nie rohe Logs, nie Konfigs)
- Kritische Aktionen (z.B. n8n-Workflow-Änderungen, API-Key-Änderungen) werden **nicht** von der KI direkt gesteuert, sondern höchstens vorgeschlagen und von einem User bestätigt (4-Augen-Prinzip möglich).

---

## 4. PHILOGICAI-ACADEMY – RECHTE- & INTEGRATIONSKONZEPT

### 4.1 Wer darf was?

#### Superadmin
- Vollzugriff auf alle Inhalte (lesen, schreiben, löschen, rollback)
- Kann Kategorien, Tags und Strukturen definieren
- Kann Trainingspipelines starten/stoppen

#### Admin
- Kann Inhalte anlegen, bearbeiten, freigeben, archivieren
- Kann Bewertungen/Feedback einsehen
- Kann keine Rollbacks durchführen, keine System-Prompts ändern

#### Domain-Owner / Team-Lead
- Kann Inhalte im eigenen Fachbereich erstellen
- Kann Drafts des eigenen Teams moderieren (wenn konfiguriert)
- Kann Inhalte als "Domain-Standard" markieren (z.B. Sales-Playbook)

#### Standard-User
- Kann alle publizierten Inhalte lesen
- Kann eigene Drafts erstellen und zur Review einreichen
- Kann Feedback (Up/Downvote, Kommentar) geben

#### Read-Only
- Kann publizierte Inhalte lesen
- Kein Feedback, keine Drafts

### 4.2 Konfigurierbare Modi pro Rolle (superadmin-gesteuert)

Auf Superadmin-Ebene definierbar, z.B.:

- **Standard-User**:
  - `academy_mode = "draft-only"` → Nur Vorschläge, keine direkten Publikationen
- **Domain-Owner**:
  - `academy_mode = "draft+domain-publish"` → Darf im eigenen Bereich Inhalte direkt publizieren (optional)
- **Admin**:
  - `academy_mode = "full"` → Darf global publizieren

In einer Konfigurationstabelle:

```sql
CREATE TABLE academy_role_config (
  role TEXT PRIMARY KEY,
  can_create_drafts BOOLEAN,
  can_publish_global BOOLEAN,
  can_publish_domain BOOLEAN,
  can_approve BOOLEAN,
  can_rollback BOOLEAN
);
```

### 4.3 Schutzmechanismen

- Jeder veröffentlichte Inhalt hat klaren Owner (`created_by`)
- Jeder Statuswechsel (draft → published) schreibt ins `audit_log`
- Bulk-Operationen (z.B. ganze Kategorie archivieren) nur für Superadmin
- Spezielle "System-Artikel" (z.B. Sicherheitsrichtlinien) sind als `is_protected = true` markiert und nur vom Superadmin editierbar

---

## 5. N8N-RECHTESYSTEM & INTEGRATION

### 5.1 Single Identity / Role-Mapping

**Annahme:** n8n hat eine eigene User-Tabelle, wird aber an das zentrale Identity-System gemappt.

- PhilogicHub-User authentifizieren sich via NextAuth.js
- Für n8n wird ein signierter JWT mit Rollen-Claim erzeugt
- n8n nutzt eine Custom-Auth-Middleware, die diesen JWT prüft und Rollen/Permissions ableitet

Beispiel: Claim-Struktur

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "admin",          
  "permissions": [
    "n8n:workflow:read",
    "n8n:workflow:execute",
    "n8n:workflow:manage:team"
  ],
  "exp": 1731620000
}
```

### 5.2 n8n-Rollen pro Plattform-Rolle

- Superadmin → n8n-Owner
- Admin → n8n-Admin
- Domain-Owner → n8n-Member (mit Team-Scope)
- Standard-User → n8n-Member (nur eigene Workflows)
- Read-Only → Custom-Viewer (nur Dashboard/Execution-Ansicht)

### 5.3 Welche Aktionen sind erlaubt?

**Workflows ansehen:**
- Superadmin/Admin: alle
- Domain-Owner: Workflows, die auf die eigene Domain getaggt sind
- Standard-User: eigene Workflows + explizit freigegebene Team-Workflows
- Viewer: read-only Dashboards

**Workflows ausführen:**
- Superadmin/Admin: alle nicht-gesperrten Workflows
- Domain-Owner: Domain-Workflows
- Standard-User: eigene + freigegebene
- Viewer: keine

**Workflows erstellen/ändern:**
- Superadmin: alle (inkl. System-Workflows)
- Admin: normale Workflows (keine System-Workflows)
- Domain-Owner: Domain-Workflows (z.B. "Sales-Lead-Scoring")
- Standard-User: persönliche Workflows (beschränkt)
- Viewer: keine

**Kritische Ressourcen (APIs, Datenbanken):**
- Nur Superadmin/Admin können globale Credentials erstellen
- Domain-Owner können Team-Credentials verwenden, nicht anlegen
- Standard-User verwenden nur vordefinierte Credentials

### 5.4 RBAC-Bridge (JWT-Claims → n8n)

- PhilogicHub erzeugt JWT für n8n mit `role` + `permissions`
- n8n-Middleware validiert JWT und setzt `req.user`
- n8n-Routen prüfen `req.user.permissions` vor kritischen Operationen

---

## 6. API-KEY-HANDLING & LIMITS

### 6.1 Anforderungen

- Keys nur serverseitig speichern, immer verschlüsselt
- Keine Klartext-Ansicht nach Erstellung
- Pro User / Rolle Limits (Requests, Tokens, Kosten)
- Superadmin kann organisationweite Policies setzen

### 6.2 Grundregeln

- API-Keys werden in `api_keys` gespeichert mit:
  - `key_encrypted` (AES-256-GCM o.Ä.)
  - `key_preview` (z.B. `sk-xxx...abcd`)
  - `key_hash` (SHA-256 zur Duplikat-Erkennung)
- Nur der Service darf entschlüsseln (z.B. in einem isolierten Service-Layer)
- Key-Export ist grundsätzlich verboten

### 6.3 Limits pro Rolle

**Beispiele:**

- Superadmin:
  - Kann globale Limits WIRKLICH hochsetzen
- Admin:
  - Darf anderen Usern Keys anlegen, aber nur innerhalb von vordefinierten Grenzen
- Standard-User:
  - z.B. 60 Requests/Minute, 100k Tokens/Tag
- Domain-Owner:
  - z.B. 120 Requests/Minute, 250k Tokens/Tag

Technisch durchsetzbar über eine Rate-Limit- & Quota-Tabelle plus Middleware.

---

## 7. SICHERHEITSARCHITEKTUR & "UNKAPUTTBARKEIT"

### 7.1 Trennung von Konfiguration & Ausführung

- Konfiguration (Rollenmodell, Limits, System-Prompts) liegt in:
  - Code (für System-Prompts, Guard-Rails)
  - Migrationsgesicherter DB-Schema (für Rollen/Permissions)
- Ausführung (Workflows, KI-Abfragen) läuft auf diesen festen Regeln
- Änderungen an Konfiguration erfolgen nur über Admin-UI mit strengen Checks + Audit-Log

### 7.2 Guard-Rails

- Nicht löschbare System-Rollen: `superadmin`, `admin`, `standard_user`, `read_only`
- Nicht löschbarer erster Superadmin-User (oder mindestens 1 Superadmin verpflichtend)
- Kein UI-Pfad, der den letzten Superadmin löschen lässt (Validation im Backend)
- System-Prompts nur per Code-Änderung modifizierbar (Pull Request + Code-Review)

### 7.3 Backup & Versionierung

- Regelmäßige Backups der Postgres-DB (mindestens täglich)
- Versionierung von:
  - Rollenmodell (Tabellen `roles`, `role_permissions` mit Audit-Log)
  - Academy-Inhalten (Versionstabellen)
  - n8n-Workflows (Export als JSON + Git-Backup möglich)
- Rollback-Funktionen für:
  - Rollen-Permissions (z.B. Snapshot-Table `roles_snapshot`)
  - Academy-Artikel

### 7.4 Logging & Auditing

Alles Relevante wird in `audit_logs` erfasst, z.B.:

- Login/Logout-Events
- Rollenänderungen
- Freigaben/Ablehnungen in der Academy
- Erstellen/Ändern/Löschen von n8n-Workflows
- Anlegen/Löschen von API-Keys
- Überschreiten von Limits (Rate-Limits, Kosten-Budget)

Logfelder:

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Superadmin hat eine UI, um nach User, Zeitraum, Aktion zu filtern.

---

## 8. DATENMODELL & TECHNISCHE UMSETZUNGSSKIZZE

### 8.1 Kern-Tabellen (vereinfacht)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      String   // "superadmin", "admin", "domain_owner", "standard_user", "read_only"
  // Optional: Many-to-many Rollen (wenn du flexibelere Kombinationen willst)
  // roles   UserRole[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  isSystem    Boolean  @default(false) // true = nicht löschbar

  permissions RolePermission[]
}

model Permission {
  id          String   @id @default(cuid())
  key         String   @unique  // z.B. "academy:content:approve"
  description String?
}

model RolePermission {
  roleId       String
  permissionId String

  role         Role       @relation(fields: [roleId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])

  @@id([roleId, permissionId])
}

model ApiKey {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String

  name      String
  provider  String

  keyEncrypted String
  keyHash      String @unique
  keyPreview   String

  rateLimitRequestsPerMinute Int    @default(60)
  rateLimitTokensPerDay      Int    @default(100000)
  monthlyCostLimitUsd        Float  @default(100.0)

  totalRequests Int    @default(0)
  totalTokens   Int    @default(0)
  totalCostUsd  Float  @default(0)

  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  lastUsedAt DateTime?
}

model AuditLog {
  id           String   @id @default(cuid())
  user         User?    @relation(fields: [userId], references: [id])
  userId       String?
  action       String
  resourceType String
  resourceId   String?
  metadata     Json?
  createdAt    DateTime @default(now())
}

model AcademyContent {
  id             String   @id @default(cuid())
  slug           String   @unique
  title          String
  category       String
  status         String   // draft, pending_review, published, archived
  currentVersion Int      @default(1)

  createdBy      String
  createdAt      DateTime @default(now())
}

model AcademyContentVersion {
  id         String   @id @default(cuid())
  contentId  String
  content    AcademyContent @relation(fields: [contentId], references: [id])

  version    Int
  markdown   String
  embedding  Bytes?

  createdBy  String
  createdAt  DateTime @default(now())

  @@unique([contentId, version])
}
```

---

## 9. DEVELOPER- & ADMIN-UX (Zentrales Admin-UI)

### 9.1 Zentrales Dashboard

Der Superadmin sieht ein Dashboard mit folgenden Bereichen:

1. **Rollen & Rechte**
   - Tabelle: Rollen
   - Detail: zugeordnete Permissions
   - Actions: neue Rolle anlegen (nicht für Systemrollen), Permissions zuweisen

2. **PhilogicAI-Academy**
   - Review-Queue (pending Beiträge)
   - Statistik (Anzahl Drafts, Published etc.)
   - Rolle-zu-Academy-Rechten (Matrix)

3. **n8n-Integration**
   - Liste aller Workflows mit Tagging (system, domain, personal)
   - Anzeige, welche Rolle was darf (Read/Edit/Execute)
   - Verlinkung/Deep-Link in die n8n-UI

4. **API-Keys & Limits**
   - Liste aller API-Keys (Key-Preview, Nutzer, Provider, Usage)
   - Globale Default-Limits pro Rolle (Konfigurationsseite)
   - Alerts bei Budget-Überschreitungen

5. **Audit-Logs**
   - Filter nach Zeitraum, User, Resource-Type, Action
   - Export-Möglichkeit (z.B. CSV) für Revision

### 9.2 Trennung Lesen/Schreiben in der UI

- Jeder Bereich im Admin-UI ist klar getrennt in:
  - Übersicht/Reporting (read-only)
  - Konfiguration/Änderung (nur für berechtigte Rollen)

Beispiel im Frontend:

```tsx
function RoleDetail({ role }: { role: Role }) {
  const { canEditRoles } = usePermission('role:manage');

  return (
    <div>
      <h2>{role.name}</h2>
      <PermissionList permissions={role.permissions} />
      {canEditRoles && <EditRoleForm role={role} />}
    </div>
  );
}
```

---

## 10. SCHRITT-FÜR-SCHRITT-ROADMAP (10–15 SCHRITTE)

1. **Rollenmodell festziehen**
   - Namen & Semantik der Rollen final definieren
   - Liste aller Permissions (Scopes) erstellen

2. **DB-Schema erweitern**
   - Prisma-Models `User`, `Role`, `Permission`, `RolePermission`, `ApiKey`, `AuditLog`, `AcademyContent` etc. anlegen
   - Migration fahren

3. **Auth-Layer implementieren (NextAuth.js)**
   - NextAuth mit Prisma-Adapter aufsetzen
   - Session-Callback erweitern (`session.user.role`, `session.user.permissions`)

4. **RBAC-Middleware bauen**
   - Helper `hasPermission(user, permission)`
   - Reusable `requirePermission('scope')` für API-Routen und Server Actions

5. **Basales Admin-UI bauen**
   - Seiten für Rollen & Rechte
   - Seite für User-Übersicht mit Rollen-Zuweisung

6. **PhilogicAI-Academy-Tabellen & API**
   - `academy_content`, `academy_content_version`, `knowledge_contributions` umsetzen
   - API-Routen für Create/Draft/Review/Publish

7. **Academy-UI & Review-Workflow**
   - Editor für Inhalte
   - Review-Queue für Admins
   - Version-History + optionaler Rollback für Superadmin

8. **n8n-Integration**
   - JWT-Erzeugung für n8n (RBAC-Bridge)
   - n8n-Middleware, die JWT prüft und Permissions erzwingt
   - Admin-UI für Workflows (Links, Filter, minimale Steuerung)

9. **API-Key-Handling**
   - `api_keys`-Modell, Encryption-Layer, CRUD-APIs
   - UI zum Anlegen/Verwalten eigener Keys
   - Superadmin-UI für globale Limits & Übersicht

10. **Rate-Limits & Quotas**
    - Middleware vor sensiblen AI-Calls
    - Tabellen für Usage & Limits
    - Fehlercodes (429) & Retry-After-Header implementieren

11. **Audit-Logging**
    - `audit_logs`-Tabelle befüllen bei: Rollenänderungen, API-Key-Events, Academy-Freigaben, n8n-Workflow-Änderungen
    - Admin-UI zur Auswertung

12. **Sicherheits-GUARD-Rails hart kodieren**
    - Schutz vor: letztem Superadmin löschen, System-Prompts editieren, etc.
    - Tests dafür schreiben

13. **Tests & QA**
    - Unit-Tests für RBAC-Check-Funktionen
    - Integrationstests für Academy-Workflows
    - Sicherheits-Tests (z.B. Versuch, ohne Permission etwas Kritisches zu tun)

14. **Dokumentation schreiben**
    - Kurz-Doku für Admins (Wie verwalte ich Rollen, Keys etc.)
    - Onboarding-Guide für neue Standard-User

15. **Iterative Erweiterung**
    - Spezialrollen (AI-Trainer, Workflow-Manager) scharf schalten
    - Multi-Tenancy-Fähigkeit bei Bedarf hinzufügen (Mandant = weitere Dimension in den Tabellen).

---

Damit hast du ein vollständiges, technisch umsetzbares Rollen- und Berechtigungskonzept, das sich direkt in deinem bestehenden Stack (Next.js + Prisma + PostgreSQL + PhilogicAI + n8n) implementieren lässt – mit klaren Guard-Rails, einem sicheren Lern-Workflow für die KI und einem zentralen Superadmin-Kontrollpunkt.

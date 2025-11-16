# Philogic-Hub Architecture

## Vision: "Mein eigenes Zoho One"

Philogic-Hub wird zur All-in-One-Plattform für Firmenverwaltung – ähnlich wie Zoho One, aber maßgeschneidert für deine Bedürfnisse und vollständig unter deiner Kontrolle.

## Modul-Struktur (v1 Roadmap)

### 1. CRM (Customer Relationship Management)
- **Companies**: Firmenverwaltung mit Details, Notizen, Historie
- **Contacts**: Kontakte mit Zuordnung zu Companies
- **Deals/Opportunities**: Sales-Pipeline, Stages, Werte
- **Activities**: Calls, Meetings, E-Mails mit Timeline
- **Tags**: Flexible Kategorisierung

### 2. Projekt-Management
- **Projects**: Projektübersicht mit Status, Deadlines, Team
- **Tasks**: Aufgaben mit Subtasks, Assignees, Priorities
- **Kanban-Board**: Drag & Drop für Task-Management
- **Timeline/Gantt**: Zeitplanung und Abhängigkeiten
- **Time Tracking**: Zeiterfassung pro Task

### 3. Finanzen (später)
- **Invoices**: Rechnungserstellung
- **Expenses**: Ausgabenverwaltung
- **Reports**: Finanz-KPIs und Forecasts

### 4. Analytics & Reporting
- **Dashboards**: Custom Widgets für KPIs
- **Reports**: Filterable Listen und Charts
- **Data Explorer**: Freie Queries auf Entities

### 5. Automation & Agenten
- **Workflows**: Trigger-basierte Automationen
- **Agents**: Langfristig laufende Prozesse
- **Integrations**: Anbindung an bestehende Systeme (Postgres, APIs)

### 6. Settings & Admin
- **User Management**: Accounts, Rollen, Permissions
- **System Settings**: Konfiguration, Branding
- **Data Import/Export**: CSV, Excel, JSON

## Tech-Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React + Tailwind CSS
- **State Management**: React Context / Zustand (falls nötig)
- **Forms**: React Hook Form + Zod für Validation
- **Charts**: Recharts oder Chart.js

### Backend
- **API**: Next.js API Routes (später evtl. separates Backend)
- **ORM**: Prisma
- **Database**: PostgreSQL (deine bestehenden Instanzen nutzen)
- **Auth**: NextAuth.js oder eigene JWT-Lösung

### Deployment
- **Hosting**: Vercel (Frontend + API Routes)
- **Database**: Deine bestehenden Postgres-URIs (z. B. `postgres-local-harf` für Dev)

## Datenmodell v1 (Core Entities)

```prisma
model Company {
  id          String   @id @default(cuid())
  name        String
  website     String?
  industry    String?
  contacts    Contact[]
  projects    Project[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Contact {
  id          String   @id @default(cuid())
  firstName   String
  lastName    String
  email       String   @unique
  phone       String?
  position    String?
  companyId   String?
  company     Company? @relation(fields: [companyId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  status      String   // "active", "completed", "archived"
  startDate   DateTime?
  endDate     DateTime?
  companyId   String?
  company     Company? @relation(fields: [companyId], references: [id])
  tasks       Task[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Task {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      String   // "todo", "in_progress", "done"
  priority    String   // "low", "medium", "high"
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Agent {
  id          String   @id @default(cuid())
  name        String
  type        String   // "workflow", "scraper", "reporter"
  status      String   // "idle", "running", "stopped"
  config      Json     // flexible config per agent
  lastRun     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Navigation & UI-Flow

### Haupt-Navigation (Sidebar)
1. **Dashboard** (Home)
2. **CRM**
   - Companies
   - Contacts
   - Deals
3. **Projekte**
   - Projects
   - Tasks (Kanban)
4. **Analytics**
   - Reports
   - Data Explorer
5. **Agenten**
   - Overview
   - Logs
6. **Settings**
   - Profile
   - System

### Dashboard-Widgets (Home)
- **Neueste Aktivitäten** (z. B. neue Contacts, Tasks)
- **Anstehende Tasks** (nach Deadline)
- **Sales-Pipeline** (Deals by Stage)
- **Agent-Status** (Running/Idle)
- **Quick Actions**: "Neuer Contact", "Neues Projekt", "Agent starten"

## Phasen-Plan

### Phase 1: Fundament (aktuell)
- ✅ Next.js-Setup, Tailwind, Landing
- ✅ README, Agent Instructions
- 🔄 Prisma + Postgres Setup
- 🔄 Basis-Layout mit Sidebar
- 🔄 Erste API Routes (CRUD für Companies)

### Phase 2: CRM-Modul
- Companies-Liste + Detail-View
- Contacts-Liste + Detail-View
- Create/Edit-Formulare
- Search & Filter

### Phase 3: Projekt-Modul
- Projects-Liste + Detail-View
- Tasks mit Kanban-Board
- Create/Edit-Formulare

### Phase 4: Dashboard & Analytics
- Widgets für KPIs
- Reports (Charts, Listen)

### Phase 5: Agenten & Automation
- Agent-Definition und -Start
- Workflow-Engine
- Logs & Monitoring

### Phase 6: Auth & Multi-User
- Login/Registrierung
- Rollen & Permissions

-- ============================================
-- Philogic-Hub: Projekt-Management (public schema)
-- ============================================
-- Ausführen in: Supabase SQL Editor
-- Datum: 2025-11-15
-- Zweck: Interne Projekt- und Task-Verwaltung (nicht baucrm!)

-- 1) Projects
create table if not exists public.project (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  description       text,
  status            text not null default 'active', -- 'active', 'completed', 'on_hold', 'archived'
  priority          text not null default 'medium', -- 'low', 'medium', 'high'
  start_date        date,
  end_date          date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists project_status_idx on public.project(status);

-- 2) Tasks
create table if not exists public.task (
  id                uuid primary key default gen_random_uuid(),
  project_id        uuid not null references public.project(id) on delete cascade,
  title             text not null,
  description       text,
  status            text not null default 'todo', -- 'todo', 'in_progress', 'review', 'done'
  priority          text not null default 'medium', -- 'low', 'medium', 'high', 'urgent'
  due_date          date,
  completed_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists task_project_id_idx on public.task(project_id);
create index if not exists task_status_idx on public.task(status);

-- 3) Updated-At Triggers
create trigger project_updated_at
  before update on public.project
  for each row
  execute function public.update_updated_at_column();

create trigger task_updated_at
  before update on public.task
  for each row
  execute function public.update_updated_at_column();

-- 4) RLS deaktivieren
alter table public.project disable row level security;
alter table public.task disable row level security;

-- 5) Kommentare
comment on table public.project is 'Philogic-Hub: Interne Projekte (nicht baucrm!)';
comment on table public.task is 'Philogic-Hub: Tasks für interne Projekte';

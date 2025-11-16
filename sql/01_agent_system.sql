-- ============================================
-- Philogic-Hub: Agent-System (public schema)
-- ============================================
-- Ausführen in: Supabase SQL Editor
-- Datum: 2025-11-15
-- Zweck: Agent-Orchestrierung für Automations

-- 1) Agent-Tabelle
create table if not exists public.agent (
  id                uuid primary key default gen_random_uuid(),
  name              text unique not null,
  type              text not null, -- 'workflow', 'scraper', 'reporter', 'monitor'
  status            text not null default 'idle', -- 'idle', 'running', 'stopped', 'error'
  description       text,
  config            jsonb not null, -- z.B. { "interval": "1h", "target": "postgres-harf" }
  last_run          timestamptz,
  last_error        text,
  run_count         integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Index für häufige Queries
create index if not exists agent_status_idx on public.agent(status);
create index if not exists agent_type_idx on public.agent(type);

-- 2) Agent-Log-Tabelle
create table if not exists public.agent_log (
  id                uuid primary key default gen_random_uuid(),
  agent_id          uuid not null references public.agent(id) on delete cascade,
  level             text not null, -- 'info', 'warning', 'error', 'success'
  message           text not null,
  data              jsonb, -- Optional structured data
  created_at        timestamptz not null default now()
);

-- Indizes für Log-Queries
create index if not exists agent_log_agent_id_idx on public.agent_log(agent_id);
create index if not exists agent_log_level_idx on public.agent_log(level);
create index if not exists agent_log_created_at_idx on public.agent_log(created_at desc);

-- 3) Updated-At Trigger für Agent
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger agent_updated_at
  before update on public.agent
  for each row
  execute function public.update_updated_at_column();

-- 4) RLS deaktivieren (Backend-App hat direkten Zugriff)
alter table public.agent disable row level security;
alter table public.agent_log disable row level security;

-- 5) Kommentare
comment on table public.agent is 'Philogic-Hub: Agent-Definitionen für Automations';
comment on table public.agent_log is 'Philogic-Hub: Execution Logs für Agents';
comment on column public.agent.config is 'JSON config per agent: interval, target, params';
comment on column public.agent.status is 'Current agent state: idle|running|stopped|error';

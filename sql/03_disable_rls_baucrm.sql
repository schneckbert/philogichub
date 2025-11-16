-- ============================================
-- Philogic-Hub: RLS für baucrm deaktivieren
-- ============================================
-- Ausführen in: Supabase SQL Editor
-- Datum: 2025-11-15
-- Zweck: Backend-App (Philogic-Hub) braucht direkten Zugriff auf baucrm-Tabellen

-- Row Level Security für alle baucrm-Tabellen deaktivieren
alter table baucrm.wz_code disable row level security;
alter table baucrm.company disable row level security;
alter table baucrm.company_location disable row level security;
alter table baucrm.trade disable row level security;
alter table baucrm.company_trade disable row level security;
alter table baucrm.contact disable row level security;
alter table baucrm.opportunity disable row level security;
alter table baucrm.activity disable row level security;
alter table baucrm.company_tech_profile disable row level security;

-- Kommentar
comment on schema baucrm is 'Bau-CRM Schema - RLS disabled for backend access';

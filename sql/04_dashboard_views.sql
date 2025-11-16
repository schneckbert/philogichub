-- ============================================
-- Philogic-Hub: Dashboard & Analytics Views
-- ============================================
-- Ausführen in: Supabase SQL Editor
-- Datum: 2025-11-15
-- Zweck: Views für schnelle Dashboard-Queries

-- 1) Company Stats (für Dashboard-Widget)
create or replace view public.dashboard_company_stats as
select
  count(*) as total_companies,
  count(*) filter (where status_sales = 'customer') as total_customers,
  count(*) filter (where status_sales = 'prospect') as total_prospects,
  count(*) filter (where created_at >= now() - interval '30 days') as new_this_month,
  count(*) filter (where tier = 'A') as tier_a_companies,
  count(*) filter (where tier = 'B') as tier_b_companies
from baucrm.company;

-- 2) Opportunity Pipeline (für Dashboard)
create or replace view public.dashboard_opportunity_pipeline as
select
  stage,
  count(*) as count,
  sum(estimated_value) as total_value,
  avg(probability) as avg_probability
from baucrm.opportunity
where stage not in ('won', 'lost')
group by stage
order by 
  case stage
    when 'new' then 1
    when 'qualified' then 2
    when 'proposal' then 3
    when 'negotiation' then 4
    else 5
  end;

-- 3) Recent Activities (für Dashboard-Timeline)
create or replace view public.dashboard_recent_activities as
select
  a.id,
  a.activity_type,
  a.activity_datetime,
  a.subject,
  a.outcome,
  c.name_legal as company_name,
  c.name_brand as company_brand,
  con.first_name || ' ' || con.last_name as contact_name
from baucrm.activity a
join baucrm.company c on a.company_id = c.id
left join baucrm.contact con on a.contact_id = con.id
order by a.activity_datetime desc
limit 50;

-- 4) Top Companies by Opportunity Value
create or replace view public.dashboard_top_companies as
select
  c.id,
  c.name_legal,
  c.name_brand,
  c.tier,
  count(o.id) as opportunity_count,
  sum(o.estimated_value) as total_pipeline_value
from baucrm.company c
left join baucrm.opportunity o on c.id = o.company_id and o.stage not in ('won', 'lost')
group by c.id, c.name_legal, c.name_brand, c.tier
having count(o.id) > 0
order by total_pipeline_value desc nulls last
limit 20;

-- 5) Kommentare
comment on view public.dashboard_company_stats is 'Philogic-Hub: Company KPIs für Dashboard';
comment on view public.dashboard_opportunity_pipeline is 'Philogic-Hub: Opportunity Pipeline Übersicht';
comment on view public.dashboard_recent_activities is 'Philogic-Hub: Letzte 50 Activities';
comment on view public.dashboard_top_companies is 'Philogic-Hub: Top 20 Companies by Pipeline Value';

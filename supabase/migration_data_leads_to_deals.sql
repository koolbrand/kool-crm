-- 1. Add lead_id to deals to link to existing leads (if not linked to a profile)
alter table public.deals add column lead_id uuid references public.leads(id);
create index deals_lead_id_idx on public.deals(lead_id);

-- 2. Migrate existing leads to deals
-- We join with profiles to get the correct tenant_id for the deal owner
insert into public.deals (tenant_id, title, value, stage, lead_id, created_at, updated_at)
select 
  p.tenant_id,
  coalesce(l.company, l.name) || ' Deal' as title,
  coalesce(l.value, 0) as value,
  case 
    when l.status = 'new' then 'qualification'
    when l.status = 'contacted' then 'qualification'
    when l.status = 'qualified' then 'proposal'
    when l.status = 'proposal' then 'proposal'
    when l.status = 'won' then 'won'
    when l.status = 'lost' then 'lost'
    else 'qualification'
  end as stage,
  l.id as lead_id,
  l.created_at,
  l.updated_at
from public.leads l
join public.profiles p on p.id = l.user_id
where p.tenant_id is not null;

-- Optional: Mark migrated leads somehow? 
-- For now we leave them as is.

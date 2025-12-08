-- Create activities table
create table public.activities (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid references public.tenants(id) not null,
    lead_id uuid references public.leads(id) on delete cascade not null,
    user_id uuid references auth.users(id) not null,
    type text check (type in ('note', 'call', 'email', 'meeting', 'status_change')) default 'note',
    content text,
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.activities enable row level security;

-- Policies
create policy "Users can view activities in their tenant"
  on public.activities for select
  using (
    tenant_id in (
      select tenant_id from public.profiles where id = auth.uid()
    )
  );

create policy "Users can insert activities in their tenant"
  on public.activities for insert
  with check (
    tenant_id in (
      select tenant_id from public.profiles where id = auth.uid()
    )
  );

-- Indexes
create index activities_lead_id_idx on public.activities(lead_id);
create index activities_tenant_id_idx on public.activities(tenant_id);

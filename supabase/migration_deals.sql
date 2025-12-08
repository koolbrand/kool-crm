-- Create deals table
create table public.deals (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid references public.tenants(id) not null,
    title text not null,
    value numeric default 0,
    currency text default 'USD',
    stage text check (stage in ('qualification', 'proposal', 'negotiation', 'won', 'lost')) default 'qualification',
    active boolean default true,
    close_date date,
    
    -- Foreign keys to other entities
    contact_id uuid references public.profiles(id), -- The primary contact person (client)
    company_id uuid references public.tenants(id), -- If deals are linked to other tenants/companies (optional, might differ from owning tenant)
    
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table public.deals enable row level security;

-- Policies
create policy "Users can view deals in their tenant"
  on public.deals for select
  using (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));

create policy "Users can insert deals in their tenant"
  on public.deals for insert
  with check (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));

create policy "Users can update deals in their tenant"
  on public.deals for update
  using (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));

create policy "Users can delete deals in their tenant"
  on public.deals for delete
  using (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));

-- Indexes
create index deals_tenant_id_idx on public.deals(tenant_id);
create index deals_contact_id_idx on public.deals(contact_id);
create index deals_stage_idx on public.deals(stage);

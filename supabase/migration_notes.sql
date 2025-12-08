-- Create Activity Notes Table
create type activity_type as enum ('note', 'call', 'email', 'meeting');

create table notes (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  type activity_type default 'note',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Foreign Keys
  user_id uuid references auth.users(id) on delete cascade not null,
  tenant_id uuid references tenants(id) on delete cascade not null,
  lead_id uuid references leads(id) on delete cascade,
  deal_id uuid references deals(id) on delete cascade,

  -- Constraints: Check that at least one parent (lead or deal) is set, but theoretically can be both if promoted? 
  -- For now, let's allow it to be linked to either or both.
  constraint notes_lead_or_deal_check check (lead_id is not null or deal_id is not null)
);

-- Enable RLS
alter table notes enable row level security;

-- RLS Policies
create policy "Users can view notes from their tenant"
  on notes for select
  using (
    tenant_id in (
      select tenant_id from profiles where id = auth.uid()
    )
  );

create policy "Users can insert notes for their tenant"
  on notes for insert
  with check (
    tenant_id in (
      select tenant_id from profiles where id = auth.uid()
    )
  );

create policy "Users can update their own notes"
  on notes for update
  using (
    tenant_id in (
      select tenant_id from profiles where id = auth.uid()
    )
  );

create policy "Users can delete their own notes"
  on notes for delete
  using (
    tenant_id in (
      select tenant_id from profiles where id = auth.uid()
    )
  );

-- Indexes for performance
create index notes_lead_id_idx on notes(lead_id);
create index notes_deal_id_idx on notes(deal_id);
create index notes_tenant_id_idx on notes(tenant_id);

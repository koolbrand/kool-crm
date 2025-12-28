-- Create types
create type task_type as enum ('call', 'email', 'meeting', 'todo');
create type task_status as enum ('pending', 'completed');
create type task_priority as enum ('low', 'medium', 'high');

-- Create table
create table tasks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- The "What"
  title text not null,
  description text,
  due_date timestamptz, -- If null -> "Inbox" logic
  
  -- Metadata
  type task_type default 'todo',
  status task_status default 'pending',
  priority task_priority default 'medium',
  
  -- Context (Relationships)
  user_id uuid references auth.users not null,
  tenant_id uuid references tenants(id) not null,
  lead_id uuid references leads(id),
  deal_id uuid references deals(id)
);

-- RLS Policies
alter table tasks enable row level security;

-- Policy: Admin can do anything
create policy "Admins can view all tasks" on tasks
  for select using ( exists (select 1 from profiles where id = auth.uid() and role = 'admin') );

create policy "Admins can insert all tasks" on tasks
  for insert with check ( exists (select 1 from profiles where id = auth.uid() and role = 'admin') );

create policy "Admins can update all tasks" on tasks
  for update using ( exists (select 1 from profiles where id = auth.uid() and role = 'admin') );

create policy "Admins can delete all tasks" on tasks
  for delete using ( exists (select 1 from profiles where id = auth.uid() and role = 'admin') );

-- Policy: Users can view, insert, update, delete tasks in their tenant
create policy "Users can view tenant tasks" on tasks
  for select using ( tenant_id in (select tenant_id from profiles where id = auth.uid()) );

create policy "Users can insert tenant tasks" on tasks
  for insert with check ( tenant_id in (select tenant_id from profiles where id = auth.uid()) );

create policy "Users can update tenant tasks" on tasks
  for update using ( tenant_id in (select tenant_id from profiles where id = auth.uid()) );

create policy "Users can delete tenant tasks" on tasks
  for delete using ( tenant_id in (select tenant_id from profiles where id = auth.uid()) );

-- Indexes
create index idx_tasks_user_date on tasks(user_id, due_date, status);
create index idx_tasks_tenant on tasks(tenant_id);

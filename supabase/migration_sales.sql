-- Create products table
create table public.products (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid references public.tenants(id) not null,
    name text not null,
    description text,
    price numeric not null default 0,
    currency text default 'USD',
    active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create quotes table
create table public.quotes (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid references public.tenants(id) not null,
    lead_id uuid references public.leads(id) on delete cascade not null,
    status text check (status in ('draft', 'sent', 'accepted', 'rejected', 'expired')) default 'draft',
    total_amount numeric default 0,
    valid_until date,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create quote items table
create table public.quote_items (
    id uuid default gen_random_uuid() primary key,
    quote_id uuid references public.quotes(id) on delete cascade not null,
    product_id uuid references public.products(id),
    description text, -- Snapshot of product name or custom item
    quantity integer default 1,
    unit_price numeric default 0,
    total numeric default 0,
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.products enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;

-- Policies for Products
create policy "Users can view products in their tenant"
  on public.products for select
  using (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));

create policy "Users can insert products in their tenant"
  on public.products for insert
  with check (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));

create policy "Users can update products in their tenant"
  on public.products for update
  using (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));

create policy "Users can delete products in their tenant"
  on public.products for delete
  using (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));

-- Policies for Quotes
create policy "Users can view quotes in their tenant"
  on public.quotes for select
  using (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));

create policy "Users can insert quotes in their tenant"
  on public.quotes for insert
  with check (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));

create policy "Users can update quotes in their tenant"
  on public.quotes for update
  using (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));

-- Policies for Quote Items
-- Access controlled via quote_id link? Or tenant_id on items? 
-- Simplest is just link via quote_id to a quote that is visible.
-- But RLS needs direct check usually or using EXISTS.
-- Let's add tenant_id to quote_items for easier RLS, or checks join.
-- Join check:
create policy "Users can view quote items in their tenant"
  on public.quote_items for select
  using (quote_id in (select id from public.quotes where tenant_id in (select tenant_id from public.profiles where id = auth.uid())));

create policy "Users can insert quote items in their tenant"
  on public.quote_items for insert
  with check (quote_id in (select id from public.quotes where tenant_id in (select tenant_id from public.profiles where id = auth.uid())));

create policy "Users can update quote items in their tenant"
  on public.quote_items for update
  using (quote_id in (select id from public.quotes where tenant_id in (select tenant_id from public.profiles where id = auth.uid())));

create policy "Users can delete quote items in their tenant"
  on public.quote_items for delete
  using (quote_id in (select id from public.quotes where tenant_id in (select tenant_id from public.profiles where id = auth.uid())));

-- Indexes
create index products_tenant_id_idx on public.products(tenant_id);
create index quotes_tenant_id_idx on public.quotes(tenant_id);
create index quotes_lead_id_idx on public.quotes(lead_id);
create index quote_items_quote_id_idx on public.quote_items(quote_id);

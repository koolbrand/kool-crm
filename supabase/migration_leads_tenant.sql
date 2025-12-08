-- 1. Add tenant_id to leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);

-- 2. Backfill tenant_id from profiles (assuming user_id link is valid)
UPDATE public.leads l
SET tenant_id = p.tenant_id
FROM public.profiles p
WHERE l.user_id = p.id;

-- 3. Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 4. Policies

-- Policy: Admins can view ALL leads
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
CREATE POLICY "Admins can view all leads" ON public.leads
FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policy: Admin Update
DROP POLICY IF EXISTS "Admins can update all leads" ON public.leads;
CREATE POLICY "Admins can update all leads" ON public.leads
FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policy: Admin Delete
DROP POLICY IF EXISTS "Admins can delete all leads" ON public.leads;
CREATE POLICY "Admins can delete all leads" ON public.leads
FOR DELETE
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);


-- Policy: Users can view leads in their tenant
DROP POLICY IF EXISTS "Users can view tenant leads" ON public.leads;
CREATE POLICY "Users can view tenant leads" ON public.leads
FOR SELECT
USING (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
);

-- Policy: Users can insert leads in their tenant
DROP POLICY IF EXISTS "Users can insert tenant leads" ON public.leads;
CREATE POLICY "Users can insert tenant leads" ON public.leads
FOR INSERT
WITH CHECK (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
);

-- Policy: Users can update leads in their tenant
DROP POLICY IF EXISTS "Users can update tenant leads" ON public.leads;
CREATE POLICY "Users can update tenant leads" ON public.leads
FOR UPDATE
USING (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
);

-- Policy: Users can delete leads in their tenant
DROP POLICY IF EXISTS "Users can delete tenant leads" ON public.leads;
CREATE POLICY "Users can delete tenant leads" ON public.leads
FOR DELETE
USING (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
);

-- Index
CREATE INDEX IF NOT EXISTS leads_tenant_id_idx ON public.leads(tenant_id);

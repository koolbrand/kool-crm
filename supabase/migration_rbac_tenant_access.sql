-- =====================================================
-- MIGRATION: Update RLS for Tenant-Based Lead Access
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Drop old user-based policy for clients
DROP POLICY IF EXISTS "Clients can view their own leads" ON public.leads;

-- 2. Create new tenant-based policy for clients
-- Clients can now see ALL leads from their company (tenant)
CREATE POLICY "Clients can view their tenant leads" ON public.leads
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

-- 3. Update INSERT policy for tenant context
DROP POLICY IF EXISTS "Users can insert their own leads" ON public.leads;
CREATE POLICY "Users can insert leads in their tenant" ON public.leads
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. Update UPDATE policy for tenant context
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
CREATE POLICY "Users can update their tenant leads" ON public.leads
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. Update DELETE policy for tenant context
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;
CREATE POLICY "Users can delete their tenant leads" ON public.leads
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Done! Clients now see all leads from their tenant, not just their own.

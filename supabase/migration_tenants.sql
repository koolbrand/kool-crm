-- =====================================================
-- MIGRATION: Phase 2 - Tenant Architecture
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create Tenants Table
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text CHECK (status IN ('active', 'trial', 'past_due', 'cancelled')) DEFAULT 'active',
  plan text CHECK (plan IN ('starter', 'pro', 'enterprise')) DEFAULT 'starter',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Add tenant_id to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);

-- 3. Data Migration: Create tenants from existing unique company names
INSERT INTO public.tenants (name)
SELECT DISTINCT company_name 
FROM public.profiles 
WHERE company_name IS NOT NULL AND company_name != ''
ON CONFLICT DO NOTHING; -- (No constraint on name yet but good practice)

-- 4. Data Migration: Link profiles to tenants
UPDATE public.profiles p
SET tenant_id = t.id
FROM public.tenants t
WHERE p.company_name = t.name;

-- 5. Enable RLS on Tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 6. Policy: Admins can view all tenants
CREATE POLICY "Admins can view all tenants" ON public.tenants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 7. Policy: Users can view their own tenant
CREATE POLICY "Users can view own tenant" ON public.tenants
  FOR SELECT USING (
    id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

-- 8. Policy: Admins can update tenants
CREATE POLICY "Admins can update tenants" ON public.tenants
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 9. (Optional) Constraint: Enforce tenant_id later if desired
-- ALTER TABLE public.profiles ALTER COLUMN tenant_id SET NOT NULL;

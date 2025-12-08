-- Add Settings columns to tenants table
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'EUR',
ADD COLUMN IF NOT EXISTS language text DEFAULT 'es';

-- Update all existing tenants to use EUR and ES
UPDATE public.tenants
SET currency = 'EUR',
    language = 'es';

-- (Optional) If we had a settings table separate, we would create it here.
-- But storing it on the tenant is efficient for this scale.

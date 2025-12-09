-- Update all leads belonging to "Kerme Clinic" to have source = 'facebook'

UPDATE public.leads
SET source = 'facebook'
FROM public.tenants
WHERE public.leads.tenant_id = public.tenants.id
AND public.tenants.name ILIKE '%Kerme Clinic%';

-- Verify the update (optional, returns the count of updated rows effectively if run as selection)
-- SELECT count(*) FROM public.leads 
-- JOIN public.tenants ON public.leads.tenant_id = public.tenants.id 
-- WHERE public.tenants.name ILIKE '%Kerme Clinic%' AND source = 'facebook';

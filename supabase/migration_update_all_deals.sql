-- Bulk update all leads to have 'Blanqueamiento' as the deal type
UPDATE public.leads
SET deal = 'Blanqueamiento';

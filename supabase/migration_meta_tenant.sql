-- Add meta_page_id to tenants to link Meta Pages to Tenants
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS meta_page_id text UNIQUE;

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS tenants_meta_page_id_idx ON public.tenants(meta_page_id);

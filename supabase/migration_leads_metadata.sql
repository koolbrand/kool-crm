-- Add metadata column to leads for storing flexible data from n8n (UTMs, Form Answers, etc.)
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Add index for querying metadata if needed
CREATE INDEX IF NOT EXISTS leads_metadata_idx ON public.leads USING gin (metadata);

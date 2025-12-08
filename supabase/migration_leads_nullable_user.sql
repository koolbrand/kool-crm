-- Make user_id nullable to allow leads to belong to a tenant without specific user owner
ALTER TABLE public.leads ALTER COLUMN user_id DROP NOT NULL;

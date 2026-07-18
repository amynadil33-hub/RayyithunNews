-- Run this once in the Supabase SQL editor for an existing installation.
-- New installations already receive these columns from schema.sql.
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS additional_image_1_url TEXT,
  ADD COLUMN IF NOT EXISTS additional_image_2_url TEXT;

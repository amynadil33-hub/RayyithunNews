-- Run this once in the Supabase SQL editor for an existing installation.
-- Each credit is displayed directly below its corresponding article image.
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS featured_image_credit TEXT,
  ADD COLUMN IF NOT EXISTS additional_image_1_credit TEXT,
  ADD COLUMN IF NOT EXISTS additional_image_2_credit TEXT;

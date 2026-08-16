-- Run once in the Supabase SQL Editor to enable the public Island Pulse section.
CREATE TABLE IF NOT EXISTS public.island_pulse_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  atoll_en TEXT,
  description_en TEXT,
  name_dv TEXT NOT NULL,
  atoll_dv TEXT,
  description_dv TEXT,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT,
  link_url TEXT,
  article_id UUID REFERENCES public.articles(id) ON DELETE SET NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_island_pulse_active_sort
  ON public.island_pulse_items(is_active, sort_order);

ALTER TABLE public.island_pulse_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active island pulse items"
  ON public.island_pulse_items;
CREATE POLICY "Anyone can read active island pulse items"
  ON public.island_pulse_items
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

GRANT SELECT ON public.island_pulse_items TO anon, authenticated;
NOTIFY pgrst, 'reload schema';

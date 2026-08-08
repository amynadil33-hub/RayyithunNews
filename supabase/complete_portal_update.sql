-- Safe, repeatable upgrade for an existing RAYYITHUN database.
-- Run this file once in the Supabase SQL Editor (not seed.sql).

-- Enable the two supporting article-image slots and their credits.
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS additional_image_1_url TEXT,
  ADD COLUMN IF NOT EXISTS additional_image_2_url TEXT,
  ADD COLUMN IF NOT EXISTS featured_image_credit TEXT,
  ADD COLUMN IF NOT EXISTS additional_image_1_credit TEXT,
  ADD COLUMN IF NOT EXISTS additional_image_2_credit TEXT;

-- Ensure both portals have the Travel and Tourism category.
INSERT INTO public.categories (
  portal_id,
  name,
  slug,
  description,
  sort_order,
  is_active
)
SELECT
  portal.id,
  CASE portal.slug
    WHEN 'dhivehi' THEN 'ފަތުރުވެރިކަން'
    ELSE 'Travel and tourism'
  END,
  'travel-tourism',
  CASE portal.slug
    WHEN 'dhivehi' THEN 'ފަތުރުވެރިކަމާއި ޓޫރިޒަމް ދާއިރާގެ ހަބަރު'
    ELSE 'Travel and tourism news from the Maldives'
  END,
  CASE portal.slug WHEN 'dhivehi' THEN 9 ELSE 10 END,
  true
FROM public.portals AS portal
WHERE portal.slug IN ('dhivehi', 'english')
ON CONFLICT (portal_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

-- Move existing tourism stories from News into Travel and Tourism.
UPDATE public.articles AS article
SET category_id = category.id
FROM public.portals AS portal
JOIN public.categories AS category
  ON category.portal_id = portal.id
 AND category.slug = 'travel-tourism'
WHERE article.portal_id = portal.id
  AND article.slug IN (
    'tourist-arrivals-record-high-q2-2026',
    'dv-tourist-arrivals-record-2026',
    'tourism'
  );

-- Ask PostgREST to refresh its schema immediately after adding the columns.
NOTIFY pgrst, 'reload schema';

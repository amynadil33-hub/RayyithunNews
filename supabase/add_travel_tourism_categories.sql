-- Add the bilingual travel and tourism category to existing installations.
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

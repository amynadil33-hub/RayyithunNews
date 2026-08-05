-- Run once for existing installations so both portals use stable route slugs.
-- If a stable-slug category already exists, merge article references before
-- removing the legacy dv-* duplicate.
WITH duplicate_categories AS (
  SELECT legacy.id AS legacy_id, stable.id AS stable_id
  FROM public.categories AS legacy
  JOIN public.portals AS portal ON portal.id = legacy.portal_id
  JOIN public.categories AS stable
    ON stable.portal_id = legacy.portal_id
   AND stable.slug = regexp_replace(legacy.slug, '^dv-', '')
  WHERE portal.slug = 'dhivehi'
    AND legacy.slug LIKE 'dv-%'
)
UPDATE public.articles AS article
SET category_id = duplicate_categories.stable_id
FROM duplicate_categories
WHERE article.category_id = duplicate_categories.legacy_id;

DELETE FROM public.categories AS legacy
USING public.portals AS portal
WHERE legacy.portal_id = portal.id
  AND portal.slug = 'dhivehi'
  AND legacy.slug LIKE 'dv-%'
  AND EXISTS (
    SELECT 1
    FROM public.categories AS stable
    WHERE stable.portal_id = legacy.portal_id
      AND stable.slug = regexp_replace(legacy.slug, '^dv-', '')
  );

UPDATE public.categories AS category
SET slug = regexp_replace(category.slug, '^dv-', '')
FROM public.portals AS portal
WHERE category.portal_id = portal.id
  AND portal.slug = 'dhivehi'
  AND category.slug LIKE 'dv-%';

-- Run once in Supabase SQL Editor for this RAYYITHUN update.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name_dv TEXT;

DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
SELECT id, full_name, full_name_dv, email, avatar_url FROM public.profiles;
REVOKE ALL ON public.public_profiles FROM PUBLIC;
GRANT SELECT ON public.public_profiles TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.article_reactions (
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  reader_key UUID NOT NULL,
  reaction TEXT NOT NULL CHECK (reaction IN ('heart','sad','angry','surprised','like','happy')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(article_id, reader_key)
);
CREATE INDEX IF NOT EXISTS idx_article_reactions_article ON public.article_reactions(article_id);
ALTER TABLE public.article_reactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read article reactions" ON public.article_reactions;
DROP POLICY IF EXISTS "Anyone can add article reactions" ON public.article_reactions;
DROP POLICY IF EXISTS "Anyone can update article reactions" ON public.article_reactions;
CREATE POLICY "Anyone can read article reactions" ON public.article_reactions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can add article reactions" ON public.article_reactions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update article reactions" ON public.article_reactions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
GRANT SELECT, INSERT, UPDATE ON public.article_reactions TO anon, authenticated;

-- Preserve article category IDs where possible. If both legacy and new rows
-- already exist, move only the legacy references before removing that row.
UPDATE public.articles AS article
SET category_id = target.id
FROM public.categories AS legacy
JOIN public.categories AS target
  ON target.portal_id = legacy.portal_id AND target.slug = 'quick-news'
JOIN public.portals AS portal
  ON portal.id = legacy.portal_id AND portal.slug = 'dhivehi'
WHERE legacy.slug = 'innovation' AND article.category_id = legacy.id;

DELETE FROM public.categories AS legacy
USING public.categories AS target, public.portals AS portal
WHERE legacy.portal_id = portal.id
  AND target.portal_id = legacy.portal_id
  AND portal.slug = 'dhivehi'
  AND legacy.slug = 'innovation'
  AND target.slug = 'quick-news';

UPDATE public.categories AS category
SET name = requested.name,
    slug = requested.new_slug,
    sort_order = requested.sort_order
FROM public.portals AS portal,
  (VALUES
    ('news', 'news', 'ހަބަރު', 1),
    ('world', 'world', 'ދުނިޔެ', 2),
    ('business', 'business', 'ވިޔަފާރި', 3),
    ('travel-tourism', 'travel-tourism', 'ފަތުރުވެރިކަން', 4),
    ('education', 'education', 'ތައުލީމު', 5),
    ('market', 'market', 'ބާޒާރު', 6),
    ('citizen', 'citizen', 'ރައްޔިތުން', 7),
    ('religion', 'religion', 'ތެދުމަގު', 8),
    ('innovation', 'quick-news', 'ލުއިހަބަރު', 9),
    ('quick-news', 'quick-news', 'ލުއިހަބަރު', 9),
    ('podcast', 'podcast', 'ޕޮޑްކާސްޓް', 10)
  ) AS requested(old_slug, new_slug, name, sort_order)
WHERE category.portal_id = portal.id
  AND portal.slug = 'dhivehi'
  AND category.slug = requested.old_slug;

INSERT INTO public.categories (portal_id, name, slug, description, sort_order, is_active)
SELECT id, 'ފަތުރުވެރިކަން', 'travel-tourism', 'ފަތުރުވެރިކަމާއި ޓޫރިޒަމް ދާއިރާގެ ހަބަރު', 4, true
FROM public.portals WHERE slug = 'dhivehi'
ON CONFLICT (portal_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

INSERT INTO public.categories (portal_id, name, slug, description, sort_order, is_active)
SELECT id, 'ޕޮޑްކާސްޓް', 'podcast', 'އަޑުގެ ލިޔުންތައް', 10, true
FROM public.portals WHERE slug = 'dhivehi'
ON CONFLICT (portal_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

NOTIFY pgrst, 'reload schema';

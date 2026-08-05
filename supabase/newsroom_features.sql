-- Run once in Supabase for newsroom tags, author visibility, moderated comments,
-- live updates and cover-photo captions.
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS show_author BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS featured_image_caption TEXT;

CREATE OR REPLACE FUNCTION public.set_profile_avatar(
  target_profile_id UUID,
  new_avatar_url TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR (
    auth.uid() <> target_profile_id
    AND NOT public.is_editor_user()
  ) THEN
    RAISE EXCEPTION 'Not authorized to update this writer photo';
  END IF;

  UPDATE public.profiles
  SET avatar_url = NULLIF(trim(new_avatar_url), ''), updated_at = NOW()
  WHERE id = target_profile_id;
END;
$$;
REVOKE ALL ON FUNCTION public.set_profile_avatar(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_profile_avatar(UUID, TEXT) TO authenticated;

CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES public.portals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(portal_id, slug)
);

CREATE TABLE IF NOT EXISTS public.article_tags (
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY(article_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  email TEXT NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  comment TEXT NOT NULL CHECK (char_length(comment) BETWEEN 1 AND 3000),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','spam')),
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.article_live_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  update_title TEXT,
  update_body TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_article_status ON public.comments(article_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_updates_article_created ON public.article_live_updates(article_id, created_at DESC);

CREATE OR REPLACE VIEW public.public_profiles AS
SELECT id, full_name, avatar_url FROM public.profiles;
REVOKE ALL ON public.public_profiles FROM PUBLIC;
GRANT SELECT ON public.public_profiles TO anon, authenticated;

CREATE OR REPLACE VIEW public.public_comments AS
SELECT id, article_id, name, comment, created_at
FROM public.comments
WHERE status = 'approved';
REVOKE ALL ON public.public_comments FROM PUBLIC;
GRANT SELECT ON public.public_comments TO anon, authenticated;

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_live_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Writers can create tags" ON public.tags FOR INSERT TO authenticated WITH CHECK (public.is_writer_user());
CREATE POLICY "Editors can update tags" ON public.tags FOR UPDATE TO authenticated USING (public.is_editor_user()) WITH CHECK (public.is_editor_user());
CREATE POLICY "Editors can delete tags" ON public.tags FOR DELETE TO authenticated USING (public.is_editor_user());

CREATE POLICY "Anyone can read article tags" ON public.article_tags FOR SELECT USING (true);
CREATE POLICY "Writers can attach tags to own articles" ON public.article_tags FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.articles
    JOIN public.tags ON tags.id = article_tags.tag_id AND tags.portal_id = articles.portal_id
    WHERE articles.id = article_tags.article_id
      AND (articles.author_id = auth.uid() OR public.is_editor_user())
  )
);
CREATE POLICY "Writers can remove tags from own articles" ON public.article_tags FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.articles WHERE articles.id = article_tags.article_id AND (articles.author_id = auth.uid() OR public.is_editor_user()))
);

CREATE POLICY "Anyone can submit pending comments" ON public.comments FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND approved_by IS NULL AND approved_at IS NULL);
CREATE POLICY "Editors can read all comments" ON public.comments FOR SELECT TO authenticated USING (public.is_editor_user());
CREATE POLICY "Editors can moderate comments" ON public.comments FOR UPDATE TO authenticated USING (public.is_editor_user()) WITH CHECK (public.is_editor_user());
CREATE POLICY "Editors can delete comments" ON public.comments FOR DELETE TO authenticated USING (public.is_editor_user());

CREATE POLICY "Anyone can read published live updates" ON public.article_live_updates FOR SELECT TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM public.articles WHERE articles.id = article_live_updates.article_id AND articles.status = 'published')
);
CREATE POLICY "Editors can read all live updates" ON public.article_live_updates FOR SELECT TO authenticated USING (public.is_editor_user());
CREATE POLICY "Editors can add live updates" ON public.article_live_updates FOR INSERT TO authenticated WITH CHECK (public.is_editor_user());
CREATE POLICY "Editors can update live updates" ON public.article_live_updates FOR UPDATE TO authenticated USING (public.is_editor_user()) WITH CHECK (public.is_editor_user());
CREATE POLICY "Editors can delete live updates" ON public.article_live_updates FOR DELETE TO authenticated USING (public.is_editor_user());

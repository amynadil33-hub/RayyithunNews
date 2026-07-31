-- ============================================================
-- RAYYITHUN — Editorial Approval Workflow Migration
-- Run once in Supabase SQL Editor for an existing installation.
-- ============================================================

ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_status_check;
ALTER TABLE public.articles
  ADD CONSTRAINT articles_status_check
  CHECK (status IN (
    'draft','submitted','in_review','changes_requested',
    'approved','published','scheduled','archived'
  ));

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approval_notes TEXT,
  ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.articles ALTER COLUMN author_id SET DEFAULT auth.uid();

CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_author_status ON public.articles(author_id, status);
CREATE INDEX IF NOT EXISTS idx_articles_review_queue
  ON public.articles(status, created_at DESC)
  WHERE status IN ('submitted', 'in_review', 'changes_requested', 'approved');

CREATE OR REPLACE FUNCTION public.is_writer_user()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_active = true
      AND role IN ('author','editor','admin','super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_editor_user()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_active = true
      AND role IN ('editor','admin','super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_active = true
      AND role IN ('admin','super_admin')
  );
$$;

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read published articles" ON public.articles;
DROP POLICY IF EXISTS "Authenticated users can read all articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can create articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can update their own drafts" ON public.articles;
DROP POLICY IF EXISTS "Editors and above can update any article" ON public.articles;
DROP POLICY IF EXISTS "Public can read published articles" ON public.articles;
DROP POLICY IF EXISTS "CMS users can read articles" ON public.articles;
DROP POLICY IF EXISTS "CMS users can insert articles" ON public.articles;
DROP POLICY IF EXISTS "CMS users can update articles" ON public.articles;
DROP POLICY IF EXISTS "Writers can create own articles" ON public.articles;
DROP POLICY IF EXISTS "Writers can read own articles" ON public.articles;
DROP POLICY IF EXISTS "Writers can update own unpublished articles" ON public.articles;
DROP POLICY IF EXISTS "Editors can read all articles" ON public.articles;
DROP POLICY IF EXISTS "Editors can update all articles" ON public.articles;
DROP POLICY IF EXISTS "Admins can delete articles" ON public.articles;

CREATE POLICY "Public can read published articles"
  ON public.articles FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Writers can create own articles"
  ON public.articles FOR INSERT TO authenticated
  WITH CHECK (
    public.is_writer_user()
    AND author_id = auth.uid()
    AND status IN ('draft', 'submitted')
  );

CREATE POLICY "Writers can read own articles"
  ON public.articles FOR SELECT TO authenticated
  USING (author_id = auth.uid() AND public.is_writer_user());

CREATE POLICY "Writers can update own unpublished articles"
  ON public.articles FOR UPDATE TO authenticated
  USING (
    author_id = auth.uid()
    AND public.is_writer_user()
    AND status IN ('draft', 'changes_requested')
  )
  WITH CHECK (
    author_id = auth.uid()
    AND public.is_writer_user()
    AND status IN ('draft', 'submitted', 'changes_requested')
  );

CREATE POLICY "Editors can read all articles"
  ON public.articles FOR SELECT TO authenticated
  USING (public.is_editor_user());

CREATE POLICY "Editors can update all articles"
  ON public.articles FOR UPDATE TO authenticated
  USING (public.is_editor_user())
  WITH CHECK (public.is_editor_user());

CREATE POLICY "Admins can delete articles"
  ON public.articles FOR DELETE TO authenticated
  USING (public.is_admin_user());

-- Editors need author names in the review queue.
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_editor_user());

CREATE TABLE IF NOT EXISTS public.article_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN (
    'submitted','in_review','changes_requested','approved',
    'published','rejected','archived'
  )),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_article_reviews_article_created
  ON public.article_reviews(article_id, created_at DESC);

ALTER TABLE public.article_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Writers can read reviews for own articles" ON public.article_reviews;
DROP POLICY IF EXISTS "Editors can manage article reviews" ON public.article_reviews;

CREATE POLICY "Writers can read reviews for own articles"
  ON public.article_reviews FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.articles
      WHERE articles.id = article_reviews.article_id
        AND articles.author_id = auth.uid()
    )
  );

CREATE POLICY "Editors can manage article reviews"
  ON public.article_reviews FOR ALL TO authenticated
  USING (public.is_editor_user())
  WITH CHECK (public.is_editor_user());

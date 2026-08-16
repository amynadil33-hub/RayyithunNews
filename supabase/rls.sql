-- ============================================================
-- RAYYITHUN — Row Level Security Policies
-- Run AFTER schema.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertiser_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.static_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.island_pulse_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_live_updates ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_writer_user()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND is_active = true
      AND role IN ('author','editor','admin','super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_editor_user()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND is_active = true
      AND role IN ('editor','admin','super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND is_active = true
      AND role IN ('admin','super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.set_profile_avatar(target_profile_id UUID, new_avatar_url TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR (auth.uid() <> target_profile_id AND NOT public.is_editor_user()) THEN
    RAISE EXCEPTION 'Not authorized to update this writer photo';
  END IF;
  UPDATE public.profiles SET avatar_url = NULLIF(trim(new_avatar_url), ''), updated_at = NOW()
  WHERE id = target_profile_id;
END;
$$;
REVOKE ALL ON FUNCTION public.set_profile_avatar(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_profile_avatar(UUID, TEXT) TO authenticated;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (get_my_role() IN ('super_admin','admin','editor'));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Super admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (get_my_role() = 'super_admin');

-- ============================================================
-- PORTALS — Public read
-- ============================================================
CREATE POLICY "Anyone can read active portals"
  ON public.portals FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage portals"
  ON public.portals FOR ALL
  USING (get_my_role() IN ('super_admin','admin'));

-- ============================================================
-- CATEGORIES — Public read active
-- ============================================================
CREATE POLICY "Anyone can read active categories"
  ON public.categories FOR SELECT USING (is_active = true);

CREATE POLICY "Admins/editors can manage categories"
  ON public.categories FOR ALL
  USING (get_my_role() IN ('super_admin','admin','editor'));

-- ============================================================
-- ARTICLES — Public can read published only
-- ============================================================
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

-- ============================================================
-- ARTICLE REVIEWS
-- ============================================================
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

-- ============================================================
-- MEDIA ASSETS
-- ============================================================
CREATE POLICY "Anyone can read media assets"
  ON public.media_assets FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload media"
  ON public.media_assets FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Admins can delete media"
  ON public.media_assets FOR DELETE
  USING (get_my_role() IN ('super_admin','admin'));

-- ============================================================
-- ADVERTISEMENTS — Public can read active ads
-- ============================================================
CREATE POLICY "Anyone can read active ads"
  ON public.advertisements FOR SELECT
  USING (is_active = true AND (start_date IS NULL OR start_date <= CURRENT_DATE) AND (end_date IS NULL OR end_date >= CURRENT_DATE));

CREATE POLICY "Admins can manage all ads"
  ON public.advertisements FOR ALL
  USING (get_my_role() IN ('super_admin','admin'));

-- ============================================================
-- PODCASTS — Public can read published
-- ============================================================
CREATE POLICY "Anyone can read published podcasts"
  ON public.podcasts FOR SELECT USING (status = 'published');

CREATE POLICY "Admins/editors can manage podcasts"
  ON public.podcasts FOR ALL
  USING (get_my_role() IN ('super_admin','admin','editor'));

-- ============================================================
-- CONTACT MESSAGES — Public can insert
-- ============================================================
CREATE POLICY "Anyone can submit contact messages"
  ON public.contact_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read contact messages"
  ON public.contact_messages FOR SELECT
  USING (get_my_role() IN ('super_admin','admin'));

CREATE POLICY "Admins can update contact message status"
  ON public.contact_messages FOR UPDATE
  USING (get_my_role() IN ('super_admin','admin'));

-- ============================================================
-- ADVERTISER INQUIRIES — Public can insert
-- ============================================================
CREATE POLICY "Anyone can submit advertiser inquiries"
  ON public.advertiser_inquiries FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read advertiser inquiries"
  ON public.advertiser_inquiries FOR SELECT
  USING (get_my_role() IN ('super_admin','admin'));

CREATE POLICY "Admins can update inquiry status"
  ON public.advertiser_inquiries FOR UPDATE
  USING (get_my_role() IN ('super_admin','admin'));

-- ============================================================
-- NEWSLETTER — Public can insert
-- ============================================================
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view subscribers"
  ON public.newsletter_subscribers FOR SELECT
  USING (get_my_role() IN ('super_admin','admin'));

-- ============================================================
-- STATIC PAGES — Public can read published
-- ============================================================
CREATE POLICY "Anyone can read published pages"
  ON public.static_pages FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage static pages"
  ON public.static_pages FOR ALL
  USING (get_my_role() IN ('super_admin','admin','editor'));

-- ============================================================
-- SITE SETTINGS — Admins only
-- ============================================================
CREATE POLICY "Admins can manage site settings"
  ON public.site_settings FOR ALL
  USING (get_my_role() IN ('super_admin','admin'));

CREATE POLICY "Anyone can read site settings"
  ON public.site_settings FOR SELECT USING (true);

-- ============================================================
-- NEWSROOM FEATURES
-- ============================================================
CREATE POLICY "Anyone can read tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Writers can create tags" ON public.tags FOR INSERT TO authenticated WITH CHECK (public.is_writer_user());
CREATE POLICY "Editors can update tags" ON public.tags FOR UPDATE TO authenticated USING (public.is_editor_user()) WITH CHECK (public.is_editor_user());
CREATE POLICY "Editors can delete tags" ON public.tags FOR DELETE TO authenticated USING (public.is_editor_user());
CREATE POLICY "Anyone can read article tags" ON public.article_tags FOR SELECT USING (true);
CREATE POLICY "Writers can attach tags" ON public.article_tags FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.articles JOIN public.tags ON tags.id = article_tags.tag_id AND tags.portal_id = articles.portal_id WHERE articles.id = article_tags.article_id AND (articles.author_id = auth.uid() OR public.is_editor_user())));
CREATE POLICY "Writers can remove tags" ON public.article_tags FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.articles WHERE articles.id = article_tags.article_id AND (articles.author_id = auth.uid() OR public.is_editor_user())));
CREATE POLICY "Anyone can submit pending comments" ON public.comments FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending' AND approved_by IS NULL AND approved_at IS NULL);
CREATE POLICY "Anyone can read article reactions" ON public.article_reactions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can add article reactions" ON public.article_reactions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update article reactions" ON public.article_reactions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can read active island pulse items" ON public.island_pulse_items FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Editors can read all comments" ON public.comments FOR SELECT TO authenticated USING (public.is_editor_user());
CREATE POLICY "Editors can moderate comments" ON public.comments FOR UPDATE TO authenticated USING (public.is_editor_user()) WITH CHECK (public.is_editor_user());
CREATE POLICY "Editors can delete comments" ON public.comments FOR DELETE TO authenticated USING (public.is_editor_user());
CREATE POLICY "Anyone can read published live updates" ON public.article_live_updates FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.articles WHERE articles.id = article_live_updates.article_id AND articles.status = 'published'));
CREATE POLICY "Editors can read all live updates" ON public.article_live_updates FOR SELECT TO authenticated USING (public.is_editor_user());
CREATE POLICY "Editors can add live updates" ON public.article_live_updates FOR INSERT TO authenticated WITH CHECK (public.is_editor_user());
CREATE POLICY "Editors can update live updates" ON public.article_live_updates FOR UPDATE TO authenticated USING (public.is_editor_user()) WITH CHECK (public.is_editor_user());
CREATE POLICY "Editors can delete live updates" ON public.article_live_updates FOR DELETE TO authenticated USING (public.is_editor_user());

REVOKE ALL ON public.public_profiles FROM PUBLIC;
GRANT SELECT ON public.public_profiles TO anon, authenticated;
REVOKE ALL ON public.public_comments FROM PUBLIC;
GRANT SELECT ON public.public_comments TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.article_reactions TO anon, authenticated;
GRANT SELECT ON public.island_pulse_items TO anon, authenticated;

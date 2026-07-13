-- ============================================================
-- RAYYITHUN — Row Level Security Policies
-- Run AFTER schema.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertiser_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.static_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (get_my_role() IN ('super_admin','admin'));

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
CREATE POLICY "Anyone can read published articles"
  ON public.articles FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can read all articles"
  ON public.articles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authors can create articles"
  ON public.articles FOR INSERT
  WITH CHECK (auth.uid() = author_id AND get_my_role() IN ('super_admin','admin','editor','author'));

CREATE POLICY "Authors can update their own drafts"
  ON public.articles FOR UPDATE
  USING (auth.uid() = author_id AND status = 'draft');

CREATE POLICY "Editors and above can update any article"
  ON public.articles FOR UPDATE
  USING (get_my_role() IN ('super_admin','admin','editor'));

CREATE POLICY "Admins can delete articles"
  ON public.articles FOR DELETE
  USING (get_my_role() IN ('super_admin','admin'));

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

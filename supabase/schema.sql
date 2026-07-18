-- ============================================================
-- RAYYITHUN News Portal — Supabase SQL Schema
-- Run this in your Supabase SQL Editor (Project > SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES (linked to auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  email       TEXT,
  role        TEXT NOT NULL DEFAULT 'author' CHECK (role IN ('super_admin','admin','editor','author')),
  avatar_url  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'author')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. PORTALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  language_code  TEXT NOT NULL DEFAULT 'en',
  direction      TEXT NOT NULL DEFAULT 'ltr' CHECK (direction IN ('ltr','rtl')),
  domain         TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id    UUID NOT NULL REFERENCES public.portals(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL,
  description  TEXT,
  sort_order   INT NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(portal_id, slug)
);

-- ============================================================
-- 4. ARTICLES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.articles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id         UUID NOT NULL REFERENCES public.portals(id) ON DELETE CASCADE,
  category_id       UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  author_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL,
  excerpt           TEXT,
  content           TEXT,
  featured_image_url TEXT,
  additional_image_1_url TEXT,
  additional_image_2_url TEXT,
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','scheduled','archived')),
  is_breaking       BOOLEAN NOT NULL DEFAULT false,
  is_featured       BOOLEAN NOT NULL DEFAULT false,
  is_trending       BOOLEAN NOT NULL DEFAULT false,
  read_time         INT,
  seo_title         TEXT,
  seo_description   TEXT,
  og_image_url      TEXT,
  published_at      TIMESTAMPTZ,
  scheduled_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(portal_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_articles_portal_status ON public.articles(portal_id, status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_trending ON public.articles(is_trending) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_articles_featured ON public.articles(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC);

-- ============================================================
-- 5. MEDIA ASSETS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.media_assets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  file_url     TEXT NOT NULL,
  file_path    TEXT NOT NULL,
  file_type    TEXT NOT NULL DEFAULT 'image/jpeg',
  alt_text     TEXT,
  caption      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. ADVERTISEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.advertisements (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  client_name  TEXT,
  image_url    TEXT,
  target_url   TEXT,
  portal_id    UUID REFERENCES public.portals(id) ON DELETE SET NULL,
  placement    TEXT NOT NULL CHECK (placement IN (
    'homepage_top_banner','category_top_banner','article_sidebar',
    'article_inline','homepage_mid_banner','footer_banner','mobile_banner'
  )),
  start_date   DATE,
  end_date     DATE,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  priority     INT NOT NULL DEFAULT 0,
  alt_text     TEXT,
  impressions  INT NOT NULL DEFAULT 0,
  clicks       INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helper RPC functions for tracking
CREATE OR REPLACE FUNCTION public.increment_ad_impressions(ad_id UUID)
RETURNS VOID LANGUAGE SQL SECURITY DEFINER AS $$
  UPDATE public.advertisements SET impressions = impressions + 1 WHERE id = ad_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_ad_clicks(ad_id UUID)
RETURNS VOID LANGUAGE SQL SECURITY DEFINER AS $$
  UPDATE public.advertisements SET clicks = clicks + 1 WHERE id = ad_id;
$$;

-- ============================================================
-- 7. PODCASTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.podcasts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id        UUID NOT NULL REFERENCES public.portals(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  description      TEXT,
  host             TEXT,
  audio_url        TEXT,
  cover_image_url  TEXT,
  duration         TEXT,
  status           TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. CONTACT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread','read','archived')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 9. ADVERTISER INQUIRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.advertiser_inquiries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  company             TEXT,
  email               TEXT NOT NULL,
  phone               TEXT,
  message             TEXT,
  preferred_placement TEXT,
  status              TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_progress','resolved')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. NEWSLETTER SUBSCRIBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  portal_id  UUID REFERENCES public.portals(id) ON DELETE SET NULL,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 11. STATIC PAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.static_pages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id        UUID REFERENCES public.portals(id) ON DELETE SET NULL,
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL,
  content          TEXT,
  seo_title        TEXT,
  seo_description  TEXT,
  status           TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(portal_id, slug)
);

-- ============================================================
-- 12. SITE SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id   UUID REFERENCES public.portals(id) ON DELETE CASCADE,
  key         TEXT NOT NULL,
  value       JSONB,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(portal_id, key)
);

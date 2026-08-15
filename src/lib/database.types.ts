// Auto-generated TypeScript types matching the Supabase schema.
// Run `supabase gen types typescript --local` to regenerate after schema changes.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "super_admin" | "admin" | "editor" | "author";
export type ArticleStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "changes_requested"
  | "approved"
  | "published"
  | "scheduled"
  | "archived";
export type AdPlacement =
  | "homepage_top_banner"
  | "category_top_banner"
  | "article_sidebar"
  | "article_inline"
  | "homepage_mid_banner"
  | "footer_banner"
  | "mobile_banner";
export type PodcastStatus = "draft" | "published";
export type PageStatus = "draft" | "published";
export type MessageStatus = "unread" | "read" | "archived";
export type InquiryStatus = "new" | "in_progress" | "resolved";
export type PortalSlug = "dhivehi" | "english";
export type CommentStatus = "pending" | "approved" | "rejected" | "spam";

export interface Profile {
  id: string;
  full_name: string | null;
  full_name_dv: string | null;
  email: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Portal {
  id: string;
  name: string;
  slug: PortalSlug;
  language_code: string;
  direction: "ltr" | "rtl";
  domain: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  portal_id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  // joined
  portal?: Portal;
}

export interface Article {
  id: string;
  portal_id: string;
  category_id: string | null;
  author_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image_url: string | null;
  featured_image_caption: string | null;
  featured_image_credit: string | null;
  additional_image_1_url: string | null;
  additional_image_1_credit: string | null;
  additional_image_2_url: string | null;
  additional_image_2_credit: string | null;
  status: ArticleStatus;
  is_breaking: boolean;
  is_featured: boolean;
  is_trending: boolean;
  show_author: boolean;
  read_time: number | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  published_at: string | null;
  scheduled_at: string | null;
  submitted_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  approval_notes: string | null;
  published_by: string | null;
  created_at: string;
  updated_at: string;
  // joined
  portal?: Portal;
  category?: Category;
  author?: Profile;
}

export interface Tag {
  id: string;
  portal_id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ArticleTag {
  article_id: string;
  tag_id: string;
  tag?: Tag;
}

export interface Comment {
  id: string;
  article_id: string;
  name: string;
  email: string;
  comment: string;
  status: CommentStatus;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  article?: Pick<Article, "id" | "title" | "slug">;
}

export type ArticleReactionName =
  "heart" | "sad" | "angry" | "surprised" | "like" | "happy";

export interface ArticleReaction {
  article_id: string;
  reader_key: string;
  reaction: ArticleReactionName;
  created_at: string;
  updated_at: string;
}

export interface ArticleLiveUpdate {
  id: string;
  article_id: string;
  update_title: string | null;
  update_body: string;
  created_by: string | null;
  created_at: string;
}

export type ArticleReviewAction =
  | "submitted"
  | "in_review"
  | "changes_requested"
  | "approved"
  | "published"
  | "rejected"
  | "archived";

export interface ArticleReview {
  id: string;
  article_id: string;
  reviewer_id: string | null;
  action: ArticleReviewAction;
  notes: string | null;
  created_at: string;
  reviewer?: Profile;
}

export interface MediaAsset {
  id: string;
  uploaded_by: string | null;
  file_url: string;
  file_path: string;
  file_type: string;
  alt_text: string | null;
  caption: string | null;
  created_at: string;
  // joined
  uploader?: Profile;
}

export interface Advertisement {
  id: string;
  title: string;
  client_name: string | null;
  image_url: string | null;
  target_url: string | null;
  portal_id: string | null;
  placement: AdPlacement;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  priority: number;
  alt_text: string | null;
  impressions: number;
  clicks: number;
  created_at: string;
  updated_at: string;
}

export interface Podcast {
  id: string;
  portal_id: string;
  title: string;
  slug: string;
  description: string | null;
  host: string | null;
  audio_url: string | null;
  cover_image_url: string | null;
  duration: string | null;
  status: PodcastStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // joined
  portal?: Portal;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: MessageStatus;
  created_at: string;
}

export interface AdvertiserInquiry {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  message: string | null;
  preferred_placement: string | null;
  status: InquiryStatus;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  portal_id: string | null;
  is_active: boolean;
  created_at: string;
  // joined
  portal?: Portal;
}

export interface StaticPage {
  id: string;
  portal_id: string | null;
  title: string;
  slug: string;
  content: string | null;
  seo_title: string | null;
  seo_description: string | null;
  status: PageStatus;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  id: string;
  portal_id: string | null;
  key: string;
  value: Json;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Profile>;
      };
      portals: {
        Row: Portal;
        Insert: Omit<Portal, "id" | "created_at">;
        Update: Partial<Portal>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, "id" | "created_at">;
        Update: Partial<Category>;
      };
      articles: {
        Row: Article;
        Insert: Omit<Article, "id" | "created_at" | "updated_at">;
        Update: Partial<Article>;
      };
      article_reviews: {
        Row: ArticleReview;
        Insert: Omit<ArticleReview, "id" | "created_at">;
        Update: Partial<ArticleReview>;
      };
      tags: {
        Row: Tag;
        Insert: Omit<Tag, "id" | "created_at">;
        Update: Partial<Tag>;
      };
      article_tags: {
        Row: ArticleTag;
        Insert: ArticleTag;
        Update: Partial<ArticleTag>;
      };
      comments: {
        Row: Comment;
        Insert: Omit<Comment, "id" | "created_at">;
        Update: Partial<Comment>;
      };
      article_reactions: {
        Row: ArticleReaction;
        Insert: Omit<ArticleReaction, "created_at" | "updated_at">;
        Update: Partial<ArticleReaction>;
      };
      article_live_updates: {
        Row: ArticleLiveUpdate;
        Insert: Omit<ArticleLiveUpdate, "id" | "created_at">;
        Update: Partial<ArticleLiveUpdate>;
      };
      media_assets: {
        Row: MediaAsset;
        Insert: Omit<MediaAsset, "id" | "created_at">;
        Update: Partial<MediaAsset>;
      };
      advertisements: {
        Row: Advertisement;
        Insert: Omit<
          Advertisement,
          "id" | "created_at" | "updated_at" | "impressions" | "clicks"
        >;
        Update: Partial<Advertisement>;
      };
      podcasts: {
        Row: Podcast;
        Insert: Omit<Podcast, "id" | "created_at" | "updated_at">;
        Update: Partial<Podcast>;
      };
      contact_messages: {
        Row: ContactMessage;
        Insert: Omit<ContactMessage, "id" | "created_at">;
        Update: Partial<ContactMessage>;
      };
      advertiser_inquiries: {
        Row: AdvertiserInquiry;
        Insert: Omit<AdvertiserInquiry, "id" | "created_at">;
        Update: Partial<AdvertiserInquiry>;
      };
      newsletter_subscribers: {
        Row: NewsletterSubscriber;
        Insert: Omit<NewsletterSubscriber, "id" | "created_at">;
        Update: Partial<NewsletterSubscriber>;
      };
      static_pages: {
        Row: StaticPage;
        Insert: Omit<StaticPage, "id" | "created_at" | "updated_at">;
        Update: Partial<StaticPage>;
      };
      site_settings: {
        Row: SiteSetting;
        Insert: Omit<SiteSetting, "id">;
        Update: Partial<SiteSetting>;
      };
    };
    Views: {
      public_profiles: {
        Row: Pick<
          Profile,
          "id" | "full_name" | "full_name_dv" | "email" | "avatar_url"
        >;
      };
      public_comments: {
        Row: Pick<
          Comment,
          "id" | "article_id" | "name" | "comment" | "created_at"
        >;
      };
    };
    Functions: {
      set_profile_avatar: {
        Args: { target_profile_id: string; new_avatar_url: string | null };
        Returns: undefined;
      };
    };
  };
}

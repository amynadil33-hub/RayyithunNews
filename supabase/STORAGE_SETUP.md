# RAYYITHUN — Storage Bucket Setup Instructions

Run these steps in the Supabase Dashboard → Storage.

## Buckets to Create

### 1. article-images
- **Bucket name**: `article-images`
- **Public**: Yes (enable "Public bucket")
- **Allowed MIME types**: `image/*`
- **File size limit**: 10MB

### 2. ad-banners
- **Bucket name**: `ad-banners`
- **Public**: Yes
- **Allowed MIME types**: `image/*`
- **File size limit**: 5MB

### 3. podcast-covers
- **Bucket name**: `podcast-covers`
- **Public**: Yes
- **Allowed MIME types**: `image/*`
- **File size limit**: 5MB

### 4. site-assets
- **Bucket name**: `site-assets`
- **Public**: Yes
- **Allowed MIME types**: `image/*, application/pdf`
- **File size limit**: 20MB

## Storage RLS Policies

Run this SQL in the Supabase SQL Editor after creating buckets:

```sql
-- Allow public read on all public buckets (handled by making them public)

-- Allow authenticated admins/editors to upload
CREATE POLICY "Authenticated users can upload to article-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'article-images');

CREATE POLICY "Authenticated users can upload to ad-banners"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'ad-banners');

CREATE POLICY "Authenticated users can upload to podcast-covers"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'podcast-covers');

CREATE POLICY "Authenticated users can upload to site-assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'site-assets');

-- Only admins can delete files (enforced at app level via profiles.role check)
CREATE POLICY "Authenticated users can delete from article-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'article-images');

CREATE POLICY "Authenticated users can delete from ad-banners"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'ad-banners');

CREATE POLICY "Authenticated users can delete from podcast-covers"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'podcast-covers');

CREATE POLICY "Authenticated users can delete from site-assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'site-assets');
```

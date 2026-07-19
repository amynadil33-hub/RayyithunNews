-- Run once in the Supabase SQL editor for reader-submitted article photos.
-- Limits anonymous uploads to the reader-submissions folder of article-images.
CREATE POLICY "Readers can upload article submission photos"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (
    bucket_id = 'article-images'
    AND (storage.foldername(name))[1] = 'reader-submissions'
  );

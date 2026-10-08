-- Install the writer-avatar RPC used by the admin Users page.
-- This is a migration (rather than a loose SQL helper) so every deployed
-- Supabase environment exposes the function to PostgREST.
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
  SET
    avatar_url = NULLIF(trim(new_avatar_url), ''),
    updated_at = NOW()
  WHERE id = target_profile_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Writer profile not found';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.set_profile_avatar(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_profile_avatar(UUID, TEXT) TO authenticated;

COMMENT ON FUNCTION public.set_profile_avatar(UUID, TEXT)
  IS 'Lets writers update their own avatar and editors/admins update writer avatars.';

-- Make the new RPC visible immediately to Supabase's REST API.
NOTIFY pgrst, 'reload schema';

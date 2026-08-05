-- Run once after the editorial workflow helpers are installed.
-- Allows a writer to manage their own optional photo and editors/admins to
-- manage writer photos without granting broad profile-update permission.
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

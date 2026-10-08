-- Run once in the production Supabase SQL Editor.
-- The authentication user must already exist before this script is run.

DO $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id
  INTO target_user_id
  FROM auth.users
  WHERE lower(email) = 'rayyithunn@gmail.com'
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION
      'No Supabase authentication user exists for rayyithunn@gmail.com. Create the user first, then run this script again.';
  END IF;

  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    role,
    is_active
  )
  SELECT
    id,
    COALESCE(raw_user_meta_data->>'full_name', email),
    email,
    'admin',
    true
  FROM auth.users
  WHERE id = target_user_id
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    role = 'admin',
    is_active = true,
    updated_at = now();
END
$$;

SELECT id, email, role, is_active
FROM public.profiles
WHERE lower(email) = 'rayyithunn@gmail.com';

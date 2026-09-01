/*
# Create auto-profile trigger function

Creates a SECURITY DEFINER function that auto-creates a user_profiles row
and a user_settings row when a new auth user signs up. This ensures every
new user has default profile/settings data without the frontend needing to
make extra calls.

## Security
- Function is SECURITY DEFINER so it can insert into user_profiles/user_settings
  regardless of the caller's role (the auth trigger runs as the new user who
  doesn't yet have an authenticated session).
- EXECUTE granted to authenticated and anon (anon needed during signup flow).
- search_path set to public for security.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, role, organization, member_since)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'Legal Counsel',
    'Tata Group',
    to_char(now(), 'Month YYYY')
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, anon;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

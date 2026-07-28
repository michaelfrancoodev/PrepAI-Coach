/*
# Auto-create profile on signup

## Summary
Adds a trigger that automatically inserts a row into `profiles` whenever a new
row is created in `auth.users` (i.e. when a user signs up). The profile is
seeded with the user's email so the frontend has a profile row ready immediately
after registration, without the client needing to insert one.

## Changes
- `handle_new_user()` trigger function — inserts a profile row keyed by the new
  user's id, copying `email` from `auth.users`.
- Trigger `on_auth_user_created` fires AFTER INSERT on `auth.users`.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

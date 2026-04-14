
-- Recreate the view WITHOUT security_invoker so it runs as the view owner (bypasses base table RLS)
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public AS
SELECT
  id,
  user_id,
  name,
  preferred_name,
  avatar_url,
  department,
  department_slug,
  department_id,
  position,
  status,
  location,
  unit,
  skills,
  bio,
  tags,
  joined_at,
  created_at,
  updated_at
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO authenticated;
GRANT SELECT ON public.profiles_public TO anon;

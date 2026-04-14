
-- Drop the restrictive SELECT policy
DROP POLICY IF EXISTS "Own profile or admin/manager access" ON public.profiles;

-- Allow all authenticated users to read profiles
-- Sensitive fields are protected at application level via profiles_public view
CREATE POLICY "Authenticated can read profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

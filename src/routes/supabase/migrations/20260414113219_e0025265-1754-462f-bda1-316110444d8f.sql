
-- FIX PROFILES: Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Own profile or admin/manager access"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role])
  );

-- FIX STORAGE: Recreate policies with authenticated role instead of public
DROP POLICY IF EXISTS "Admins can delete attachments" ON storage.objects;
CREATE POLICY "Admins can delete attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'attachments' AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Editors+ can upload attachments" ON storage.objects;
CREATE POLICY "Editors+ can upload attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'attachments' AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'editor'::app_role]));

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

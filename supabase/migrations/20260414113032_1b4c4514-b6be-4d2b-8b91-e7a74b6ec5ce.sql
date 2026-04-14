
-- Restrict attachments: authenticated only
DROP POLICY IF EXISTS "Anyone can view attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can download attachments" ON storage.objects;

CREATE POLICY "Authenticated can view attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'attachments');

-- Restrict avatars: authenticated only (still needed for profile pics)
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

CREATE POLICY "Authenticated can view avatars"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'avatars');

-- Add admin + user delete policies for avatars (already created, skip if exists)
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete any avatar" ON storage.objects;

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can delete any avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND has_any_role(auth.uid(), ARRAY['admin'::app_role])
  );

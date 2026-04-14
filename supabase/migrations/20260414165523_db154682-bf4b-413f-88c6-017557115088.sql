
-- Make attachments bucket public
UPDATE storage.buckets SET public = true WHERE id = 'attachments';

-- Make avatars bucket public  
UPDATE storage.buckets SET public = true WHERE id = 'avatars';

-- Add public read policy for attachments (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public read access for attachments' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public read access for attachments" ON storage.objects FOR SELECT USING (bucket_id = 'attachments');
  END IF;
END $$;

-- Add public read policy for avatars (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public read access for avatars' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public read access for avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
  END IF;
END $$;

-- Add upload policy for avatars (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Auth users can upload avatars' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Auth users can upload avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
  END IF;
END $$;

-- Add upload policy for attachments (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Auth users can upload attachments' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Auth users can upload attachments" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'attachments');
  END IF;
END $$;

-- Add delete policy for attachments (admins/editors)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Auth users can delete attachments' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Auth users can delete attachments" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'attachments');
  END IF;
END $$;

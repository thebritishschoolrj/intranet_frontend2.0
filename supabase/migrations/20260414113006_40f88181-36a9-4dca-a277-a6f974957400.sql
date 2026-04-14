
-- Remove institutional_pages from realtime publication
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'institutional_pages'
    AND schemaname = 'public'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.institutional_pages;
  END IF;
END $$;

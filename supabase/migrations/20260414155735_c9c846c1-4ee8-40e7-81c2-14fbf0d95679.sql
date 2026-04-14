INSERT INTO storage.buckets (id, name, public) VALUES ('news-covers', 'news-covers', true);

CREATE POLICY "Public read access for news covers" ON storage.objects FOR SELECT USING (bucket_id = 'news-covers');

CREATE POLICY "Auth users can upload news covers" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'news-covers');
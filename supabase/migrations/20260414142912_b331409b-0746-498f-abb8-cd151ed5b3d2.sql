
CREATE TABLE public.news_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id UUID NOT NULL,
  url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.news_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gallery images readable by authenticated"
  ON public.news_gallery FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Editors+ can create gallery images"
  ON public.news_gallery FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'editor'::app_role]));

CREATE POLICY "Editors+ can update gallery images"
  ON public.news_gallery FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'editor'::app_role]));

CREATE POLICY "Admins can delete gallery images"
  ON public.news_gallery FOR DELETE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role]));

CREATE INDEX idx_news_gallery_news_id ON public.news_gallery (news_id);


-- Priority enum
CREATE TYPE public.news_priority AS ENUM ('normal', 'important', 'urgent');

-- Add priority and mandatory columns to news
ALTER TABLE public.news
  ADD COLUMN priority public.news_priority NOT NULL DEFAULT 'normal',
  ADD COLUMN is_mandatory boolean NOT NULL DEFAULT false;

-- News Acknowledgments
CREATE TABLE public.news_acknowledgments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id uuid NOT NULL,
  user_id uuid NOT NULL,
  acknowledged_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(news_id, user_id)
);

CREATE INDEX idx_news_ack_news_id ON public.news_acknowledgments(news_id);
CREATE INDEX idx_news_ack_user_id ON public.news_acknowledgments(user_id);

ALTER TABLE public.news_acknowledgments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read acknowledgments" ON public.news_acknowledgments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can acknowledge" ON public.news_acknowledgments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- News Views (read analytics)
CREATE TABLE public.news_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id uuid NOT NULL,
  user_id uuid NOT NULL,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(news_id, user_id)
);

CREATE INDEX idx_news_views_news_id ON public.news_views(news_id);

ALTER TABLE public.news_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins/managers can read views" ON public.news_views
  FOR SELECT TO authenticated USING (
    has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role])
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can insert own views" ON public.news_views
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

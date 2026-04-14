
-- News Comments
CREATE TABLE public.news_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  parent_id uuid REFERENCES public.news_comments(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_news_comments_news_id ON public.news_comments(news_id);
CREATE INDEX idx_news_comments_user_id ON public.news_comments(user_id);

ALTER TABLE public.news_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read comments" ON public.news_comments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create own comments" ON public.news_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.news_comments
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users or admins can delete comments" ON public.news_comments
  FOR DELETE TO authenticated USING (
    auth.uid() = user_id OR has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role])
  );

CREATE TRIGGER update_news_comments_updated_at
  BEFORE UPDATE ON public.news_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- News Reactions
CREATE TABLE public.news_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL DEFAULT 'like',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(news_id, user_id)
);

CREATE INDEX idx_news_reactions_news_id ON public.news_reactions(news_id);

ALTER TABLE public.news_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read reactions" ON public.news_reactions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can add own reactions" ON public.news_reactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions" ON public.news_reactions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Notifications
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(user_id, is_read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

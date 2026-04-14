
-- Add role_access to news for audience targeting by role
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS role_access text[] DEFAULT '{}'::text[];

-- Prevent duplicate views per user per news
ALTER TABLE public.news_views ADD CONSTRAINT news_views_unique_user_news UNIQUE (news_id, user_id);

-- Prevent duplicate acknowledgments
ALTER TABLE public.news_acknowledgments ADD CONSTRAINT news_ack_unique_user_news UNIQUE (news_id, user_id);

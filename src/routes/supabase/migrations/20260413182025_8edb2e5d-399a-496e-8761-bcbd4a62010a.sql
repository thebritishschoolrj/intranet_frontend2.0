
-- Add 'review' to content_status enum
ALTER TYPE public.content_status ADD VALUE IF NOT EXISTS 'review' BEFORE 'published';

-- Add new columns to news table
ALTER TABLE public.news
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Generate slugs for existing rows
UPDATE public.news SET slug = id::text WHERE slug IS NULL;

-- Make slug NOT NULL and UNIQUE
ALTER TABLE public.news ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_news_slug ON public.news (slug);

-- Index for featured/published queries
CREATE INDEX IF NOT EXISTS idx_news_featured ON public.news (is_featured, status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_expires ON public.news (expires_at) WHERE expires_at IS NOT NULL;


-- Create category enum for institutional pages
CREATE TYPE public.institutional_category AS ENUM (
  'onboarding', 'compliance', 'ethics', 'cipa', 'lgpd', 'quality', 'departmental', 'general'
);

-- Create institutional_pages table
CREATE TABLE public.institutional_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL DEFAULT '',
  content_html TEXT NOT NULL DEFAULT '',
  category public.institutional_category NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}'::TEXT[],
  featured_image TEXT,
  language TEXT NOT NULL DEFAULT 'pt',
  status public.content_status NOT NULL DEFAULT 'draft',
  visibility public.visibility_type NOT NULL DEFAULT 'public',
  department_access TEXT[] DEFAULT '{}'::TEXT[],
  owner_department TEXT DEFAULT '',
  responsible_user TEXT DEFAULT '',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by UUID,
  author TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX idx_institutional_pages_slug ON public.institutional_pages (slug);
CREATE INDEX idx_institutional_pages_category ON public.institutional_pages (category);
CREATE INDEX idx_institutional_pages_status ON public.institutional_pages (status);
CREATE INDEX idx_institutional_pages_language ON public.institutional_pages (language);
CREATE INDEX idx_institutional_pages_tags ON public.institutional_pages USING GIN (tags);

-- Enable RLS
ALTER TABLE public.institutional_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Published institutional pages readable by authenticated"
  ON public.institutional_pages FOR SELECT TO authenticated
  USING (
    status = 'published'::content_status
    OR created_by = auth.uid()
    OR has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'editor'::app_role])
  );

CREATE POLICY "Editors+ can create institutional pages"
  ON public.institutional_pages FOR INSERT TO authenticated
  WITH CHECK (
    has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'editor'::app_role])
  );

CREATE POLICY "Editors+ can update institutional pages"
  ON public.institutional_pages FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role])
  );

CREATE POLICY "Admins can delete institutional pages"
  ON public.institutional_pages FOR DELETE TO authenticated
  USING (
    has_any_role(auth.uid(), ARRAY['admin'::app_role])
  );

-- Timestamp trigger
CREATE TRIGGER update_institutional_pages_updated_at
  BEFORE UPDATE ON public.institutional_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.institutional_pages;

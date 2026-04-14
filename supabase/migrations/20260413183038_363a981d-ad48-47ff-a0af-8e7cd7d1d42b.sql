
-- Add new columns to procedures table
ALTER TABLE public.procedures
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'operacional',
  ADD COLUMN IF NOT EXISTS responsible_user text DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Generate slugs for existing rows
UPDATE public.procedures SET slug = code || '-' || id::text WHERE slug IS NULL;

-- Make slug NOT NULL and UNIQUE
ALTER TABLE public.procedures ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_procedures_slug ON public.procedures (slug);

-- Indexes for filtering
CREATE INDEX IF NOT EXISTS idx_procedures_category ON public.procedures (category);
CREATE INDEX IF NOT EXISTS idx_procedures_dept_status ON public.procedures (department_slug, content_status);

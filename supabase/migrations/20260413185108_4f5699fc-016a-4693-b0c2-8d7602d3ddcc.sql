
-- Add new columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_name text DEFAULT ''::text,
  ADD COLUMN IF NOT EXISTS bio text DEFAULT ''::text,
  ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS location text DEFAULT ''::text,
  ADD COLUMN IF NOT EXISTS unit text DEFAULT ''::text,
  ADD COLUMN IF NOT EXISTS extension text DEFAULT ''::text,
  ADD COLUMN IF NOT EXISTS manager_id uuid REFERENCES public.profiles(id);

-- Performance indices
CREATE INDEX IF NOT EXISTS idx_profiles_department_slug ON public.profiles (department_slug);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles (status);
CREATE INDEX IF NOT EXISTS idx_profiles_manager_id ON public.profiles (manager_id);
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON public.profiles USING GIN (skills);

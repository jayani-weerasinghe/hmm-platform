-- Add title: optional institutional/professional title (e.g. "Clinical
-- Coordinator"), shown on the Champion Management pages. Simple, real,
-- optional — same category as clubs.contact_email/contact_phone.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS title TEXT;
COMMENT ON COLUMN public.profiles.title IS 'Optional institutional/professional title, set by Super Admin (e.g. "Clinical Coordinator").';

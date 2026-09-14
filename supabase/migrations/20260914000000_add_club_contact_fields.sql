-- Add contact_email and contact_phone to clubs: simple, real contact fields
-- for the redesigned Clubs UI (Figma's Edit/Create Club modals show these).
-- Both optional — no ACs require them, and existing rows have neither.
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS contact_phone TEXT;
COMMENT ON COLUMN public.clubs.contact_email IS 'Optional club contact email, set by Super Admin.';
COMMENT ON COLUMN public.clubs.contact_phone IS 'Optional club contact phone, set by Super Admin.';

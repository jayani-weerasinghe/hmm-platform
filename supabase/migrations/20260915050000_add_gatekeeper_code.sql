-- Gatekeepers: auto-generated human-readable ID (e.g. "GK-1000"), used by
-- the Super Admin "Gatekeepers" section — an explicit Phase 1 spec deviation,
-- see CLAUDE.md. Unlike clubs.club_code (manually typed by Super Admin), this
-- is truly system-generated via a sequence, matching the Figma design's
-- read-only "Auto-generated" field.

CREATE SEQUENCE IF NOT EXISTS public.gatekeeper_code_seq START 1000;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gatekeeper_code TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_gatekeeper_code_unique
  ON public.profiles (gatekeeper_code) WHERE gatekeeper_code IS NOT NULL;

CREATE OR REPLACE FUNCTION public.next_gatekeeper_code()
RETURNS TEXT
LANGUAGE sql
AS $$
  SELECT 'GK-' || lpad(nextval('public.gatekeeper_code_seq')::text, 4, '0');
$$;

COMMENT ON COLUMN public.profiles.gatekeeper_code IS 'Auto-generated via next_gatekeeper_code(); gatekeeper role only.';

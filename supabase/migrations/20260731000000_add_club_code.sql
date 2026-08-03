-- Add club_code: human-readable unique identifier (Story 7.1).
-- Nullable to avoid breaking any existing rows; required at the app level.
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS club_code TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS clubs_club_code_unique ON public.clubs (club_code) WHERE club_code IS NOT NULL;
COMMENT ON COLUMN public.clubs.club_code IS 'Super-Admin-assigned unique identifier (e.g. CLB001). Required at app level.';

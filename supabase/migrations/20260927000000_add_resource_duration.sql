-- Real video duration for uploaded (non-external-URL) video resources,
-- extracted automatically at upload time via mediainfo.js — see
-- actions/resources.ts's uploadResourceFile(). NULL for every resource
-- that isn't an uploaded video file (articles, documents, external video
-- links), or when extraction failed for a given upload (corrupt file,
-- unsupported codec) — estimated_completion remains the fallback for
-- display in either case.
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

COMMENT ON COLUMN public.resources.duration_seconds IS 'Real video duration in seconds, auto-extracted at upload time for uploaded video files only (not external URLs). NULL if not applicable or extraction failed — estimated_completion is the fallback.';

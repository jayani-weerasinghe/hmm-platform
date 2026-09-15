-- Announcements: Priority, Audience, and Draft/Published status.
-- These are Super-Admin bookkeeping fields only, same caveat as the Resources
-- visibility/status columns (migration 20260915010000) — there is no
-- Champion or Gatekeeper UI yet to actually read/filter by them, and no
-- read-acknowledgment tracking exists (see CLAUDE.md "Not started yet").
-- club_id (already on this table) is reused for the "Specific Cohort"
-- audience value — single-club targeting, not a new join table.

DO $$ BEGIN
  CREATE TYPE public.announcement_priority AS ENUM ('standard', 'mandatory', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.announcement_audience AS ENUM ('all', 'champions', 'gatekeepers', 'specific_clubs');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.announcement_status AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS priority public.announcement_priority NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS audience public.announcement_audience NOT NULL DEFAULT 'all',
  ADD COLUMN IF NOT EXISTS status public.announcement_status NOT NULL DEFAULT 'published';

-- Events: Primary Facilitator and virtual meeting Link.
-- Added to back the "Schedule New Event" Super Admin modal (an explicit
-- Phase 1 spec deviation — see CLAUDE.md Epic 6 note; Story 6.1 originally
-- scoped event creation to Champions only). Both nullable/optional, same
-- light-metadata pattern as the Resources/Announcements additions.

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS facilitator TEXT,
  ADD COLUMN IF NOT EXISTS virtual_link TEXT;

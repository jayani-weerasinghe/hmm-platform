-- Admin-side bookkeeping metadata for resources, matching the real "Create
-- New Resource" Figma modal (node 54:17908): estimated completion time,
-- target-audience visibility flags, and draft/publish status.
--
-- Note: visible_to_champions/visible_to_gatekeepers and status are stored
-- as real, honest data but are NOT yet enforced anywhere — there is no
-- Champion or Gatekeeper resources view in this codebase to filter against.
-- Today this is Super-Admin-only bookkeeping (draft-while-editing, intended
-- audience), not access control. Defaults preserve the current implicit
-- behavior of every existing resource (visible to both roles, published).
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS estimated_completion TEXT,
  ADD COLUMN IF NOT EXISTS visible_to_champions BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS visible_to_gatekeepers BOOLEAN NOT NULL DEFAULT true;

DO $$ BEGIN
  CREATE TYPE public.resource_status AS ENUM ('draft', 'published');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS status public.resource_status NOT NULL DEFAULT 'published';

COMMENT ON COLUMN public.resources.estimated_completion IS 'Free-text estimated time to complete (e.g. "15 min", "2 hours") — set by Super Admin, informational only.';
COMMENT ON COLUMN public.resources.visible_to_champions IS 'Intended audience flag, not yet enforced by RLS (no Champion resource view exists yet).';
COMMENT ON COLUMN public.resources.visible_to_gatekeepers IS 'Intended audience flag, not yet enforced by RLS (no Gatekeeper resource view exists yet).';
COMMENT ON COLUMN public.resources.status IS 'Draft/published state — currently just a Super Admin bookkeeping filter, not an access restriction.';

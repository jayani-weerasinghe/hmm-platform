-- Champions and Gatekeepers may only read resources that are actually meant
-- for them. Until now the read rules only checked `publication_date <=
-- CURRENT_DATE`, so they ignored:
--   - status: drafts were readable (the Champion web page filtered them out
--     itself, but anything reading the database directly — e.g. the
--     Gatekeeper mobile app — could see drafts);
--   - visible_to_champions / visible_to_gatekeepers: the audience ticks on
--     Create Resource weren't enforced at all;
-- and the stored files of every resource were readable by any Champion or
-- Gatekeeper, whatever the resource's state.
--
-- "Today" is Sri Lanka's date (the database clock is UTC), matching
-- lib/org-date.ts, so a resource published "today" in Sri Lanka is visible
-- straight away rather than only after 05:30.
--
-- Super Admin access is unchanged. Safe to run once, as a whole.

-- 1. Resource rows.
DROP POLICY IF EXISTS "resources: champion read published" ON public.resources;
DROP POLICY IF EXISTS "resources: gatekeeper read published" ON public.resources;

CREATE POLICY "resources: champion read published"
  ON public.resources FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'champion'
    AND status = 'published'
    AND visible_to_champions
    AND publication_date <= (now() AT TIME ZONE 'Asia/Colombo')::date
  );

CREATE POLICY "resources: gatekeeper read published"
  ON public.resources FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'gatekeeper'
    AND status = 'published'
    AND visible_to_gatekeepers
    AND publication_date <= (now() AT TIME ZONE 'Asia/Colombo')::date
  );

-- 2. Stored files: a Champion/Gatekeeper may only read a file that belongs
-- to a resource they can see. The subquery runs under their own resource
-- rules above, so a draft's, a scheduled resource's or another audience's
-- file is refused.
DROP POLICY IF EXISTS "resources bucket: champion gatekeeper read" ON storage.objects;

CREATE POLICY "resources bucket: champion gatekeeper read"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'resources'
    AND public.current_user_role() IN ('champion', 'gatekeeper')
    AND EXISTS (
      SELECT 1 FROM public.resources r
      WHERE r.content_url = storage.objects.name
    )
  );

COMMENT ON COLUMN public.resources.status IS
  'Draft/published state. Only published resources are readable by Champions and Gatekeepers (RLS).';
COMMENT ON COLUMN public.resources.visible_to_champions IS
  'Whether Champions can see this resource (enforced by RLS).';
COMMENT ON COLUMN public.resources.visible_to_gatekeepers IS
  'Whether Gatekeepers can see this resource (enforced by RLS).';

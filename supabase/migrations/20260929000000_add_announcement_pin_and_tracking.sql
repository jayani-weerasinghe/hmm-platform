-- Backing for the Gatekeeper mobile app's Announcements/Alerts screen.
-- Checked the real schema first (per explicit request): no is_pinned
-- flag, no read/saved tracking, and no way to safely expose a creator's
-- display label to a gatekeeper existed before this.

-- Pinned announcements — no admin UI to set this yet (out of scope for
-- this pass, which only covers the Gatekeeper mobile screen); flagged,
-- not silently built as if a toggle already existed somewhere.
ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false;

-- Same row-presence-means-state shape and RLS convention as
-- event_registrations / resource_saves / resource_reads.
CREATE TABLE public.announcement_reads (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id  UUID        NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  gatekeeper_id    UUID        NOT NULL REFERENCES public.profiles(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (announcement_id, gatekeeper_id)
);

CREATE TABLE public.announcement_saves (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id  UUID        NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  gatekeeper_id    UUID        NOT NULL REFERENCES public.profiles(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (announcement_id, gatekeeper_id)
);

ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "announcement_reads: super_admin read"
  ON public.announcement_reads FOR SELECT TO authenticated
  USING (public.current_user_role() = 'super_admin');

CREATE POLICY "announcement_reads: gatekeeper own"
  ON public.announcement_reads FOR ALL TO authenticated
  USING      (gatekeeper_id = auth.uid())
  WITH CHECK (gatekeeper_id = auth.uid());

CREATE POLICY "announcement_saves: super_admin read"
  ON public.announcement_saves FOR SELECT TO authenticated
  USING (public.current_user_role() = 'super_admin');

CREATE POLICY "announcement_saves: gatekeeper own"
  ON public.announcement_saves FOR ALL TO authenticated
  USING      (gatekeeper_id = auth.uid())
  WITH CHECK (gatekeeper_id = auth.uid());

-- "SUPER ADMIN" or "{club name} CHAMPION" per announcement, computed
-- server-side so a gatekeeper never needs direct profile-row access to
-- the creator (blocked by "profiles: gatekeeper read own") — only ever
-- returns this one display string, nothing else about the creator.
CREATE OR REPLACE FUNCTION public.announcement_source_labels(p_announcement_ids UUID[])
RETURNS TABLE (announcement_id UUID, source_label TEXT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    a.id,
    CASE
      WHEN creator.role = 'super_admin' THEN 'SUPER ADMIN'
      WHEN creator.role = 'champion' THEN UPPER(COALESCE(c.name, 'Club') || ' CHAMPION')
      ELSE UPPER(creator.role::text)
    END
  FROM public.announcements a
  JOIN public.profiles creator ON creator.id = a.created_by
  LEFT JOIN public.clubs c ON c.id = a.club_id
  WHERE a.id = ANY (p_announcement_ids);
$$;

GRANT EXECUTE ON FUNCTION public.announcement_source_labels(UUID[]) TO authenticated;

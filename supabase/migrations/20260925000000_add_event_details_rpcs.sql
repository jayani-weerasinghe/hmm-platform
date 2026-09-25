-- Events list / Event details screens (mobile) need real attendee counts
-- and host info that the current RLS genuinely cannot expose from the
-- client:
--   - "registrations: gatekeeper own" scopes event_registrations reads to
--     the caller's own rows only — a gatekeeper cannot see how many OTHER
--     gatekeepers registered for an event, or who they are.
--   - "clubs: gatekeeper read own" scopes clubs to the gatekeeper's own
--     club — but "events: gatekeeper read all" means an event can belong
--     to a DIFFERENT club, whose name would be unreadable.
--   - "profiles: gatekeeper read own" means the event's creating Champion
--     (events.created_by) is never readable by a gatekeeper at all.
-- Both functions below are SECURITY DEFINER to bypass those restrictions
-- internally, but only ever return aggregate counts / a small list of
-- already-public event-attendance names (people who voluntarily
-- registered for a public community program) and a club/host name — no
-- private profile fields (email, phone, role, etc.) are exposed.

-- Bulk per-event registered counts, for the events list's "N/M Seats
-- Filled" text and "Your Next Event"'s attendee count — one round trip
-- for a whole page of events rather than one RPC call per card.
CREATE OR REPLACE FUNCTION public.event_registration_counts(p_event_ids UUID[])
RETURNS TABLE (event_id UUID, registered_count BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT er.event_id, count(*) AS registered_count
  FROM public.event_registrations er
  WHERE er.event_id = ANY (p_event_ids)
  GROUP BY er.event_id;
$$;

GRANT EXECUTE ON FUNCTION public.event_registration_counts(UUID[]) TO authenticated;

-- Event details screen's "Hosted By" + attendee avatar stack. Whether the
-- CALLING gatekeeper is registered is not included here — that's already
-- readable directly by the client via event_registrations RLS ("gatekeeper
-- own"), no bypass needed for that part.
CREATE OR REPLACE FUNCTION public.event_details_extra(p_event_id UUID)
RETURNS TABLE (
  club_name TEXT,
  champion_name TEXT,
  total_registered BIGINT,
  preview_names TEXT[]
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    c.name,
    creator.full_name,
    (SELECT count(*) FROM public.event_registrations er WHERE er.event_id = p_event_id),
    (
      SELECT array_agg(names.full_name)
      FROM (
        SELECT pr.full_name
        FROM public.event_registrations er
        JOIN public.profiles pr ON pr.id = er.gatekeeper_id
        WHERE er.event_id = p_event_id
        ORDER BY er.registered_at ASC
        LIMIT 6
      ) names
    )
  FROM public.events e
  JOIN public.clubs c ON c.id = e.club_id
  LEFT JOIN public.profiles creator ON creator.id = e.created_by
  WHERE e.id = p_event_id;
$$;

GRANT EXECUTE ON FUNCTION public.event_details_extra(UUID) TO authenticated;

-- Champions could already read + insert Gatekeeper profiles in their own
-- club, but had no UPDATE policy at all — so editing, deactivating, or
-- reactivating a Gatekeeper from the (not-yet-built) Champion Web Portal
-- would have silently no-opped under RLS. Scoped identically to the
-- existing "profiles: champion insert gatekeeper" policy: both USING and
-- WITH CHECK require role='gatekeeper' and the row's club to match the
-- champion's own club, so a Champion can edit/deactivate/reactivate a
-- Gatekeeper's own-club record but can never move one to a different club
-- (cross-club reassignment stays a Super-Admin-only action, same as
-- Champion account reassignment).
CREATE POLICY "profiles: champion update own club gatekeeper"
  ON public.profiles FOR UPDATE TO authenticated
  USING (
    public.current_user_role() = 'champion'
    AND role = 'gatekeeper'
    AND club_id = public.current_user_club_id()
  )
  WITH CHECK (
    public.current_user_role() = 'champion'
    AND role = 'gatekeeper'
    AND club_id = public.current_user_club_id()
  );

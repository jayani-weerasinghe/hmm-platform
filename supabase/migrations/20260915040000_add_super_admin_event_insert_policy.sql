-- Events RLS only ever allowed Champions to INSERT (event creation was
-- Champion-only per Story 6.1). The Super Admin "Schedule New Event" modal
-- is an explicit Phase 1 spec deviation (see CLAUDE.md Epic 6 note) that
-- needs its own INSERT policy — without this, every Super Admin create
-- attempt fails RLS with "new row violates row-level security policy".
-- Scoped to INSERT only: no Super Admin edit/delete UI exists yet, so no
-- UPDATE/DELETE policy is added here.

CREATE POLICY "events: super_admin insert" ON public.events
  FOR INSERT
  WITH CHECK (current_user_role() = 'super_admin'::user_role AND created_by = auth.uid());

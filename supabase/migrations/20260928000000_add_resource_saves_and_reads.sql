-- Real backing for the Gatekeeper mobile app's Article Detail "Save" and
-- "Mark as read" buttons — same shape/convention as event_registrations
-- (row presence = has-the-state, delete to undo; RLS scopes each
-- gatekeeper to their own rows only). Two small tables rather than one
-- combined one: save and read are independent toggles, not a single
-- lifecycle, and this mirrors how every other per-user "did X" relation
-- in this schema (event_registrations) is modeled.

CREATE TABLE public.resource_saves (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id   UUID        NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  gatekeeper_id UUID        NOT NULL REFERENCES public.profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (resource_id, gatekeeper_id)
);

CREATE TABLE public.resource_reads (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id   UUID        NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  gatekeeper_id UUID        NOT NULL REFERENCES public.profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (resource_id, gatekeeper_id)
);

ALTER TABLE public.resource_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resource_saves: super_admin read"
  ON public.resource_saves FOR SELECT TO authenticated
  USING (public.current_user_role() = 'super_admin');

CREATE POLICY "resource_saves: gatekeeper own"
  ON public.resource_saves FOR ALL TO authenticated
  USING      (gatekeeper_id = auth.uid())
  WITH CHECK (gatekeeper_id = auth.uid());

CREATE POLICY "resource_reads: super_admin read"
  ON public.resource_reads FOR SELECT TO authenticated
  USING (public.current_user_role() = 'super_admin');

CREATE POLICY "resource_reads: gatekeeper own"
  ON public.resource_reads FOR ALL TO authenticated
  USING      (gatekeeper_id = auth.uid())
  WITH CHECK (gatekeeper_id = auth.uid());

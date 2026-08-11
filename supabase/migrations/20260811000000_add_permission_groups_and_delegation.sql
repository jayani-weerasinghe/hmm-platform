-- Epic 9: Permission Management (Stories 9.0-9.4)
-- Adds Permission Groups (9.3) and Temporary Role Delegation (9.4), plus the
-- effective-permission resolution engine (9.0) that ties together the
-- existing role-default (permissions) and individual-exception
-- (role_overrides) tables from Stories 9.1/9.2 with the new group layer.
--
-- Precedence (most to least specific, "specificity wins" - no blending):
--   1. Individual exception (role_overrides)
--   2. Group setting (group_permissions), deny-overrides on conflict
--   3. Role default (permissions)
-- Delegation (9.4) is layered on top as a separate additive union, not a
-- 4th precedence branch - see effective_permission_with_delegation() below.

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
CREATE TYPE public.permission_source AS ENUM ('individual', 'group', 'role', 'delegated');

-- No 'expired' value: natural run-to-completion never writes a row (status
-- is always computed live from starts_at/ends_at, same as announcements).
CREATE TYPE public.delegation_end_reason AS ENUM ('manual', 'delegator_deactivated');

-- ---------------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------------

CREATE TABLE public.permission_groups (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL UNIQUE,
  description TEXT,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_by  UUID        NOT NULL REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.group_members (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   UUID        NOT NULL REFERENCES public.permission_groups(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  added_by   UUID        NOT NULL REFERENCES public.profiles(id),
  added_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (group_id, user_id)
);

-- Row presence = "this group has an explicit opinion" on the permission.
-- is_enabled = TRUE (Allow) or FALSE (Deny). No row = Not Set / no opinion.
CREATE TABLE public.group_permissions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   UUID        NOT NULL REFERENCES public.permission_groups(id) ON DELETE CASCADE,
  permission TEXT        NOT NULL,
  is_enabled BOOLEAN     NOT NULL,
  updated_by UUID        NOT NULL REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (group_id, permission)
);

-- No status column - active/scheduled/expired is always computed live from
-- starts_at/ends_at/ended_early_at + the delegator's is_active, same pattern
-- as announcements.publish_date/expiry_date.
CREATE TABLE public.role_delegations (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  delegator_id   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  delegate_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  starts_at      TIMESTAMPTZ NOT NULL,
  ends_at        TIMESTAMPTZ NOT NULL,
  ended_early_at TIMESTAMPTZ,
  ended_reason   public.delegation_end_reason,
  created_by     UUID        NOT NULL REFERENCES public.profiles(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at > starts_at),
  CHECK (delegate_id <> delegator_id)
);

CREATE INDEX idx_group_members_user       ON public.group_members(user_id);
CREATE INDEX idx_group_members_group      ON public.group_members(group_id);
CREATE INDEX idx_group_permissions_group  ON public.group_permissions(group_id);
CREATE INDEX idx_role_delegations_delegator ON public.role_delegations(delegator_id);
CREATE INDEX idx_role_delegations_delegate  ON public.role_delegations(delegate_id);
CREATE INDEX idx_role_delegations_window    ON public.role_delegations(starts_at, ends_at);

CREATE TRIGGER trg_permission_groups_updated_at
  BEFORE UPDATE ON public.permission_groups FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RESOLUTION ENGINE (Story 9.0)
-- ---------------------------------------------------------------------------

-- Resolves the effective Allow/Deny for one (user, permission) pair and which
-- layer produced it. SECURITY DEFINER because it reads across role_overrides/
-- group_permissions rows the caller may not have direct SELECT access to
-- (e.g. Super Admin resolving another user) - guarded so only the user
-- themself or a super_admin may resolve a given p_user_id, otherwise this
-- would let any authenticated user snoop on someone else's permissions via
-- RPC, bypassing the self-read-only RLS on role_overrides/group_permissions.
CREATE OR REPLACE FUNCTION public.effective_permission(p_user_id UUID, p_permission TEXT)
RETURNS TABLE (is_enabled BOOLEAN, source public.permission_source, source_detail JSONB)
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_individual public.role_overrides;
  v_role       public.user_role;
  v_role_row   public.permissions;
  v_deny_groups JSONB;
  v_allow_groups JSONB;
BEGIN
  IF p_user_id <> auth.uid() AND public.current_user_role() <> 'super_admin' THEN
    RAISE EXCEPTION 'not authorized to resolve permissions for this user';
  END IF;

  -- 1. Individual exception - highest precedence.
  SELECT * INTO v_individual FROM public.role_overrides
    WHERE user_id = p_user_id AND permission = p_permission;
  IF FOUND THEN
    RETURN QUERY SELECT v_individual.is_enabled, 'individual'::public.permission_source,
      jsonb_build_object('role_override_id', v_individual.id);
    RETURN;
  END IF;

  -- 2. Group settings - deny-overrides if multiple groups disagree.
  SELECT jsonb_agg(jsonb_build_object('id', pg.id, 'name', pg.name))
    INTO v_deny_groups
    FROM public.group_permissions gp
    JOIN public.group_members gm ON gm.group_id = gp.group_id
    JOIN public.permission_groups pg ON pg.id = gp.group_id
    WHERE gm.user_id = p_user_id AND gp.permission = p_permission AND gp.is_enabled = FALSE;

  IF v_deny_groups IS NOT NULL THEN
    RETURN QUERY SELECT FALSE, 'group'::public.permission_source,
      jsonb_build_object('denying_groups', v_deny_groups);
    RETURN;
  END IF;

  SELECT jsonb_agg(jsonb_build_object('id', pg.id, 'name', pg.name))
    INTO v_allow_groups
    FROM public.group_permissions gp
    JOIN public.group_members gm ON gm.group_id = gp.group_id
    JOIN public.permission_groups pg ON pg.id = gp.group_id
    WHERE gm.user_id = p_user_id AND gp.permission = p_permission AND gp.is_enabled = TRUE;

  IF v_allow_groups IS NOT NULL THEN
    RETURN QUERY SELECT TRUE, 'group'::public.permission_source,
      jsonb_build_object('allowing_groups', v_allow_groups);
    RETURN;
  END IF;

  -- 3. Role default - fallback.
  SELECT role INTO v_role FROM public.profiles WHERE id = p_user_id;
  SELECT * INTO v_role_row FROM public.permissions
    WHERE role = v_role AND permission = p_permission;

  IF FOUND THEN
    RETURN QUERY SELECT v_role_row.is_enabled, 'role'::public.permission_source,
      jsonb_build_object('permission_id', v_role_row.id);
  ELSE
    RETURN QUERY SELECT FALSE, 'role'::public.permission_source,
      jsonb_build_object('note', 'no role default configured');
  END IF;
END;
$$;

-- One-call variant for the "view this user's permissions" screen (9.0 Sc07):
-- resolves every permission key the user could possibly be affected by
-- (role defaults + their own overrides + their groups' settings) in one go.
CREATE OR REPLACE FUNCTION public.list_effective_permissions(p_user_id UUID)
RETURNS TABLE (permission TEXT, is_enabled BOOLEAN, source public.permission_source, source_detail JSONB)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT k.permission, ep.is_enabled, ep.source, ep.source_detail
  FROM (
    SELECT DISTINCT p.permission FROM public.permissions p
      JOIN public.profiles pr ON pr.role = p.role WHERE pr.id = p_user_id
    UNION
    SELECT DISTINCT permission FROM public.role_overrides WHERE user_id = p_user_id
    UNION
    SELECT DISTINCT gp.permission FROM public.group_permissions gp
      JOIN public.group_members gm ON gm.group_id = gp.group_id WHERE gm.user_id = p_user_id
  ) k
  CROSS JOIN LATERAL public.effective_permission(p_user_id, k.permission) ep;
$$;

-- Active delegations right now: time window + delegator still active.
CREATE OR REPLACE VIEW public.v_active_role_delegations AS
  SELECT rd.*
  FROM public.role_delegations rd
  JOIN public.profiles delegator ON delegator.id = rd.delegator_id
  WHERE rd.ended_early_at IS NULL
    AND NOW() >= rd.starts_at AND NOW() < rd.ends_at
    AND delegator.is_active = TRUE;

-- Story 9.4: delegation is an additive union on top of 9.0's own-permission
-- result, never a replacement/restriction of it - kept as a separate wrapper
-- (not a 4th branch inside effective_permission) so that function stays a
-- pure single-person resolution, and so a delegate's own Allow is never
-- misreported as 'delegated'.
CREATE OR REPLACE FUNCTION public.effective_permission_with_delegation(p_user_id UUID, p_permission TEXT)
RETURNS TABLE (is_enabled BOOLEAN, source public.permission_source, source_detail JSONB)
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_own RECORD;
  v_borrowed RECORD;
BEGIN
  SELECT * INTO v_own FROM public.effective_permission(p_user_id, p_permission);
  IF v_own.is_enabled THEN
    RETURN QUERY SELECT v_own.is_enabled, v_own.source, v_own.source_detail;
    RETURN;
  END IF;

  FOR v_borrowed IN
    SELECT rd.delegator_id, ep.is_enabled
    FROM public.v_active_role_delegations rd
    CROSS JOIN LATERAL public.effective_permission(rd.delegator_id, p_permission) ep
    WHERE rd.delegate_id = p_user_id
  LOOP
    IF v_borrowed.is_enabled THEN
      RETURN QUERY SELECT TRUE, 'delegated'::public.permission_source,
        jsonb_build_object('borrowed_from', v_borrowed.delegator_id);
      RETURN;
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_own.is_enabled, v_own.source, v_own.source_detail;
END;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.permission_groups   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_permissions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_delegations    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "permission_groups: super_admin all"
  ON public.permission_groups FOR ALL TO authenticated
  USING  (public.current_user_role() = 'super_admin')
  WITH CHECK (public.current_user_role() = 'super_admin');

CREATE POLICY "permission_groups: member read"
  ON public.permission_groups FOR SELECT TO authenticated
  USING (id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid()));

CREATE POLICY "group_members: super_admin all"
  ON public.group_members FOR ALL TO authenticated
  USING  (public.current_user_role() = 'super_admin')
  WITH CHECK (public.current_user_role() = 'super_admin');

CREATE POLICY "group_members: read own membership"
  ON public.group_members FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "group_permissions: super_admin all"
  ON public.group_permissions FOR ALL TO authenticated
  USING  (public.current_user_role() = 'super_admin')
  WITH CHECK (public.current_user_role() = 'super_admin');

CREATE POLICY "group_permissions: member read"
  ON public.group_permissions FOR SELECT TO authenticated
  USING (group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid()));

CREATE POLICY "role_delegations: super_admin all"
  ON public.role_delegations FOR ALL TO authenticated
  USING  (public.current_user_role() = 'super_admin')
  WITH CHECK (public.current_user_role() = 'super_admin');

CREATE POLICY "role_delegations: read own"
  ON public.role_delegations FOR SELECT TO authenticated
  USING (delegator_id = auth.uid() OR delegate_id = auth.uid());

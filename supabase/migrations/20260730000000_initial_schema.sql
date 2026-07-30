-- =============================================================================
-- HMM Platform — Initial Schema Migration
-- Phase 1: Web (Super Admin + Champion) + Mobile (Gatekeeper)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
CREATE TYPE public.user_role AS ENUM ('super_admin', 'champion', 'gatekeeper');
CREATE TYPE public.deactivation_reason AS ENUM ('manual', 'club_deactivated');
CREATE TYPE public.resource_type AS ENUM ('video', 'article', 'document', 'other');
CREATE TYPE public.event_type AS ENUM ('qpr_session', 'awareness_program', 'workshop', 'other');
CREATE TYPE public.preferred_language AS ENUM ('en', 'si', 'ta');

-- ---------------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------------

-- clubs (created before profiles because profiles references it)
CREATE TABLE public.clubs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL UNIQUE,
  location    TEXT        NOT NULL,
  description TEXT,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  -- created_by populated after profiles table exists; set via trigger or app layer
  created_by  UUID        REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- profiles — one row per auth.users entry
-- Stores role, club assignment, QPR status, and deactivation tracking.
CREATE TABLE public.profiles (
  id                   UUID                      PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name            TEXT                      NOT NULL,
  email                TEXT                      NOT NULL UNIQUE,
  phone                TEXT,
  role                 public.user_role          NOT NULL,
  is_active            BOOLEAN                   NOT NULL DEFAULT TRUE,
  deactivation_reason  public.deactivation_reason,
  -- Tracks which club triggered a cascade deactivation (Story 7.3).
  -- Null when deactivation_reason = 'manual' or user is active.
  deactivated_club_id  UUID                      REFERENCES public.clubs(id),
  -- Current club assignment. NULL for super_admin.
  club_id              UUID                      REFERENCES public.clubs(id),
  qpr_certification_date DATE,
  -- Stored (not computed) for query performance; always = certification_date + 3 years.
  qpr_expiry_date        DATE,
  preferred_language   public.preferred_language NOT NULL DEFAULT 'en',
  -- Optimistic concurrency control (Story 8.2 Scenario 03).
  version              INTEGER                   NOT NULL DEFAULT 1,
  created_at           TIMESTAMPTZ               NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ               NOT NULL DEFAULT NOW()
);

-- Gatekeeper club assignment history (req: "maintain a history of previous club memberships")
CREATE TABLE public.gatekeeper_club_history (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  gatekeeper_id  UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  club_id        UUID        NOT NULL REFERENCES public.clubs(id),
  assigned_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unassigned_at  TIMESTAMPTZ          -- NULL = current assignment
);

-- Password history for reuse prevention (Stories 1.2/1.3 — last 5 passwords).
-- Application checks this before committing a password change via Edge Function.
CREATE TABLE public.password_history (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Resources — uploaded by Super Admin, visible to Champions & Gatekeepers
CREATE TABLE public.resources (
  id               UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT                  NOT NULL,
  description      TEXT,
  type             public.resource_type  NOT NULL,
  content_url      TEXT,   -- external URL or Storage path (video, document, external article)
  content_text     TEXT,   -- rich text body (article type)
  category         TEXT,
  tags             TEXT[],
  publication_date DATE    NOT NULL,
  created_by       UUID    NOT NULL REFERENCES public.profiles(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Announcements — created by Super Admin (platform-wide) or Champion (club-scoped)
-- club_id IS NULL  → platform-wide (Super Admin)
-- club_id IS NOT NULL → club-specific (Champion)
CREATE TABLE public.announcements (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT        NOT NULL,
  body         TEXT        NOT NULL,
  publish_date TIMESTAMPTZ NOT NULL,
  expiry_date  TIMESTAMPTZ,           -- optional; NULL = never expires
  created_by   UUID        NOT NULL REFERENCES public.profiles(id),
  club_id      UUID        REFERENCES public.clubs(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Events — created by Champions, visible to all roles
CREATE TABLE public.events (
  id               UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT                 NOT NULL,
  type             public.event_type    NOT NULL,
  starts_at        TIMESTAMPTZ          NOT NULL,
  ends_at          TIMESTAMPTZ,
  venue            TEXT                 NOT NULL,
  description      TEXT,
  max_participants INTEGER              CHECK (max_participants > 0),
  club_id          UUID                 NOT NULL REFERENCES public.clubs(id),
  created_by       UUID                 NOT NULL REFERENCES public.profiles(id),
  -- Champions cancel events rather than delete them (Story 6.1 / checklist 2.4)
  is_cancelled     BOOLEAN              NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ          NOT NULL DEFAULT NOW()
);

-- Event registrations (recommended feature — express interest / register)
CREATE TABLE public.event_registrations (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  gatekeeper_id UUID        NOT NULL REFERENCES public.profiles(id),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  attended      BOOLEAN,    -- set by Champion for attendance tracking
  UNIQUE (event_id, gatekeeper_id)
);

-- Permissions — default permission set for champion and gatekeeper roles
-- Super Admin manages this table; all users of a role inherit these unless overridden.
CREATE TABLE public.permissions (
  id          UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  role        public.user_role NOT NULL CHECK (role IN ('champion', 'gatekeeper')),
  permission  TEXT             NOT NULL,
  is_enabled  BOOLEAN          NOT NULL DEFAULT FALSE,
  updated_by  UUID             REFERENCES public.profiles(id),
  updated_at  TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  UNIQUE (role, permission)
);

-- Role overrides — per-user permission overrides that supersede role defaults
CREATE TABLE public.role_overrides (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission  TEXT        NOT NULL,
  is_enabled  BOOLEAN     NOT NULL,
  updated_by  UUID        NOT NULL REFERENCES public.profiles(id),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, permission)
);

-- Audit log — immutable record of admin actions (recommended feature)
CREATE TABLE public.audit_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID        REFERENCES public.profiles(id),  -- NULL = system
  action      TEXT        NOT NULL,  -- e.g. 'club.deactivated', 'champion.created'
  entity_type TEXT        NOT NULL,  -- e.g. 'club', 'champion', 'gatekeeper'
  entity_id   UUID,
  details     JSONB,                 -- free-form context (affected user IDs, old values, etc.)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------------
CREATE INDEX idx_profiles_role        ON public.profiles(role);
CREATE INDEX idx_profiles_club_id     ON public.profiles(club_id);
CREATE INDEX idx_profiles_is_active   ON public.profiles(is_active);
CREATE INDEX idx_profiles_email       ON public.profiles(email);

CREATE INDEX idx_clubs_is_active      ON public.clubs(is_active);

CREATE INDEX idx_gk_history_gk        ON public.gatekeeper_club_history(gatekeeper_id);
CREATE INDEX idx_gk_history_club       ON public.gatekeeper_club_history(club_id);

CREATE INDEX idx_password_history_user ON public.password_history(user_id, created_at DESC);

CREATE INDEX idx_resources_pub_date   ON public.resources(publication_date);
CREATE INDEX idx_resources_type       ON public.resources(type);

CREATE INDEX idx_announcements_pub    ON public.announcements(publish_date);
CREATE INDEX idx_announcements_expiry ON public.announcements(expiry_date);
CREATE INDEX idx_announcements_club   ON public.announcements(club_id);

CREATE INDEX idx_events_starts_at     ON public.events(starts_at);
CREATE INDEX idx_events_club_id       ON public.events(club_id);
CREATE INDEX idx_events_cancelled     ON public.events(is_cancelled);

CREATE INDEX idx_audit_entity         ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_actor          ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_created_at     ON public.audit_logs(created_at DESC);

-- ---------------------------------------------------------------------------
-- UPDATED_AT TRIGGER
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at      BEFORE UPDATE ON public.profiles      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_clubs_updated_at         BEFORE UPDATE ON public.clubs          FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_resources_updated_at     BEFORE UPDATE ON public.resources      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_announcements_updated_at BEFORE UPDATE ON public.announcements  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_events_updated_at        BEFORE UPDATE ON public.events         FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Increment version on every profile update (optimistic concurrency — Story 8.2 Scenario 03)
CREATE OR REPLACE FUNCTION public.increment_profile_version()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_profiles_version
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.increment_profile_version();

-- Auto-populate qpr_expiry_date whenever qpr_certification_date changes
CREATE OR REPLACE FUNCTION public.set_qpr_expiry()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.qpr_certification_date IS NOT NULL THEN
    NEW.qpr_expiry_date = NEW.qpr_certification_date + INTERVAL '3 years';
  ELSE
    NEW.qpr_expiry_date = NULL;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_qpr_expiry
  BEFORE INSERT OR UPDATE OF qpr_certification_date ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_qpr_expiry();

-- ---------------------------------------------------------------------------
-- HELPER FUNCTIONS (used in RLS policies)
-- ---------------------------------------------------------------------------

-- Returns the calling user's role. SECURITY DEFINER so RLS policies can call it
-- without needing SELECT on profiles (avoids recursion).
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- Returns the calling user's current club_id.
CREATE OR REPLACE FUNCTION public.current_user_club_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT club_id FROM public.profiles WHERE id = auth.uid()
$$;

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gatekeeper_club_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_history     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_overrides       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs           ENABLE ROW LEVEL SECURITY;

-- ── profiles ──────────────────────────────────────────────────────────────
-- Super Admin: full read + write on all profiles
CREATE POLICY "profiles: super_admin read all"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.current_user_role() = 'super_admin');

CREATE POLICY "profiles: super_admin update all"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.current_user_role() = 'super_admin');

-- Super Admin creates profiles on behalf of Champions / Gatekeepers
CREATE POLICY "profiles: super_admin insert"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() = 'super_admin');

-- Champion: read own profile + gatekeepers in their club
CREATE POLICY "profiles: champion read"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'champion'
    AND (
      id = auth.uid()
      OR (role = 'gatekeeper' AND club_id = public.current_user_club_id())
    )
  );

-- Champion: update own profile only (club_id & role are not updatable by the user — enforced app-side)
CREATE POLICY "profiles: champion update own"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.current_user_role() = 'champion' AND id = auth.uid());

-- Champion: insert gatekeepers in their own club
CREATE POLICY "profiles: champion insert gatekeeper"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (
    public.current_user_role() = 'champion'
    AND role = 'gatekeeper'
    AND club_id = public.current_user_club_id()
  );

-- Gatekeeper: read own profile only
CREATE POLICY "profiles: gatekeeper read own"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.current_user_role() = 'gatekeeper' AND id = auth.uid());

-- Gatekeeper: update own permitted fields only (phone, preferred_language — enforced app-side)
CREATE POLICY "profiles: gatekeeper update own"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.current_user_role() = 'gatekeeper' AND id = auth.uid());

-- ── clubs ─────────────────────────────────────────────────────────────────
-- Super Admin: full CRUD
CREATE POLICY "clubs: super_admin all"
  ON public.clubs FOR ALL TO authenticated
  USING  (public.current_user_role() = 'super_admin')
  WITH CHECK (public.current_user_role() = 'super_admin');

-- Champion: read their assigned club
CREATE POLICY "clubs: champion read own"
  ON public.clubs FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'champion'
    AND id = public.current_user_club_id()
  );

-- Gatekeeper: read their assigned club
CREATE POLICY "clubs: gatekeeper read own"
  ON public.clubs FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'gatekeeper'
    AND id = public.current_user_club_id()
  );

-- ── gatekeeper_club_history ───────────────────────────────────────────────
CREATE POLICY "gk_history: super_admin all"
  ON public.gatekeeper_club_history FOR ALL TO authenticated
  USING  (public.current_user_role() = 'super_admin')
  WITH CHECK (public.current_user_role() = 'super_admin');

-- Champion: read history for gatekeepers currently in their club
CREATE POLICY "gk_history: champion read club"
  ON public.gatekeeper_club_history FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'champion'
    AND club_id = public.current_user_club_id()
  );

-- Champion: insert history entries when reassigning gatekeepers
CREATE POLICY "gk_history: champion insert"
  ON public.gatekeeper_club_history FOR INSERT TO authenticated
  WITH CHECK (
    public.current_user_role() = 'champion'
    AND club_id = public.current_user_club_id()
  );

-- Gatekeeper: read own history
CREATE POLICY "gk_history: gatekeeper read own"
  ON public.gatekeeper_club_history FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'gatekeeper'
    AND gatekeeper_id = auth.uid()
  );

-- ── password_history ──────────────────────────────────────────────────────
-- Users can only read/insert their own history (checked in application layer via Edge Function)
CREATE POLICY "password_history: own"
  ON public.password_history FOR ALL TO authenticated
  USING    (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── resources ─────────────────────────────────────────────────────────────
-- Super Admin: full CRUD
CREATE POLICY "resources: super_admin all"
  ON public.resources FOR ALL TO authenticated
  USING  (public.current_user_role() = 'super_admin')
  WITH CHECK (public.current_user_role() = 'super_admin');

-- Champion & Gatekeeper: read published resources (publication_date <= today)
CREATE POLICY "resources: champion read published"
  ON public.resources FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'champion'
    AND publication_date <= CURRENT_DATE
  );

CREATE POLICY "resources: gatekeeper read published"
  ON public.resources FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'gatekeeper'
    AND publication_date <= CURRENT_DATE
  );

-- ── announcements ─────────────────────────────────────────────────────────
-- Super Admin: full CRUD (all announcements including future-scheduled)
CREATE POLICY "announcements: super_admin all"
  ON public.announcements FOR ALL TO authenticated
  USING  (public.current_user_role() = 'super_admin')
  WITH CHECK (public.current_user_role() = 'super_admin');

-- Champion read: active platform-wide + all their club's announcements (for management)
CREATE POLICY "announcements: champion read"
  ON public.announcements FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'champion'
    AND (
      -- Active platform-wide announcements (Super Admin authored)
      (club_id IS NULL
        AND NOW() >= publish_date
        AND (expiry_date IS NULL OR NOW() < expiry_date))
      -- All their club's announcements (for Champion to manage)
      OR club_id = public.current_user_club_id()
    )
  );

-- Champion insert: own club only
CREATE POLICY "announcements: champion insert"
  ON public.announcements FOR INSERT TO authenticated
  WITH CHECK (
    public.current_user_role() = 'champion'
    AND club_id = public.current_user_club_id()
    AND created_by = auth.uid()
  );

-- Champion update/delete: own announcements only
CREATE POLICY "announcements: champion update own"
  ON public.announcements FOR UPDATE TO authenticated
  USING (
    public.current_user_role() = 'champion'
    AND created_by = auth.uid()
  );

CREATE POLICY "announcements: champion delete own"
  ON public.announcements FOR DELETE TO authenticated
  USING (
    public.current_user_role() = 'champion'
    AND created_by = auth.uid()
  );

-- Gatekeeper: read active announcements (platform-wide + own club)
CREATE POLICY "announcements: gatekeeper read active"
  ON public.announcements FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'gatekeeper'
    AND NOW() >= publish_date
    AND (expiry_date IS NULL OR NOW() < expiry_date)
    AND (club_id IS NULL OR club_id = public.current_user_club_id())
  );

-- ── events ────────────────────────────────────────────────────────────────
-- Super Admin: read-only (event creation is Champions only — Story 6.1 Scenario 06)
CREATE POLICY "events: super_admin read all"
  ON public.events FOR SELECT TO authenticated
  USING (public.current_user_role() = 'super_admin');

-- Champion: read ALL events (shared calendar — Story 6.1 + checklist 2.4)
CREATE POLICY "events: champion read all"
  ON public.events FOR SELECT TO authenticated
  USING (public.current_user_role() = 'champion');

-- Champion: create events for their own club
CREATE POLICY "events: champion insert"
  ON public.events FOR INSERT TO authenticated
  WITH CHECK (
    public.current_user_role() = 'champion'
    AND club_id = public.current_user_club_id()
    AND created_by = auth.uid()
  );

-- Champion: edit events in their club (any champion of the club, not just creator)
CREATE POLICY "events: champion update club events"
  ON public.events FOR UPDATE TO authenticated
  USING (
    public.current_user_role() = 'champion'
    AND club_id = public.current_user_club_id()
  );

-- Events are cancelled (is_cancelled = TRUE), not physically deleted — no DELETE policy for champions

-- Gatekeeper: read all events (full calendar view — req 6.3)
CREATE POLICY "events: gatekeeper read all"
  ON public.events FOR SELECT TO authenticated
  USING (public.current_user_role() = 'gatekeeper');

-- ── event_registrations ───────────────────────────────────────────────────
-- Super Admin: read all
CREATE POLICY "registrations: super_admin read"
  ON public.event_registrations FOR SELECT TO authenticated
  USING (public.current_user_role() = 'super_admin');

-- Champion: read + update (attendance) for events in their club
CREATE POLICY "registrations: champion club events"
  ON public.event_registrations FOR ALL TO authenticated
  USING (
    public.current_user_role() = 'champion'
    AND event_id IN (
      SELECT id FROM public.events WHERE club_id = public.current_user_club_id()
    )
  )
  WITH CHECK (
    public.current_user_role() = 'champion'
    AND event_id IN (
      SELECT id FROM public.events WHERE club_id = public.current_user_club_id()
    )
  );

-- Gatekeeper: manage own registrations
CREATE POLICY "registrations: gatekeeper own"
  ON public.event_registrations FOR ALL TO authenticated
  USING    (public.current_user_role() = 'gatekeeper' AND gatekeeper_id = auth.uid())
  WITH CHECK (public.current_user_role() = 'gatekeeper' AND gatekeeper_id = auth.uid());

-- ── permissions ───────────────────────────────────────────────────────────
-- Super Admin: full CRUD
CREATE POLICY "permissions: super_admin all"
  ON public.permissions FOR ALL TO authenticated
  USING  (public.current_user_role() = 'super_admin')
  WITH CHECK (public.current_user_role() = 'super_admin');

-- Champions read their role's permissions
CREATE POLICY "permissions: champion read"
  ON public.permissions FOR SELECT TO authenticated
  USING (public.current_user_role() = 'champion' AND role = 'champion');

-- Gatekeepers read their role's permissions
CREATE POLICY "permissions: gatekeeper read"
  ON public.permissions FOR SELECT TO authenticated
  USING (public.current_user_role() = 'gatekeeper' AND role = 'gatekeeper');

-- ── role_overrides ────────────────────────────────────────────────────────
-- Super Admin: full CRUD
CREATE POLICY "overrides: super_admin all"
  ON public.role_overrides FOR ALL TO authenticated
  USING  (public.current_user_role() = 'super_admin')
  WITH CHECK (public.current_user_role() = 'super_admin');

-- Any authenticated user: read their own overrides (to resolve effective permissions)
CREATE POLICY "overrides: read own"
  ON public.role_overrides FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ── audit_logs ────────────────────────────────────────────────────────────
-- Super Admin: read all logs
CREATE POLICY "audit: super_admin read"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (public.current_user_role() = 'super_admin');

-- Insert is performed via service role / Edge Functions only — no user-facing INSERT policy

-- ---------------------------------------------------------------------------
-- SEED: default permission set (Story 9.1)
-- ---------------------------------------------------------------------------
INSERT INTO public.permissions (role, permission, is_enabled) VALUES
  -- Champion defaults (all ON — Super Admin can restrict per-user via role_overrides)
  ('champion', 'create_announcements', TRUE),
  ('champion', 'manage_events',        TRUE),
  ('champion', 'manage_gatekeepers',   TRUE),
  ('champion', 'view_resources',       TRUE),
  ('champion', 'view_announcements',   TRUE),
  ('champion', 'view_events',          TRUE),
  -- Gatekeeper defaults
  ('gatekeeper', 'view_resources',       TRUE),
  ('gatekeeper', 'view_announcements',   TRUE),
  ('gatekeeper', 'view_events',          TRUE),
  ('gatekeeper', 'register_for_events',  TRUE);

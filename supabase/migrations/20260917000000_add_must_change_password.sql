-- Champions and Gatekeepers are now created with a system-generated
-- temporary password (emailed directly, alongside a plain login link)
-- instead of Supabase's magic-link invite flow, which can't embed
-- arbitrary custom content like a generated password. This flag forces a
-- "Set Your Password" screen on first login before the user can reach
-- anything else — cleared by the app the moment a real password is set
-- (see setInitialPasswordAction in actions/auth.ts), never toggled
-- directly by any other code path.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;

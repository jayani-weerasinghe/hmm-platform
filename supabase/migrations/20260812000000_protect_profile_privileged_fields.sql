-- Defense-in-depth for the "champion/gatekeeper update own" RLS policies
-- (Story 8.2 Sc05): role, club_id, is_active, deactivation_reason, and
-- deactivated_club_id are documented as "not updatable by the user —
-- enforced app-side" (see the column comment on profiles.role), but neither
-- self-update policy has a WITH CHECK, so nothing at the database layer
-- actually stopped a self-authored UPDATE from changing them. No Champion or
-- Gatekeeper self-service edit UI exists yet, so this isn't exploitable
-- today, but pins these columns to their prior value whenever a
-- non-super-admin updates their own row, closing the gap before that UI is
-- ever built.
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_fields()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF public.current_user_role() <> 'super_admin' AND auth.uid() = NEW.id THEN
    NEW.role                = OLD.role;
    NEW.club_id             = OLD.club_id;
    NEW.is_active           = OLD.is_active;
    NEW.deactivation_reason = OLD.deactivation_reason;
    NEW.deactivated_club_id = OLD.deactivated_club_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_protect_privileged_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileged_fields();

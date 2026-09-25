-- Home screen's "1,240 Certified" stat card needs a platform-wide count of
-- gatekeepers with an active QPR certification, plus an honest month-over-
-- month figure for its trend badge. Neither is computable from the client:
-- "profiles: gatekeeper read own" (see initial schema) scopes a
-- gatekeeper's own SELECT to their own row only, so a plain client-side
-- `count(*)` against profiles would return 0 or 1, not a real platform
-- total. SECURITY DEFINER here bypasses RLS internally but only ever
-- returns two aggregate counts — no individual row/profile data is
-- exposed, so granting it to any authenticated user (any role) is safe.
CREATE OR REPLACE FUNCTION public.qpr_certification_stats()
RETURNS TABLE (total_certified BIGINT, certified_this_month BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    count(*) FILTER (WHERE qpr_expiry_date >= CURRENT_DATE) AS total_certified,
    count(*) FILTER (
      WHERE qpr_expiry_date >= CURRENT_DATE
        AND qpr_certification_date >= date_trunc('month', CURRENT_DATE)
    ) AS certified_this_month
  FROM public.profiles
  WHERE role = 'gatekeeper';
$$;

GRANT EXECUTE ON FUNCTION public.qpr_certification_stats() TO authenticated;

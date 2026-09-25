-- Gatekeeper mood check-in. Backs both the post-login full-screen check-in
-- (HMM_Post_Login_Mood_Checkin_Code.md) and the Home screen's small mood
-- row — both use the same heavy/low/okay/good/great vocabulary and the
-- same table, by design (one concept, two entry points, not two mood
-- systems). Not yet applied live as of this migration's last edit —
-- checked directly against the project (PGRST205, "Could not find the
-- table") before writing this file, not assumed.
-- One row per check-in (not one row per gatekeeper), so the app can show
-- "today's" mood without losing history, and a Home-row tap after the
-- post-login check-in adds a new row rather than editing the earlier one.
CREATE TABLE public.mood_checkins (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  gatekeeper_id  UUID         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mood           TEXT         NOT NULL CHECK (mood IN ('heavy', 'low', 'okay', 'good', 'great')),
  checked_in_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX mood_checkins_gatekeeper_id_checked_in_at_idx
  ON public.mood_checkins (gatekeeper_id, checked_in_at DESC);

ALTER TABLE public.mood_checkins ENABLE ROW LEVEL SECURITY;

-- A gatekeeper manages only their own check-ins. No Champion/Super Admin
-- read policy yet — nothing in this app currently surfaces mood data to
-- either role, and this is explicitly a private, self-reported wellbeing
-- signal, so no other-role access is added speculatively.
CREATE POLICY "mood_checkins: gatekeeper manage own" ON public.mood_checkins
  FOR ALL
  USING (gatekeeper_id = auth.uid())
  WITH CHECK (gatekeeper_id = auth.uid());

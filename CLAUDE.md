# HMM Platform

Healing Minds Matter (HMM) Phase 1: web app (Super Admin + Champion) and
mobile app (Gatekeeper) for managing a network of QPR-certified Gatekeepers
across clubs.

## Stack
- Database/Auth: Supabase (Postgres + Supabase Auth + Row Level Security for RBAC)
- Web: Next.js (App Router), deployed on Vercel
- Mobile: React Native + Expo, built via EAS

## Roles
- Super Admin: system-wide access, web only
- Champion: manages one club, web only
- Gatekeeper: mobile only, onboarded by a Champion

## Source of truth
Requirements and acceptance criteria live in project root ("Phase 1 - Super
Admin User Stories.md"). Always check that file before implementing a feature
— build to the acceptance criteria exactly, including edge cases (e.g. club
deactivation cascading to Champions/Gatekeepers, permission overrides,
password reuse rules).

## Conventions
- One epic/story = one focused set of commits, not everything at once.
- Every new table needs a Row Level Security policy before it ships.
- Run and pass relevant tests before marking a story done.

## Progress Log

### Sprint 1 — COMPLETE (all ACs verified 2026-08-03, re-audited against live code
and fixed 2026-08-12 — see "2026-08-12 full-platform audit" note at the bottom
of this log before trusting old "✅" claims elsewhere; several were inaccurate)

**Epic 1 — Authentication & RBAC (Stories 1.1–1.4)** ✅ (re-verified 2026-08-12)
- Login with RBAC redirect, generic error (no field hint), deactivated-account
  check (distinguishes club_deactivated vs manual).
- Forgot password: always-generic response (no email enumeration), Supabase
  time-limited reset link, complexity validation (8 chars, upper, lower, number,
  symbol, no name/email, not common — 2026-08-12: rewrote the common-password
  check to normalize leetspeak substitutions and match on a root-word list
  instead of exact strings, since the original exact-match list almost never
  fired), password-reuse prevention (last 5, bcrypt), confirmation match,
  audit log written on successful reset.
- Change password: current-password verify, same complexity rules, reuse
  prevention, match check, cannot reuse current password, audit log written on
  successful change.
- **2026-08-12 fixes**: `resetPasswordAction` now signs out the recovery
  session before redirecting to `/login?reset=success` — previously the
  still-authenticated recovery session got silently bounced back to the
  dashboard by middleware, so the reset-success message was unreachable.
  `changePasswordAction` now actually calls `supabase.auth.signOut({scope:
  'others'})` after a successful change (Sc07) — it previously just assumed
  Supabase did this automatically and never called it. `login-form.tsx` now
  renders `club_inactive`/`account_inactive` (in addition to `session_expired`)
  so the message from a forced mid-session logout isn't dropped.
- Session: 20-min idle timeout, 2-min warning modal with countdown; manual
  logout → /login; idle timeout → /login?error=session_expired (shows
  "session expired" message).
- Outstanding (infrastructure, not code): no transactional email provider is
  configured, so password-reset/change confirmation emails (1.2 Sc09, 1.3
  Sc08) are not actually sent. The UI no longer claims one was sent (fixed
  2026-08-12 — it previously did, which was worse than just missing).

**Epic 2 — Super Admin Dashboard (Story 2.1)** ✅ (rebuilt 2026-08-12 — see audit note)
- All 6 spec widgets now actually render on the live page (an 2026-08-12 audit
  found the *previous* "✅" was wrong: the live page rendered a different,
  simpler set of components than the correctly-built ones this log claimed
  were wired in — 2 of 6 elements didn't render at all, using correctly-built-
  but-orphaned widget files instead):
  1. Active Gatekeepers per Club — `BarChartWidget`, sorted descending, hover
     tooltips, View All modal (>10 clubs).
  2. Total Active Champions — KPI tile (top row).
  3. Club Onboarding Progress — `OnboardingWidget` (bar chart, bars driven by
     actual per-period onboarding counts, not a static ratio), This Month
     (default)/Last Month/This Quarter filter visible directly on the widget,
     independent of other widgets.
  4. Club-wise Gatekeeper Count — `StackedBarWidget` (active/inactive
     segments), legend, hover tooltips, View All modal.
  5. Upcoming Events — KPI tile (top row, clickable → /super-admin/events) +
     mini-list of next 3 via `EventsWidget`; Next 7 Days/Next 30
     Days(default)/All Upcoming filter, independent of other widgets.
  6. QPR Certified — KPI tile showing the full `count/total (pct%)` format
     from the spec's own example (was previously just a rounded percentage
     with no total), plus a supplementary donut-ring card.
- Top row is now exactly the 3 KPI tiles the spec's Layout Notes call for
  (#2/#5/#6) — a 4th "total active Gatekeepers" tile that wasn't one of the
  three was removed (redundant with the new #1 chart).
- `components/dashboard/club-onboarding-card.tsx` and `kpi-tile.tsx` (the
  files that were actually live before this fix) are deleted — superseded by
  `bar-chart-widget.tsx`/`stacked-bar-widget.tsx`/`onboarding-widget.tsx`,
  which were already correct and just needed to be imported into
  `app/(dashboard)/super-admin/page.tsx`.
- Active-clubs-only filter on all widgets (this part was already correct).
  Zero-states handled.

**Epic 7 — Club Management (Stories 7.1–7.4)** ✅ (re-verified 2026-08-12)
- Create club: unique club_code + name, duplicate check, status Active on
  creation, audit log.
- Edit club: name/location/description, audit log.
- Deactivate: cascades is_active=false to all active Champions/Gatekeepers
  (tagged deactivation_reason='club_deactivated', deactivated_club_id set).
  Champion web login blocked with club-inactive message (Gatekeeper login
  blocking can't be verified/isn't applicable — no Gatekeeper mobile app
  exists yet to enforce it in). Audit log lists affected users.
- Reactivate: restores only cascade-tagged users for that specific club;
  manually deactivated users unchanged. Audit log.
- Club list: name, location, status, active-champion **name(s)** (2026-08-12:
  was previously just a count; also shows an amber "No active Champion" flag
  for active clubs with none — see Epic 8 note); search by name, filter by
  status.
- Club detail: full info card + Champions table + Gatekeepers table, plus the
  same persistent "No active Champion" flag (2026-08-12).

**Epic 3 — Profile Management (Story 3.1)** ✅ (fixed 2026-08-12)
- View own profile: name, email, contact info (phone), role, access level —
  all displayed at /super-admin/profile.
- **2026-08-12 fixes**: "Access level" was a hardcoded string that always
  read "Full system access (Super Admin)" regardless of who was viewing —
  now derived from `profile.role` via a label map. The route also had no role
  guard (unlike sibling `/super-admin/*` pages) — added
  `if (profile.role !== 'super_admin') redirect(...)`.
- Update permitted fields: full_name and phone editable via server action;
  success/error feedback shown inline; audit log written on save.
- Restricted fields: login email and role displayed as read-only inputs
  (bg-gray-50, cursor-not-allowed) with explanatory captions.
- Password change: links to existing /settings/change-password (Story 1.3),
  not rebuilt here.
- Nav: "My Profile" link in the bottom sidebar section (amber active state);
  top-bar name+avatar is a clickable link to the profile page.

**Epic 8 — Champion Account Management (Stories 8.1–8.4)** ✅ (re-verified 2026-08-12)
- Create: Supabase invite email (welcome + set-password link), duplicate-email
  check, audit log. One club per Champion enforced at data model level (a
  single scalar `club_id` column — structurally impossible to double-assign,
  not an active guard clause, but functionally equivalent to the AC).
- Edit: name/email/phone/club with real OCC (version column, enforced via a
  conditional `UPDATE ... WHERE version = knownVersion` whose affected-row
  count is checked — verified this isn't cosmetic); conflict detected →
  "reload and retry" prompt; email synced to auth.users on change; audit log.
- Deactivate: is_active=false (reason='manual'), club and data preserved,
  audit log. Sole-champion-deactivated warning is now **persistent**
  (2026-08-12: previously only a one-time toast at the moment of
  deactivation, with nothing shown if you navigated away and came back — see
  the Epic 7 club list/detail flag).
- Reactivate: club-active check enforced (blocked if club inactive), current
  club shown with option to reassign before confirming, audit log.
- Champion list: name, club, status; search by name, filter by club or status.
- **2026-08-12**: added a `WITH CHECK`-equivalent DB trigger
  (`protect_profile_privileged_fields`, migration 20260812000000) that pins
  `role`/`club_id`/`is_active`/`deactivation_reason`/`deactivated_club_id` to
  their prior value whenever a non-super-admin updates their own `profiles`
  row — closes a latent privilege-escalation gap in the "champion/gatekeeper
  update own" RLS policies (they had no `WITH CHECK` at all) before any
  Champion/Gatekeeper self-service edit UI gets built.
- Outstanding (infrastructure): email notifications to Champions on
  Super-Admin-initiated edits (8.2 Sc04) and on reactivation (8.3 Sc06)
  require a transactional email integration (Resend/SendGrid) not yet set up.

**Epic 4 — Resource Management (Stories 4.1–4.2)** ✅ (verified 2026-08-10)
- Upload: video (file upload or external URL), article (rich-text-ish body
  and/or external link), document (file upload; PDF/Word/PPT/txt), other
  (file or URL) — title/description/category/publication_date common fields,
  missing-required-field blocked with inline error.
- Files stored in private Supabase Storage bucket `resources`
  (migration 20260810000000); `resources.content_url` holds either an
  http(s) URL or a bucket-relative storage path (disambiguated by regex on
  read). Super Admin list generates short-lived signed URLs per row for
  View/Download. RLS on `storage.objects` mirrors the `resources` table:
  super_admin all, champion/gatekeeper read-only.
- Edit: replace file/URL/text, old stored file deleted from bucket on
  replacement. Delete: removes row and any associated stored file.
- **Storage upload gotcha**: uploading the native `File` from a server
  action's `FormData` directly to `admin.storage.from(...).upload()` fails;
  convert via `Buffer.from(await file.arrayBuffer())` first (see
  `actions/resources.ts`).
- **2026-08-12 visual redesign** (list/create/edit pages only — no functional
  change): re-skinned to match `Design/resources-design.html` +
  `resources-design.png`, extracted via computed-style inspection in a real
  browser (the HTML is a self-unpacking "bundled" export — reading it as
  static text shows only a loading shim, it must be rendered). New files:
  `fonts.ts` (Archivo + Manrope, scoped to this section only — the rest of
  the app stays on Plus Jakarta Sans/Inter), `design-tokens.ts` (colors/type
  labels), `resource-type-icon.tsx`, `resource-card.tsx`, `resource-section.tsx`,
  `add-resource-card.tsx`, `stat-tile.tsx`. Resources are grouped into
  card-grid sections by their existing free-text `category` field (not
  `type` — the mockup's categories don't map to our type enum). The mockup
  shows fabricated LMS-style metrics (Active Learners, Completion Rate,
  photo thumbnails, lesson/view counts) that don't exist in this schema —
  per an explicit decision with the user, these were replaced with only
  real, honest data (Total Resources / Published This Month / by-type
  breakdown; a type-colored icon block instead of a photo) rather than
  fabricated or schema-expanded to match. "View all →" on a section is a
  client-side expand toggle (>3 items), not a new page/feature.

**Epic 5 — Announcement Management (Stories 5.1–5.2)** ✅ (verified 2026-08-10)
- Create: title/body/publish_date (date, immediate or future — RLS's
  `NOW() >= publish_date` check makes future-scheduled announcements go
  live automatically with no cron needed) + optional expiry_date (RLS's
  `NOW() < expiry_date` hides it once passed). Super-Admin announcements
  are always platform-wide (`club_id = NULL`).
- List shows a computed status badge (Scheduled / Active / Expired).
  Edit/Delete both supported.

**Epic 9 — Permission Management (Stories 9.0–9.4)** ✅ (verified 2026-08-11)
- User stories doc was updated mid-project: Epic 9 grew from 2 stories to 5
  (9.0 Effective Permission Resolution, 9.1 Role Defaults, 9.2 Individual
  Exceptions, 9.3 Permission Groups, 9.4 Temporary Role Delegation). Full
  data-model plan (migration 20260811000000) was written and approved before
  any code — see `.claude/plans` history for that session if needed.
- New tables: `permission_groups`, `group_members`, `group_permissions`
  (row presence = has-an-opinion; `is_enabled` = Allow/Deny; no row = Not
  Set — the group UI is a 3-way Not Set/Allow/Deny control, not a checkbox,
  specifically so 9.0's deny-overrides scenario is reachable), `role_delegations`
  (no status column — Scheduled/Active/Expired is always computed live from
  `starts_at`/`ends_at`/`ended_early_at` + the delegator's `profiles.is_active`,
  same pattern as `announcements`).
- Resolution engine: `public.effective_permission(user_id, permission)` —
  precedence Individual (`role_overrides`) > Group (`group_permissions`,
  deny-overrides on conflict) > Role default (`permissions`) — returns which
  layer decided, for the UI. `public.effective_permission_with_delegation()`
  wraps it: additive OR against the delegator's own effective result while an
  active `role_delegations` row exists; never restricts the delegate's own
  access. `public.list_effective_permissions()` is the one-call variant for a
  per-user permissions view. All SECURITY DEFINER with an internal
  self-or-super_admin guard (verified via a real authenticated-session smoke
  test, not just service-role).
- Deactivating a Champion (manual, or cascaded via club deactivation) now also
  ends any `role_delegations` row where that user is the delegator
  (`endDelegationsForDeactivatedUser` in `actions/permissions.ts`, called from
  `actions/champions.ts` and `actions/clubs.ts`) — the access itself already
  vanishes live via the `is_active` check in the resolution engine; this just
  stamps `ended_reason='delegator_deactivated'` and writes the audit row.
- Decisions made explicitly with the user before building: group deny needs
  the 3-way control (not allow-only); delegation "activated"/"expired" are
  NOT synthesized as audit events (live status badge only, no cron in this
  app — same limitation already accepted for announcements); 9.4 is
  Super-Admin-managed for any user this phase, no Champion self-service flow.
- **Found and fixed a pre-existing bug while testing**: the Champions list/
  detail/reactivate pages' `profiles.select(...clubs(...))` embed was
  ambiguous (`profiles` has two FKs to `clubs`: `club_id` and
  `deactivated_club_id`) and PostgREST silently errored, which the pages
  swallowed by only destructuring `{ data }` — so it rendered as an empty
  "no champions yet" list instead of surfacing the error. This had been
  latent since Epic 7/8 shipped; never caught because no real champions with
  a `club_id` existed in the DB until Epic 9 testing created some. Fixed by
  disambiguating to `clubs!profiles_club_id_fkey(...)` in all three files.

**Epic 6 — Event & Calendar (Story 6.1)** ✅ (verified 2026-08-11)
- Super Admin read-only calendar at `/super-admin/events`: Month grid
  (Monday-start, hand-rolled — no calendar library) and List view, toggled
  and fully driven by URL params (`view`/`year`/`month`/`club`/`type`/`event`)
  rather than local component state, specifically so opening/closing an
  event's detail (Scenario 04) always returns to the exact same calendar
  position without needing separate client-side state to track it.
- Event tiles color-coded by type (`event-type.ts`): QPR session blue,
  awareness program purple, workshop green, other gray.
  `is_cancelled=true` events excluded from both views (Champions cancel
  rather than delete events, per Epic 6/checklist 2.4 — matches the existing
  dashboard `EventsWidget` convention).
- Detail view is a centered modal (backdrop-click or × closes) — title,
  type, date/time (range if `ends_at` set), venue, description (omitted
  entirely if empty), max participants (`Not specified` if null), owning
  club. No edit/delete controls anywhere (Champion-only per Phase 1).
- Filter by club and/or event type, combinable, via plain `<select>`s that
  push URL updates.
- No events exist yet in the DB (Champion-side event creation is still
  blocked) — verified with temporary seeded test events across clubs/types/
  dates, then removed; the page's empty state was also checked.

### 2026-08-12 full-platform audit
All 9 Super Admin epics were independently re-audited scenario-by-scenario
against the live code (5 parallel research agents, one per Epic 1/2/3/7/8;
Epics 4/5/6/9 were already fresh from this same week and re-checked directly)
before being marked complete. This caught several real bugs that earlier
"✅ verified" notes had missed or gotten backwards — see the per-epic notes
above for what was actually wrong and how it was fixed. Lesson for future
sessions: a "✅" in this log reflects what was true *at the time it was
verified against real test data* — an epic having shipped and been reviewed
once doesn't mean a later change didn't quietly break it (Epic 2's dashboard
is the clearest example: the log claimed a fix had landed, but the live page
was actually using a different, earlier draft of the components). When in
doubt, re-verify against current code rather than trusting the log.

Genuinely still outstanding after this audit (not fixed, by design — see
per-epic notes for why):
- Transactional email (Resend/SendGrid or similar) is not configured anywhere
  in this app. This blocks: password reset/change confirmation emails (1.2
  Sc09, 1.3 Sc08), and Champion notification emails on Super-Admin-initiated
  edits/reactivation (8.2 Sc04, 8.3 Sc06). All affected UI copy has been
  corrected to not claim an email was sent when none was.
- Gatekeeper login-blocking on club/account deactivation (7.3 Sc01, the
  Gatekeeper half) can't be enforced or verified — there's no Gatekeeper
  mobile app or API surface in this repo at all yet for it to apply to.

### Not started yet
- Everything on the Champion side (Gatekeeper management, Champion
  dashboard, events, announcements, resource access) — BLOCKED until
  Champion user stories are written by the BA.
- Everything on the Gatekeeper mobile app — BLOCKED until Gatekeeper user
  stories exist, and until the web app's core features are further along.
- Recommended extras (push notifications, attendance tracking, announcement
  read tracking, audit log UI, mood tracker) — deferred, time-permitting.

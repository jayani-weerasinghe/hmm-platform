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

### Sprint 1 — COMPLETE (all ACs verified 2026-08-03)

**Epic 1 — Authentication & RBAC (Stories 1.1–1.4)** ✅
- Login with RBAC redirect, generic error (no field hint), deactivated-account
  check (distinguishes club_deactivated vs manual).
- Forgot password: always-generic response (no email enumeration), Supabase
  time-limited reset link, complexity validation (8 chars, upper, lower, number,
  symbol, no name/email, not common), password-reuse prevention (last 5, bcrypt),
  confirmation match, audit log written on successful reset.
- Change password: current-password verify, same complexity rules, reuse
  prevention, match check, cannot reuse current password, audit log written on
  successful change (Sc06 fix applied 2026-08-03).
- Session: 20-min idle timeout, 2-min warning modal with countdown; manual
  logout → /login; idle timeout → /login?error=session_expired (shows
  "session expired" message).
- Outstanding (infrastructure, not code): confirmation emails after
  password-reset/change depend on Supabase Auth email template configuration
  (1.2 Sc09, 1.3 Sc08).

**Epic 2 — Super Admin Dashboard (Story 2.1)** ✅
- All 6 spec widgets rendered (layout fixed 2026-08-03 to use proper widget
  components; previously dashboard page was rendering simplified KPI tiles
  instead of the full chart widgets):
  1. Active Gatekeepers per Club — BarChartWidget, sorted descending,
     hover tooltips, View All modal (>10 clubs).
  2. Total Active Champions — KPI tile.
  3. Club Onboarding Progress — OnboardingWidget (bar chart), This Month
     (default)/Last Month/This Quarter filter, independent of other widgets.
  4. Club-wise Gatekeeper Count — StackedBarWidget (active/inactive segments),
     legend, hover tooltips, View All modal.
  5. Upcoming Events — KPI tile (clickable → /super-admin/events) + mini-list
     of next 3 via EventsWidget; Next 7 Days/Next 30 Days(default)/All Upcoming
     filter, independent of other widgets.
  6. QPR Certified — KPI tile + CSS donut ring showing % valid; expiring-soon
     count shown when > 0.
- Active-clubs-only filter on all widgets. Zero-states handled.

**Epic 7 — Club Management (Stories 7.1–7.4)** ✅
- Create club: unique club_code + name, duplicate check, status Active on
  creation, audit log.
- Edit club: name/location/description, audit log.
- Deactivate: cascades is_active=false to all active Champions/Gatekeepers
  (tagged deactivation_reason='club_deactivated', deactivated_club_id set).
  Login blocked with club-inactive message. Audit log lists affected users.
- Reactivate: restores only cascade-tagged users for that specific club;
  manually deactivated users unchanged. Audit log.
- Club list: name, location, status, active-champion count; search by name,
  filter by status.
- Club detail: full info card + Champions table + Gatekeepers table.

**Epic 3 — Profile Management (Story 3.1)** ✅
- View own profile: name, email, contact info (phone), role, access level —
  all displayed at /super-admin/profile.
- Update permitted fields: full_name and phone editable via server action;
  success/error feedback shown inline; audit log written on save.
- Restricted fields: login email and role displayed as read-only inputs
  (bg-gray-50, cursor-not-allowed) with explanatory captions.
- Password change: links to existing /settings/change-password (Story 1.3),
  not rebuilt here.
- Nav: "My Profile" link in the bottom sidebar section (amber active state);
  top-bar name+avatar is a clickable link to the profile page.

**Epic 8 — Champion Account Management (Stories 8.1–8.4)** ✅
- Create: Supabase invite email (welcome + set-password link), duplicate-email
  check, audit log. One club per Champion enforced at data model level.
- Edit: name/email/phone/club with OCC (version column); conflict detected →
  "reload and retry" prompt; email synced to auth.users on change; audit log.
- Deactivate: is_active=false (reason='manual'), sole-champion warning shown
  in UI, club and data preserved, audit log.
- Reactivate: club-active check enforced (blocked if club inactive), current
  club shown with option to reassign before confirming, audit log.
- Champion list: name, club, status; search by name, filter by club or status.
- Outstanding (infrastructure): email notifications to Champions on
  Super-Admin-initiated edits (8.2 Sc04) and on reactivation (8.3 Sc06)
  require a transactional email integration (Resend/SendGrid) not yet set up.

### Not started yet
- Resource Management and Announcement Management (Epic 4 & 5).
- Event & Calendar view, Super Admin read-only (Epic 6).
- Permission Management (Epic 9).
- Everything on the Champion side (Gatekeeper management, Champion
  dashboard, events, announcements, resource access) — BLOCKED until
  Champion user stories are written by the BA.
- Everything on the Gatekeeper mobile app — BLOCKED until Gatekeeper user
  stories exist, and until the web app's core features are further along.
- Recommended extras (push notifications, attendance tracking, announcement
  read tracking, audit log UI, mood tracker) — deferred, time-permitting.

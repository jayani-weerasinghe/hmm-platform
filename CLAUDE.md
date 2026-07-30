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
Requirements and acceptance criteria live in /docs. Always check /docs
before implementing a feature — build to the acceptance criteria exactly,
including edge cases (e.g. club deactivation cascading to Champions/
Gatekeepers, permission overrides, password reuse rules).

## Conventions
- One epic/story = one focused set of commits, not everything at once.
- Every new table needs a Row Level Security policy before it ships.
- Run and pass relevant tests before marking a story done.

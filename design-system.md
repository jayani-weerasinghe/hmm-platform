# HMM Design System

*Extracted from Figma — https://www.figma.com/design/K1Csx2BjbSmP9NRSDtoEe2/HMM (September 2026 version).
Source frames: "HMM — Design Philosophy" (node 2:11), "HMM — Color System" (2:108),
"HMM — Typography" (2:255), "HMM — Spacing & Layout" (2:475). Two additional frames exist
in the file — "HMM — Component Patterns" (7:11) and "HMM — Iconography" (7:510) — not
extracted here; pull them via `get_design_context` on those node IDs when building a
specific component that needs them.*

## Design Philosophy

**Statement:** Empowering Champions for Brighter Futures. HMM is designed to feel warm,
trustworthy, and empowering — a digital companion for gatekeepers, champions, and
communities working toward healthier minds. Every design decision prioritizes clarity,
accessibility, and human connection.

**Principles:**
1. **Clarity Over Complexity** — every screen communicates its purpose within seconds.
   Data-heavy dashboards use progressive disclosure to prevent overwhelm. Navigation is
   predictable and consistent.
2. **Warm Professionalism** — the visual language balances institutional trust (navy,
   structured layouts) with human warmth (amber accents, rounded elements, real
   photography). Never cold, never casual.
3. **Accessible by Default** — all text meets WCAG AA contrast. Interactive elements have
   clear focus states. The interface works for users of all technical comfort levels.

**Brand personality (Voice & Tone):**
- **Trustworthy** — institutional confidence through navy tones and structured layouts.
- **Empowering** — amber CTAs and progress visualizations celebrate achievement.
- **Approachable** — rounded corners, generous whitespace, warm photography.
- **Data-Informed** — charts, metrics, and progress bars make impact visible.

**Do:**
- Use the navy + amber palette for primary interactions.
- Maintain generous whitespace between content blocks.
- Use progress bars and visual metrics to show impact.
- Keep navigation consistent across all views.
- Use real photography of people and communities.
- Apply the 8px spacing grid consistently.

**Don't:**
- Mix brand colors with unrelated accent tones.
- Overcrowd screens with dense data tables.
- Use purely decorative illustrations over photography.
- Break the left-sidebar navigation pattern.
- Use font sizes below 10px for any content.
- Apply drop shadows heavier than the defined elevation set.

## Colors

**Brand:**
| Token | Hex | Use |
|---|---|---|
| Navy 900 | `#022C51` | Primary brand, headers, nav |
| Blue 700 | `#003495` | Links, interactive elements |
| Blue 500 | `#1E4BB8` | Secondary actions, tags |
| Amber 500 | `#F4AC1E` | Primary CTA, highlights |
| Teal 600 | `#0D8275` | Secondary accent, badges |

**Neutral / Slate scale:**
| Token | Hex | Use |
|---|---|---|
| Slate 900 | `#0F172A` | Primary text |
| Slate 600 | `#475569` | Secondary text |
| Slate 500 | `#64748B` | Muted text, placeholders |
| Slate 200 | `#E2E8F0` | Borders, dividers |
| Slate 100 | `#F1F5F9` | Section backgrounds |
| Slate 50 | `#F8FAFC` | Page background |
| White | `#FFFFFF` | Card backgrounds |

**Semantic (status/feedback):**
| Token | Hex | Use |
|---|---|---|
| Success | `#16A34A` | Positive status, completed |
| Success Light | `#E6FFE7` | Success backgrounds |
| Warning | `#D97706` | Attention, pending items |
| Error | `#DC2626` | Errors, destructive actions |
| Info | `#003495` | Informational states |
| Info Light | `#E6EEFF` | Info backgrounds |

**Usage guidelines:**
- Sidebar nav: Navy 900 background, white text, amber active indicators.
- Primary buttons: amber fill, navy text; hover darkens 10%; disabled at 40% opacity.
- Data viz: Blue 700 primary series, teal secondary, amber for highlights/targets.
- Status badges: colored text on matching light-tint background.
- Page backgrounds: Slate 50 page bg, white cards, Slate 100 grouped sections/table headers.
- Borders/lines: Slate 200, 1px standard weight.

## Typography

Primary typeface: **Inter** (all interfaces). **Plus Jakarta Sans Bold 18px** is reserved
for display headings on sign-in/marketing pages only.

| Style | Font / Size | Used for |
|---|---|---|
| Page Title | Inter Bold / 18px | Page headers, section titles |
| Section Heading | Inter Medium / 16px | Card headers, section labels |
| Subheading | Inter Semi Bold / 13px | Subsection titles, emphasized labels |
| Body | Inter Regular / 13px | Primary body text, descriptions |
| Body Small | Inter Regular / 12px | Secondary content, metadata |
| Label | Inter Semi Bold / 12px | Form labels, table headers |
| Caption | Inter Regular / 11px | Helper text, pagination, timestamps |
| Badge / Tag | Inter Bold / 10px | Status badges, small tags |
| Metric Value | Inter Bold / 16px | Dashboard KPI values, counts |

**Font weight usage:**
- Regular (400) — body text, descriptions, helper text, metadata
- Medium (500) — section headers, card titles, navigation items
- Semi Bold (600) — subsection titles, form labels, emphasized inline text, table headers
- Bold (700) — page titles, KPI values, badges, strong emphasis

**Rules:**
- Line height: 1.5× font size for body text, 1.3× for headings.
- Max line length: 72 characters for body copy.
- Text colors: Slate 900 primary, Slate 600 secondary, Slate 500 muted.
- Never use font sizes below 10px.
- Uppercase reserved for labels/badges/status bar — always with letter-spacing ≥ 0.5px.
- Tabular numbers (`font-variant-numeric: tabular-nums`) for all numerical data in tables/metrics.

## Spacing (8px base grid)

| Token | Value | Use |
|---|---|---|
| spacing-2 | 2px | Micro gaps (icon-to-text tight) |
| spacing-4 | 4px | Tight gaps, inline spacing |
| spacing-8 | 8px | Default item spacing, small padding |
| spacing-12 | 12px | Form field padding, compact gaps |
| spacing-16 | 16px | Card padding, section gaps |
| spacing-20 | 20px | Medium section padding |
| spacing-24 | 24px | Content area padding |
| spacing-32 | 32px | Section separators, large gaps |
| spacing-48 | 48px | Page section vertical spacing |
| spacing-64 | 64px | Page horizontal margins |

## Corner Radius

| Token | Value | Use |
|---|---|---|
| radius-sm | 4px | Badges, tags, small chips |
| radius-md | 6px | Input fields, small cards |
| radius-lg | 8px | Cards, dropdowns, modals |
| radius-xl | 12px | Large cards, panels |
| radius-2xl | 16px | Hero sections, containers |
| radius-full | 9999px | Avatars, pill buttons, dots |

## Elevation (shadows)

| Token | Value | Use |
|---|---|---|
| elevation-0 | none | Default state, inline content |
| elevation-1 | `0 0 0 2px rgba(0,0,0,0.06)` | Subtle border ring — cards, inputs |
| elevation-2 | `0 2px 4px -2px rgba(0,0,0,0.05)` | Cards, list items on hover |
| elevation-3 | `0 4px 6px -1px rgba(0,0,0,0.08)` | Dropdowns, popovers, floating elements |
| elevation-4 | `0 12px 50px -12px rgba(0,0,0,0.1)` | Modals, dialogs, overlays |

## Layout Patterns

- **Sidebar + Content** — fixed 240px sidebar, navy background, icon + label nav items;
  main content scrolls independently.
- **Page Header** — title (Inter Bold 18px) + subtitle + primary action button aligned
  right; white background, Slate 200 bottom border.
- **Content Cards** — white background, 8px radius, Slate 200 border, 16–24px internal
  padding, 16px gap when stacked.
- **Data Tables** — header row Slate 100 bg + Semi Bold 12px labels; body rows alternate
  white/Slate 50; row height 48px; Slate 200 horizontal dividers.
- **Filter Bar** — search input + filter dropdowns + tabs above content; active tab =
  navy underline + bold text.
- **Progress Bars** — amber fill on Slate 100 track, 8px height, full radius, percentage
  label above or beside.

## Figma file reference

File: `https://www.figma.com/design/K1Csx2BjbSmP9NRSDtoEe2/HMM`

| Frame | Node ID |
|---|---|
| Design Philosophy | 2:11 |
| Color System | 2:108 |
| Typography | 2:255 |
| Spacing & Layout | 2:475 |
| Component Patterns (not yet extracted) | 7:11 |
| Iconography (not yet extracted) | 7:510 |
| sign in (screen) | 1:21 |
| dashboard (screen) | 1:60 |
| Resources (screen) | 1:592 |
| clubs (screen) | 1:954 |
| champions (screen) | 1:2410 |
| annoucements (screen) | 1:3159 |

/**
 * HMM Design Tokens
 * Extracted from Figma — https://www.figma.com/design/K1Csx2BjbSmP9NRSDtoEe2/HMM
 * See docs/design-system.md for full context, usage guidelines, and node references.
 *
 * These are framework-agnostic values. If the project uses Tailwind, wire these into
 * tailwind.config's `theme.extend` rather than duplicating the palette there.
 */

export const colors = {
  brand: {
    navy900: "#022C51", // Primary brand, headers, nav
    blue700: "#003495", // Links, interactive elements
    blue500: "#1E4BB8", // Secondary actions, tags
    amber500: "#F4AC1E", // Primary CTA, highlights
    teal600: "#0D8275", // Secondary accent, badges
  },
  neutral: {
    slate900: "#0F172A", // Primary text
    slate600: "#475569", // Secondary text
    slate500: "#64748B", // Muted text, placeholders
    slate200: "#E2E8F0", // Borders, dividers
    slate100: "#F1F5F9", // Section backgrounds
    slate50: "#F8FAFC", // Page background
    white: "#FFFFFF", // Card backgrounds
  },
  semantic: {
    success: "#16A34A",
    successLight: "#E6FFE7",
    warning: "#D97706",
    error: "#DC2626",
    info: "#003495",
    infoLight: "#E6EEFF",
  },
} as const;

export const fontFamily = {
  primary: "Inter", // all interfaces
  display: "Plus Jakarta Sans", // sign-in / marketing display headings only, Bold 18px
} as const;

export const typeScale = {
  pageTitle: { font: "Inter", weight: 700, size: 18, lineHeight: 1.3 },
  sectionHeading: { font: "Inter", weight: 500, size: 16, lineHeight: 1.3 },
  subheading: { font: "Inter", weight: 600, size: 13, lineHeight: 1.5 },
  body: { font: "Inter", weight: 400, size: 13, lineHeight: 1.5 },
  bodySmall: { font: "Inter", weight: 400, size: 12, lineHeight: 1.5 },
  label: { font: "Inter", weight: 600, size: 12, lineHeight: 1.5 },
  caption: { font: "Inter", weight: 400, size: 11, lineHeight: 1.5 },
  badge: { font: "Inter", weight: 700, size: 10, lineHeight: 1.5 },
  metricValue: { font: "Inter", weight: 700, size: 16, lineHeight: 1.3 },
} as const;

export const fontWeight = {
  regular: 400, // body text, descriptions, helper text, metadata
  medium: 500, // section headers, card titles, navigation items
  semiBold: 600, // subsection titles, form labels, emphasized inline text, table headers
  bold: 700, // page titles, KPI values, badges, strong emphasis
} as const;

export const typographyRules = {
  bodyLineHeightRatio: 1.5,
  headingLineHeightRatio: 1.3,
  maxLineLengthChars: 72,
  minFontSizePx: 10,
  uppercaseMinLetterSpacingPx: 0.5,
  tabularNumsForData: true, // font-variant-numeric: tabular-nums, in tables/metrics
} as const;

export const spacing = {
  2: "2px", // micro gaps (icon-to-text tight)
  4: "4px", // tight gaps, inline spacing
  8: "8px", // default item spacing, small padding
  12: "12px", // form field padding, compact gaps
  16: "16px", // card padding, section gaps
  20: "20px", // medium section padding
  24: "24px", // content area padding
  32: "32px", // section separators, large gaps
  48: "48px", // page section vertical spacing
  64: "64px", // page horizontal margins
} as const;

export const radius = {
  sm: "4px", // badges, tags, small chips
  md: "6px", // input fields, small cards
  lg: "8px", // cards, dropdowns, modals
  xl: "12px", // large cards, panels
  "2xl": "16px", // hero sections, containers
  full: "9999px", // avatars, pill buttons, dots
} as const;

export const elevation = {
  0: "none", // default state, inline content
  1: "0 0 0 2px rgba(0,0,0,0.06)", // subtle border ring — cards, inputs
  2: "0 2px 4px -2px rgba(0,0,0,0.05)", // cards, list items on hover
  3: "0 4px 6px -1px rgba(0,0,0,0.08)", // dropdowns, popovers, floating
  4: "0 12px 50px -12px rgba(0,0,0,0.1)", // modals, dialogs, overlays
} as const;

export type Colors = typeof colors;
export type TypeScale = typeof typeScale;
export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Elevation = typeof elevation;

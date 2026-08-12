// Palette lifted from design/resources-design.html (extracted via computed
// styles) — kept as plain hex so every component references the same values.
export const colors = {
  navy: '#0E2A4D',
  amber: '#F2A71B',
  amberShadow: 'rgba(242,167,27,0.9)',
  description: '#8A93A3',
  meta: '#7A8496',
  labelMuted: '#A2AAB8',
  border: '#E7E9EE',
  pillBg: '#F4F6F9',
  addCardBg: '#FBFCFD',
  addCardBorder: '#D6DBE4',
  link: '#1B4B8F',
  delta: '#2E9E6B',
  danger: '#C4453B',
}

export const RESOURCE_TYPE_LABEL: Record<string, string> = {
  video: 'Video',
  article: 'Article',
  document: 'Document',
  other: 'Other',
}

// Soft tint + accent color per type, standing in for a photo thumbnail since
// resources have no image field (icon-block instead — see resource-card.tsx).
export const RESOURCE_TYPE_VISUAL: Record<string, { tint: string; accent: string }> = {
  video:    { tint: '#EAF1FB', accent: '#2B6CB0' },
  article:  { tint: '#F2EDFB', accent: '#7C4DBE' },
  document: { tint: '#EAF7EF', accent: '#2F9E58' },
  other:    { tint: '#F1F2F5', accent: '#6B7488' },
}

export function resourceTypeVisual(type: string) {
  return RESOURCE_TYPE_VISUAL[type] ?? RESOURCE_TYPE_VISUAL.other
}

// Colors and type mappings pulled directly from Figma node 1:687 ("Learning
// Resources" list page) — hex values sampled from the real design, not the
// old design/resources-design.html mockup this section was previously
// skinned from. These match the app-wide palette already used by
// Champions/Clubs (e.g. #0F172A, #475569, #F4AC1E), not a section-scoped one.
export const RESOURCE_TYPE_LABEL: Record<string, string> = {
  video: 'Video',
  article: 'Article',
  document: 'Document',
  other: 'Other',
}

// Thumbnail-block tint + icon per type, sampled from Figma's real per-type
// instances (video: play-button-on-tint; document: PDF-style icon on pink
// tint; other: file-style icon on indigo tint). Figma's article instances
// used real stock photos with no icon-block equivalent to copy — the article
// icon here reuses the same small glyph shown in its type pill, enlarged,
// on a tint sampled from the design's "Self-Care" category pill.
export const RESOURCE_TYPE_VISUAL: Record<string, { tint: string; icon: string; iconSize: number }> = {
  video:    { tint: '#DCE9FF', icon: '/icons/play-triangle.svg',          iconSize: 16 },
  article:  { tint: 'rgba(148,244,227,0.3)', icon: '/icons/resource-article-small.svg', iconSize: 30 },
  document: { tint: 'rgba(255,218,214,0.3)', icon: '/icons/resource-document-large.svg', iconSize: 30 },
  other:    { tint: 'rgba(219,225,255,0.4)', icon: '/icons/resource-file-large.svg', iconSize: 30 },
}

export function resourceTypeVisual(type: string) {
  return RESOURCE_TYPE_VISUAL[type] ?? RESOURCE_TYPE_VISUAL.other
}

// Small type-pill icon (next to the category pill) — only Video/Article have
// a real small-icon instance in the design; Document/Other type pills were
// never shown standalone in Figma (those rows showed a category-specific
// badge like "Peer Reviewed"/"Certification" instead, which isn't backed by
// any real field on the resources table — dropped, not guessed at).
export const RESOURCE_TYPE_PILL_ICON: Record<string, string | null> = {
  video: '/icons/resource-video-small.svg',
  article: '/icons/resource-article-small.svg',
  document: null,
  other: null,
}

// Deterministic category pill color, hashed from the category string (same
// pattern as the champion-avatar color hash in clubs/page.tsx) — category is
// real free-text with no fixed enum, so a fixed per-value color map isn't
// possible; this keeps each category's color stable across renders instead
// of being random every request.
const CATEGORY_PALETTE = [
  { bg: '#EFF4FF', text: '#1E4BB8' },
  { bg: '#DCE9FF', text: '#003495' },
  { bg: 'rgba(255,222,172,0.4)', text: '#7E5700' },
  { bg: 'rgba(148,244,227,0.4)', text: '#00453E' },
  { bg: '#E6EEFF', text: '#003495' },
]

export function categoryColor(category: string) {
  let hash = 0
  for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) >>> 0
  return CATEGORY_PALETTE[hash % CATEGORY_PALETTE.length]
}

import { resourceTypeVisual } from './design-tokens'

// Stands in for a photo thumbnail (resources have no image field) — a large
// centered icon on a soft type-tinted background, in the same visual slot
// the design reference uses for a card's photo.
export function ResourceTypeIcon({ type, size = 40 }: { type: string; size?: number }) {
  const { accent } = resourceTypeVisual(type)

  if (type === 'video') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="19" stroke={accent} strokeWidth="1.5" opacity="0.35" />
        <path d="M16 13.5v13l11-6.5-11-6.5z" fill={accent} />
      </svg>
    )
  }
  if (type === 'article') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <rect x="9" y="6" width="22" height="28" rx="2.5" stroke={accent} strokeWidth="1.6" />
        <path d="M14 14h12M14 19.5h12M14 25h8" stroke={accent} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }
  if (type === 'document') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <path d="M12 5h11l6 6v22a1.5 1.5 0 0 1-1.5 1.5h-15.5a1.5 1.5 0 0 1-1.5-1.5v-26A1.5 1.5 0 0 1 12 5z" stroke={accent} strokeWidth="1.6" />
        <path d="M23 5v6h6" stroke={accent} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M15 21h10M15 26h10" stroke={accent} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M6 12.5a2 2 0 0 1 2-2h7l3 3.5h13.5a2 2 0 0 1 2 2v13.5a2 2 0 0 1-2 2h-23.5a2 2 0 0 1-2-2v-17z" stroke={accent} strokeWidth="1.6" />
    </svg>
  )
}

export const EVENT_TYPE_STYLES: Record<string, { label: string; dot: string; badge: string }> = {
  qpr_session:       { label: 'QPR Certification Session', dot: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-700' },
  awareness_program: { label: 'Awareness Program',          dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700' },
  workshop:           { label: 'Workshop',                   dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700' },
  other:              { label: 'Other',                       dot: 'bg-gray-400',   badge: 'bg-gray-100 text-gray-600' },
}

export function eventTypeStyle(type: string) {
  return EVENT_TYPE_STYLES[type] ?? EVENT_TYPE_STYLES.other
}

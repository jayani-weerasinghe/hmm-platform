// Colors match the Figma legend exactly: QPR Certification Cohort (blue),
// Awareness Program (amber), Clinical & Skills Workshop (teal). "Other" has
// no Figma reference (not one of the design's 3 legend entries) — kept as a
// neutral grey fallback so real other-typed events still render distinctly.
export const EVENT_TYPE_STYLES: Record<string, { label: string; dot: string; pillBg: string; pillText: string; badge: string }> = {
  qpr_session:       { label: 'QPR Certification Cohort',     dot: '#1E4BB8', pillBg: '#EFF4FF',                pillText: '#1E4BB8', badge: 'bg-[#EFF4FF] text-[#1E4BB8]' },
  awareness_program: { label: 'Awareness Program',            dot: '#EAA824', pillBg: 'rgba(255,222,172,0.5)',  pillText: '#7E5700', badge: 'bg-[rgba(255,222,172,0.5)] text-[#7E5700]' },
  workshop:           { label: 'Clinical & Skills Workshop',   dot: '#0D8275', pillBg: 'rgba(148,244,227,0.4)',  pillText: '#00453E', badge: 'bg-[rgba(148,244,227,0.4)] text-[#00453E]' },
  other:              { label: 'Other',                        dot: '#94A3B8', pillBg: '#F1F5F9',                pillText: '#475569', badge: 'bg-[#F1F5F9] text-[#475569]' },
}

export function eventTypeStyle(type: string) {
  return EVENT_TYPE_STYLES[type] ?? EVENT_TYPE_STYLES.other
}

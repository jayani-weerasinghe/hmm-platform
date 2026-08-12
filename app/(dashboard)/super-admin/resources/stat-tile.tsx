import { archivo, manrope } from './fonts'
import { colors } from './design-tokens'

export function StatTile({ label, value, sub, subColor }: { label: string; value: string | number; sub?: string; subColor?: string }) {
  return (
    <div className="rounded-2xl bg-white" style={{ border: `1px solid ${colors.border}`, padding: '16px 18px' }}>
      <span
        className={`${manrope.className} block text-[11px] font-semibold uppercase`}
        style={{ color: colors.labelMuted, letterSpacing: '1.54px' }}
      >
        {label}
      </span>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className={`${archivo.className} text-[26px] font-extrabold`} style={{ color: colors.navy }}>
          {value}
        </span>
        {sub && (
          <span className={`${manrope.className} text-[12px] font-semibold`} style={{ color: subColor ?? colors.meta }}>
            {sub}
          </span>
        )}
      </div>
    </div>
  )
}

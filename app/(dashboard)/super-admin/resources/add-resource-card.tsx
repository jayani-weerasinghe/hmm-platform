import Link from 'next/link'
import { manrope } from './fonts'
import { colors } from './design-tokens'

export function AddResourceCard({ category, label = 'Add Resource' }: { category?: string; label?: string }) {
  const href = category
    ? `/super-admin/resources/new?category=${encodeURIComponent(category)}`
    : '/super-admin/resources/new'

  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl transition-colors hover:bg-white"
      style={{
        border: `1.5px dashed ${colors.addCardBorder}`,
        backgroundColor: colors.addCardBg,
        aspectRatio: '261 / 325',
      }}
    >
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full"
        style={{ border: `1.5px solid ${colors.addCardBorder}` }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 2v14M2 9h14" stroke={colors.meta} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      <span className={`${manrope.className} text-[13.5px] font-semibold`} style={{ color: colors.meta }}>
        {label}
      </span>
    </Link>
  )
}

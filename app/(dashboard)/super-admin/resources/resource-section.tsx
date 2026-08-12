'use client'

import { useState } from 'react'
import { archivo, manrope } from './fonts'
import { colors } from './design-tokens'
import { AddResourceCard } from './add-resource-card'
import { ResourceCard, type ResourceCardData } from './resource-card'

const VISIBLE_CAP = 3

export function ResourceSection({
  title,
  subtitle,
  category,
  resources,
}: {
  title: string
  subtitle: string
  category?: string
  resources: ResourceCardData[]
}) {
  const [expanded, setExpanded] = useState(false)
  const hasMore = resources.length > VISIBLE_CAP
  const visible = expanded ? resources : resources.slice(0, VISIBLE_CAP)

  return (
    <div className="rounded-[18px] bg-white" style={{ border: `1px solid ${colors.border}`, padding: '28px 30px 30px' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.amber }} />
          <h2 className={`${archivo.className} text-[20px] font-extrabold`} style={{ color: colors.navy, letterSpacing: '-0.3px' }}>
            {title}
          </h2>
          <span
            className={`${manrope.className} rounded-full text-[11.5px] font-semibold`}
            style={{ backgroundColor: colors.pillBg, color: colors.meta, padding: '3px 9px' }}
          >
            {resources.length} item{resources.length === 1 ? '' : 's'}
          </span>
        </div>
        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            className={`${manrope.className} flex-shrink-0 text-[13px] font-bold`}
            style={{ color: colors.link }}
          >
            {expanded ? '← Show less' : `View all →`}
          </button>
        )}
      </div>

      <p className={`${manrope.className} mt-2 text-[13.5px]`} style={{ color: colors.description }}>
        {subtitle}
      </p>

      <div className="mt-[18px] grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <AddResourceCard category={category} />
        {visible.map(r => <ResourceCard key={r.id} resource={r} />)}
      </div>
    </div>
  )
}

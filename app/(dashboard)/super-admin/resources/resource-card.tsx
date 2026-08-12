import Link from 'next/link'
import { archivo, manrope } from './fonts'
import { colors, RESOURCE_TYPE_LABEL, resourceTypeVisual } from './design-tokens'
import { ResourceTypeIcon } from './resource-type-icon'
import { ResourceDeleteButton } from './resource-delete-button'

export interface ResourceCardData {
  id: string
  title: string
  description: string | null
  type: string
  category: string | null
  publication_date: string
  content_url: string | null
  link: string | null
}

export function ResourceCard({ resource }: { resource: ResourceCardData }) {
  const visual = resourceTypeVisual(resource.type)
  const dateLabel = new Date(resource.publication_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl bg-white"
      style={{ border: `1px solid ${colors.border}` }}
    >
      <div className="relative flex items-center justify-center" style={{ aspectRatio: '259 / 158', background: visual.tint }}>
        <ResourceTypeIcon type={resource.type} size={40} />
        <span
          className={`${manrope.className} absolute left-3 top-3 rounded-full px-2.5 py-[5px] text-[10.5px] font-bold uppercase`}
          style={{ backgroundColor: 'rgba(255,255,255,0.94)', color: colors.navy, letterSpacing: '0.06em' }}
        >
          {RESOURCE_TYPE_LABEL[resource.type] ?? resource.type}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 pb-[18px]">
        <h3 className={`${archivo.className} text-[15.5px] font-bold leading-snug`} style={{ color: colors.navy, letterSpacing: '-0.155px' }}>
          {resource.title}
        </h3>
        {resource.description && (
          <p className={`${manrope.className} mt-1.5 line-clamp-2 text-[13px]`} style={{ color: colors.description }}>
            {resource.description}
          </p>
        )}

        <div className="mt-3 flex flex-1 items-end">
          <div className="w-full pt-3" style={{ borderTop: `1px solid ${colors.border}` }}>
            <div className="flex items-center justify-between gap-2">
              <span className={`${manrope.className} text-[12px] font-semibold`} style={{ color: colors.meta }}>
                {dateLabel}
              </span>
              <div className="flex items-center gap-3 text-[12.5px] font-bold">
                {resource.link && (
                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={manrope.className}
                    style={{ color: colors.link }}
                  >
                    View →
                  </a>
                )}
                <Link
                  href={`/super-admin/resources/${resource.id}/edit`}
                  className={manrope.className}
                  style={{ color: colors.link }}
                >
                  Edit
                </Link>
                <ResourceDeleteButton resourceId={resource.id} contentUrl={resource.content_url} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ResourceFilters } from './resource-filters'
import { ResourceSection } from './resource-section'
import { StatTile } from './stat-tile'
import { archivo, manrope } from './fonts'
import { colors, RESOURCE_TYPE_LABEL } from './design-tokens'
import type { ResourceCardData } from './resource-card'

function isExternalUrl(value: string) {
  return /^https?:\/\//i.test(value)
}

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>
}) {
  const { q, type } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('resources')
    .select('id, title, description, type, category, publication_date, content_url, content_text')
    .order('publication_date', { ascending: false })

  if (q) query = query.ilike('title', `%${q}%`)
  if (type) query = query.eq('type', type)

  const [{ data: resources }, { data: allForStats }] = await Promise.all([
    query,
    supabase.from('resources').select('type, publication_date'),
  ])

  const withLinks: ResourceCardData[] = await Promise.all(
    (resources ?? []).map(async (r) => {
      let link: string | null = null
      if (r.content_url) {
        if (isExternalUrl(r.content_url)) {
          link = r.content_url
        } else {
          const { data } = await supabase.storage.from('resources').createSignedUrl(r.content_url, 3600)
          link = data?.signedUrl ?? null
        }
      }
      return { id: r.id, title: r.title, description: r.description, type: r.type, category: r.category, publication_date: r.publication_date, content_url: r.content_url, link }
    })
  )

  // ── Stats (always reflect the full dataset, independent of the filters below) ──
  const all = allForStats ?? []
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  const publishedThisMonth = all.filter(r => r.publication_date >= monthStart).length
  const byType: Record<string, number> = {}
  for (const r of all) byType[r.type] = (byType[r.type] ?? 0) + 1

  // ── Group the (filtered) list by category for section rendering ──
  const groups = new Map<string, ResourceCardData[]>()
  for (const r of withLinks) {
    const key = r.category?.trim() || 'Uncategorized'
    groups.set(key, [...(groups.get(key) ?? []), r])
  }
  const sortedGroups = Array.from(groups.entries()).sort(([a], [b]) => {
    if (a === 'Uncategorized') return 1
    if (b === 'Uncategorized') return -1
    return a.localeCompare(b)
  })

  return (
    <div className="p-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <StatTile label="Total Resources" value={all.length} />
          <StatTile label="Published This Month" value={publishedThisMonth} subColor={colors.delta} />
          <div className="rounded-2xl bg-white" style={{ border: `1px solid ${colors.border}`, padding: '16px 18px' }}>
            <span className={`${manrope.className} block text-[11px] font-semibold uppercase`} style={{ color: colors.labelMuted, letterSpacing: '1.54px' }}>
              By Type
            </span>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
              {Object.entries(byType).length === 0 ? (
                <span className={`${archivo.className} text-[26px] font-extrabold`} style={{ color: colors.navy }}>0</span>
              ) : (
                Object.entries(byType).map(([t, count]) => (
                  <span key={t} className={`${manrope.className} text-[13px] font-semibold`} style={{ color: colors.navy }}>
                    {count} <span style={{ color: colors.meta }}>{RESOURCE_TYPE_LABEL[t] ?? t}</span>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        <Link
          href="/super-admin/resources/new"
          className={`${archivo.className} flex-shrink-0 rounded-[11px] text-[13.5px] font-extrabold`}
          style={{
            backgroundColor: colors.amber,
            color: colors.navy,
            padding: '0 22px',
            height: '46px',
            display: 'inline-flex',
            alignItems: 'center',
            letterSpacing: '0.135px',
            boxShadow: `0 10px 22px -12px ${colors.amberShadow}`,
          }}
        >
          + Add Resource
        </Link>
      </div>

      <div className="mb-5">
        <ResourceFilters q={q} type={type} />
      </div>

      {sortedGroups.length === 0 ? (
        <div className="rounded-[18px] bg-white p-12 text-center" style={{ border: `1px solid ${colors.border}` }}>
          <p className={`${manrope.className} text-sm`} style={{ color: colors.description }}>
            {q || type ? 'No resources match your filters.' : 'No resources yet.'}
          </p>
          {!q && !type && (
            <Link href="/super-admin/resources/new" className={`${manrope.className} mt-2 inline-block text-sm font-bold`} style={{ color: colors.link }}>
              Add your first resource →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {sortedGroups.map(([category, items]) => {
            const mostRecent = items.reduce((max, r) => r.publication_date > max ? r.publication_date : max, items[0].publication_date)
            const mostRecentLabel = new Date(mostRecent).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
            return (
              <ResourceSection
                key={category}
                title={category}
                subtitle={`${items.length} resource${items.length === 1 ? '' : 's'} · last added ${mostRecentLabel}`}
                category={category === 'Uncategorized' ? undefined : category}
                resources={items}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

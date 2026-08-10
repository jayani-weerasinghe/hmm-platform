import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ResourceFilters } from './resource-filters'
import { ResourceDeleteButton } from './resource-delete-button'

export const metadata = { title: 'Resources — HMM Super Admin' }

const TYPE_LABEL: Record<string, string> = {
  video: 'Video',
  article: 'Article',
  document: 'Document',
  other: 'Other',
}

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
    .select('id, title, type, category, publication_date, content_url, content_text')
    .order('publication_date', { ascending: false })

  if (q) query = query.ilike('title', `%${q}%`)
  if (type) query = query.eq('type', type)

  const { data: resources } = await query

  const withLinks = await Promise.all(
    (resources ?? []).map(async (r) => {
      if (!r.content_url) return { ...r, link: null as string | null }
      if (isExternalUrl(r.content_url)) return { ...r, link: r.content_url }
      const { data } = await supabase.storage.from('resources').createSignedUrl(r.content_url, 3600)
      return { ...r, link: data?.signedUrl ?? null }
    })
  )

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div />
        <Link
          href="/super-admin/resources/new"
          className="rounded-lg bg-[#F5A623] px-4 py-2 text-sm font-semibold text-white hover:bg-[#D97706] transition-colors"
        >
          Add Resource
        </Link>
      </div>

      <ResourceFilters q={q} type={type} />

      <div className="mt-4 overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
        {withLinks.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">
            {q || type ? 'No resources match your filters.' : 'No resources yet. Add one to get started.'}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Publication Date</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {withLinks.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.title}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {TYPE_LABEL[r.type] ?? r.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.category ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(r.publication_date).toLocaleDateString('en-AU', { dateStyle: 'medium' })}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    {r.link && (
                      <a href={r.link} target="_blank" rel="noopener noreferrer" className="mr-3 text-blue-600 hover:text-blue-800">
                        View
                      </a>
                    )}
                    <Link href={`/super-admin/resources/${r.id}/edit`} className="mr-3 text-gray-600 hover:text-gray-900">
                      Edit
                    </Link>
                    <ResourceDeleteButton resourceId={r.id} contentUrl={r.content_url} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

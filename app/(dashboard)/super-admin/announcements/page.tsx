import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AnnouncementSearch } from './announcement-search'
import { AnnouncementDeleteButton } from './announcement-delete-button'

export const metadata = { title: 'Announcements — HMM Super Admin' }

function statusOf(publishDate: string, expiryDate: string | null) {
  const now = new Date()
  if (new Date(publishDate) > now) return { label: 'Scheduled', cls: 'bg-yellow-100 text-yellow-700' }
  if (expiryDate && new Date(expiryDate) <= now) return { label: 'Expired', cls: 'bg-gray-100 text-gray-600' }
  return { label: 'Active', cls: 'bg-green-100 text-green-700' }
}

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('announcements')
    .select('id, title, body, publish_date, expiry_date')
    .is('club_id', null)
    .order('publish_date', { ascending: false })

  if (q) query = query.ilike('title', `%${q}%`)

  const { data: announcements } = await query

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div />
        <Link
          href="/super-admin/announcements/new"
          className="rounded-lg bg-[#F5A623] px-4 py-2 text-sm font-semibold text-white hover:bg-[#D97706] transition-colors"
        >
          Create Announcement
        </Link>
      </div>

      <AnnouncementSearch q={q} />

      <div className="mt-4 overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
        {!announcements || announcements.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">
            {q ? 'No announcements match your search.' : 'No announcements yet. Create one to get started.'}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Publish Date</th>
                <th className="px-6 py-3">Expiry Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {announcements.map(a => {
                const status = statusOf(a.publish_date, a.expiry_date)
                return (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{a.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(a.publish_date).toLocaleDateString('en-AU', { dateStyle: 'medium' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {a.expiry_date ? new Date(a.expiry_date).toLocaleDateString('en-AU', { dateStyle: 'medium' }) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <Link href={`/super-admin/announcements/${a.id}/edit`} className="mr-3 text-gray-600 hover:text-gray-900">
                        Edit
                      </Link>
                      <AnnouncementDeleteButton announcementId={a.id} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

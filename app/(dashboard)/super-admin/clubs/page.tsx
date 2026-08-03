import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ClubFilters } from './club-filters'

export const metadata = { title: 'Clubs — HMM Super Admin' }

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const { q, status } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('clubs')
    .select('id, club_code, name, location, is_active, created_at')
    .order('name')

  if (q) query = query.ilike('name', `%${q}%`)
  if (status === 'active')   query = query.eq('is_active', true)
  if (status === 'inactive') query = query.eq('is_active', false)

  const { data: clubs } = await query

  // Fetch champion counts for all clubs in one query
  const { data: champRows } = await supabase
    .from('profiles')
    .select('club_id')
    .eq('role', 'champion')
    .eq('is_active', true)

  const champCountByClub: Record<string, number> = {}
  for (const row of champRows ?? []) {
    if (row.club_id) {
      champCountByClub[row.club_id] = (champCountByClub[row.club_id] ?? 0) + 1
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div />
        <Link
          href="/super-admin/clubs/new"
          className="rounded-lg bg-[#F5A623] px-4 py-2 text-sm font-semibold text-white hover:bg-[#D97706] transition-colors"
        >
          Create Club
        </Link>
      </div>

      <ClubFilters q={q} status={status} />

      <div className="mt-4 overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
        {!clubs || clubs.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">
            {q || status ? 'No clubs match your filters.' : 'No clubs yet. Create one to get started.'}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Club Code</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Active Champions</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clubs.map(club => (
                <tr key={club.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm text-gray-700">{club.club_code ?? '—'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{club.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{club.location}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      club.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {club.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{champCountByClub[club.id] ?? 0}</td>
                  <td className="px-6 py-4 text-right text-sm">
                    <Link href={`/super-admin/clubs/${club.id}`} className="mr-3 text-blue-600 hover:text-blue-800">
                      View
                    </Link>
                    <Link href={`/super-admin/clubs/${club.id}/edit`} className="text-gray-600 hover:text-gray-900">
                      Edit
                    </Link>
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

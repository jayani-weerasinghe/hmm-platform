import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ChampionFilters } from './champion-filters'

export const metadata = { title: 'Champions — HMM Super Admin' }

export default async function ChampionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; club?: string; status?: string }>
}) {
  const { q, club: clubFilter, status } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('id, full_name, email, phone, is_active, club_id, clubs(id, name)')
    .eq('role', 'champion')
    .order('full_name')

  if (q)           query = query.ilike('full_name', `%${q}%`)
  if (clubFilter)  query = query.eq('club_id', clubFilter)
  if (status === 'active')   query = query.eq('is_active', true)
  if (status === 'inactive') query = query.eq('is_active', false)

  const { data: champions } = await query

  const { data: clubs } = await supabase
    .from('clubs')
    .select('id, name')
    .order('name')

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div />
        <Link
          href="/super-admin/champions/new"
          className="rounded-lg bg-[#F5A623] px-4 py-2 text-sm font-semibold text-white hover:bg-[#D97706] transition-colors"
        >
          Create Champion
        </Link>
      </div>

      <ChampionFilters q={q} clubFilter={clubFilter} status={status} clubs={clubs ?? []} />

      <div className="mt-4 overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
        {!champions || champions.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">
            {q || clubFilter || status ? 'No champions match your filters.' : 'No champions yet.'}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Club</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {champions.map(ch => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const clubName = (ch.clubs as any)?.name ?? '—'
                return (
                  <tr key={ch.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{ch.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{ch.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{clubName}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        ch.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {ch.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <Link href={`/super-admin/champions/${ch.id}`} className="mr-3 text-blue-600 hover:text-blue-800">
                        View
                      </Link>
                      <Link href={`/super-admin/champions/${ch.id}/edit`} className="text-gray-600 hover:text-gray-900">
                        Edit
                      </Link>
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

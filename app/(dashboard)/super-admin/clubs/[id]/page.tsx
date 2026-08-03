import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClubStatusToggle } from './club-status-toggle'

export default async function ClubDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: club } = await supabase
    .from('clubs')
    .select('id, club_code, name, location, description, is_active, created_at')
    .eq('id', id)
    .single()

  if (!club) notFound()

  const [{ data: champions }, { data: gatekeepers }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, is_active')
      .eq('club_id', id)
      .eq('role', 'champion')
      .order('full_name'),
    supabase
      .from('profiles')
      .select('id, full_name, email, is_active')
      .eq('club_id', id)
      .eq('role', 'gatekeeper')
      .order('full_name'),
  ])

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link href="/super-admin/clubs" className="text-sm text-blue-600 hover:text-blue-800">
            ← Back to Clubs
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-gray-900">{club.name}</h1>
          <p className="mt-1 font-mono text-sm text-gray-400">{club.club_code ?? '—'}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/super-admin/clubs/${id}/edit`}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Edit
          </Link>
          <ClubStatusToggle clubId={id} isActive={club.is_active} />
        </div>
      </div>

      {/* Details card */}
      <div className="mb-6 rounded-xl bg-white p-6 ring-1 ring-gray-200">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div>
            <dt className="font-medium text-gray-500">Location</dt>
            <dd className="mt-1 text-gray-900">{club.location}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                club.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {club.is_active ? 'Active' : 'Inactive'}
              </span>
            </dd>
          </div>
          {club.description && (
            <div className="col-span-2">
              <dt className="font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-gray-900">{club.description}</dd>
            </div>
          )}
          <div>
            <dt className="font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(club.created_at).toLocaleDateString('en-AU', { dateStyle: 'medium' })}
            </dd>
          </div>
        </dl>
      </div>

      {/* Champions */}
      <div className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Champions ({champions?.length ?? 0})
        </h2>
        <div className="overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
          {!champions || champions.length === 0 ? (
            <p className="p-6 text-sm text-gray-400">No champions assigned to this club.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {champions.map(c => (
                  <tr key={c.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <Link href={`/super-admin/champions/${c.id}`} className="text-blue-600 hover:text-blue-800">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Gatekeepers */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Gatekeepers ({gatekeepers?.length ?? 0})
        </h2>
        <div className="overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
          {!gatekeepers || gatekeepers.length === 0 ? (
            <p className="p-6 text-sm text-gray-400">No gatekeepers assigned to this club.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {gatekeepers.map(g => (
                  <tr key={g.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{g.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{g.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        g.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {g.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

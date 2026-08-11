import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ExceptionFilters } from './exception-filters'
import { ExceptionRevokeButton } from './exception-revoke-button'

export default async function ExceptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  const { data: overrides } = await supabase
    .from('role_overrides')
    .select('id, user_id, permission, is_enabled, updated_at, profiles!role_overrides_user_id_fkey(full_name, email, role)')
    .order('updated_at', { ascending: false })

  let rows = (overrides ?? []).map(o => ({
    ...o,
    profile: Array.isArray(o.profiles) ? o.profiles[0] : o.profiles,
  }))

  if (q) {
    const needle = q.toLowerCase()
    rows = rows.filter(r =>
      r.profile?.full_name?.toLowerCase().includes(needle) ||
      r.permission.toLowerCase().includes(needle)
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Every user with an active individual exception — flagged here for periodic review, since
          these override both Group and Role defaults.
        </p>
        <Link
          href="/super-admin/permissions/exceptions/new"
          className="rounded-lg bg-[#F5A623] px-4 py-2 text-sm font-semibold text-white hover:bg-[#D97706] transition-colors whitespace-nowrap"
        >
          Grant Exception
        </Link>
      </div>

      <ExceptionFilters q={q} />

      <div className="mt-4 overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
        {rows.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">
            {q ? 'No exceptions match your search.' : 'No individual exceptions are currently set.'}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Permission</th>
                <th className="px-6 py-3">Setting</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.profile?.full_name ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{r.profile?.role ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.permission}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.is_enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {r.is_enabled ? 'Allow' : 'Deny'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <ExceptionRevokeButton overrideId={r.id} userId={r.user_id} permission={r.permission} />
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

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function GroupsPage() {
  const supabase = await createClient()

  const { data: groups } = await supabase
    .from('permission_groups')
    .select('id, name, description, is_active, group_members(count)')
    .order('name')

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Grant the same permissions to multiple people at once — group settings override each
          member's Role default but are themselves overridden by any Individual Exception.
        </p>
        <Link
          href="/super-admin/permissions/groups/new"
          className="rounded-lg bg-[#F5A623] px-4 py-2 text-sm font-semibold text-white hover:bg-[#D97706] transition-colors whitespace-nowrap"
        >
          Create Group
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
        {!groups || groups.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">No groups yet. Create one to get started.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Members</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {groups.map(g => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{g.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{g.description ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{g.group_members?.[0]?.count ?? 0}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      g.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {g.is_active ? 'Active' : 'Archived'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <Link href={`/super-admin/permissions/groups/${g.id}`} className="text-blue-600 hover:text-blue-800">
                      Manage
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

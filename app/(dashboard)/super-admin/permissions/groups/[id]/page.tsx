import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GroupPermissionControl } from './group-permission-control'
import { GroupMemberAddForm } from './group-member-add-form'
import { GroupMemberRemoveButton } from './group-member-remove-button'
import { GroupArchiveButton } from './group-archive-button'

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: group } = await supabase
    .from('permission_groups')
    .select('id, name, description, is_active')
    .eq('id', id)
    .single()

  if (!group) notFound()

  const [{ data: members }, { data: groupPerms }, { data: allActiveUsers }, { data: permissionRows }] = await Promise.all([
    supabase
      .from('group_members')
      .select('user_id, profiles!group_members_user_id_fkey(full_name, email, role)')
      .eq('group_id', id),
    supabase
      .from('group_permissions')
      .select('permission, is_enabled')
      .eq('group_id', id),
    supabase
      .from('profiles')
      .select('id, full_name, role')
      .in('role', ['champion', 'gatekeeper'])
      .eq('is_active', true)
      .order('full_name'),
    supabase
      .from('permissions')
      .select('permission'),
  ])

  const memberRows = (members ?? []).map(m => ({
    user_id: m.user_id,
    profile: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles,
  }))
  const memberIds = new Set(memberRows.map(m => m.user_id))
  const availableUsers = (allActiveUsers ?? []).filter(u => !memberIds.has(u.id))

  const settingByPermission: Record<string, 'allow' | 'deny'> = {}
  for (const gp of groupPerms ?? []) {
    settingByPermission[gp.permission] = gp.is_enabled ? 'allow' : 'deny'
  }
  const permissionKeys = Array.from(new Set((permissionRows ?? []).map(p => p.permission))).sort()

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link href="/super-admin/permissions/groups" className="text-sm text-blue-600 hover:text-blue-800">
            ← Back to Groups
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-gray-900">{group.name}</h1>
          {group.description && <p className="mt-1 text-sm text-gray-500">{group.description}</p>}
        </div>
        {group.is_active && <GroupArchiveButton groupId={group.id} />}
      </div>

      {!group.is_active && (
        <div className="mb-6 rounded-lg bg-gray-100 p-3 text-sm text-gray-600">
          This group is archived. Its permissions no longer apply to members.
        </div>
      )}

      <div className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Members ({memberRows.length})
        </h2>
        <div className="overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
          {memberRows.length === 0 ? (
            <p className="p-6 text-sm text-gray-400">No members yet.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-100">
              <tbody className="divide-y divide-gray-100">
                {memberRows.map(m => (
                  <tr key={m.user_id}>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{m.profile?.full_name ?? '—'}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 capitalize">{m.profile?.role ?? '—'}</td>
                    <td className="px-6 py-3 text-right text-sm">
                      <GroupMemberRemoveButton groupId={group.id} userId={m.user_id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {group.is_active && (
            <div className="border-t border-gray-100 p-4">
              <GroupMemberAddForm groupId={group.id} availableUsers={availableUsers} />
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Group Permissions</h2>
        <p className="mb-3 text-sm text-gray-500">
          Allow/Deny here overrides the Role default for every member — Deny wins if the member is
          also in another group that Allows the same permission. Not Set defers to the Role default.
        </p>
        <div className="overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
          {permissionKeys.length === 0 ? (
            <p className="p-6 text-sm text-gray-400">No permissions configured yet.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-100">
              <tbody className="divide-y divide-gray-100">
                {permissionKeys.map(key => (
                  <tr key={key}>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{key}</td>
                    <td className="px-6 py-3 text-right">
                      <GroupPermissionControl
                        groupId={group.id}
                        permission={key}
                        initialSetting={settingByPermission[key] ?? 'unset'}
                      />
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

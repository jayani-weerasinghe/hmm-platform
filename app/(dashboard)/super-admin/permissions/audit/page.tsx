import { createClient } from '@/lib/supabase/server'

const ACTION_LABEL: Record<string, string> = {
  'permission.role_default_updated': 'Role default changed',
  'permission.individual_exception_granted': 'Individual exception granted',
  'permission.individual_exception_revoked': 'Individual exception revoked',
  'permission_group.created': 'Group created',
  'permission_group.archived': 'Group archived',
  'permission_group.member_added': 'Group member added',
  'permission_group.member_removed': 'Group member removed',
  'permission_group.permission_updated': 'Group permission changed',
  'role_delegation.created': 'Delegation created',
  'role_delegation.ended_manually': 'Delegation ended manually',
  'role_delegation.ended_delegator_deactivated': 'Delegation ended (delegator deactivated)',
}

function describe(action: string, details: Record<string, unknown> | null): string {
  const d = details ?? {}
  switch (action) {
    case 'permission.role_default_updated':
      return `${d.role} · ${d.permission} → ${d.new_value ? 'Enabled' : 'Disabled'} (was ${d.prior_value === null ? 'unset' : d.prior_value ? 'Enabled' : 'Disabled'})`
    case 'permission.individual_exception_granted':
      return `${d.permission} → ${d.is_enabled ? 'Allow' : 'Deny'} for user ${d.user_id}`
    case 'permission.individual_exception_revoked':
      return `${d.permission} exception removed for user ${d.user_id}`
    case 'permission_group.created':
      return `"${d.name}"`
    case 'permission_group.archived':
      return 'Group archived'
    case 'permission_group.member_added':
    case 'permission_group.member_removed':
      return `user ${d.user_id}`
    case 'permission_group.permission_updated':
      return `${d.permission} → ${d.new_setting}`
    case 'role_delegation.created':
      return `delegator ${d.delegator_id} → delegate ${d.delegate_id}`
    case 'role_delegation.ended_manually':
    case 'role_delegation.ended_delegator_deactivated':
      return d.delegator_id ? `delegator ${d.delegator_id} → delegate ${d.delegate_id}` : ''
    default:
      return ''
  }
}

export default async function PermissionAuditHistoryPage() {
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('audit_logs')
    .select('id, action, details, created_at, actor:profiles!audit_logs_actor_id_fkey(full_name)')
    .or('action.like.permission%,action.like.role_delegation%')
    .order('created_at', { ascending: false })
    .limit(100)

  const entries = (rows ?? []).map(r => ({
    ...r,
    actor: Array.isArray(r.actor) ? r.actor[0] : r.actor,
  }))

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-white p-4 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
        <p className="text-[13px] leading-5 text-[#475569]">
          Every change to role defaults, individual exceptions, groups, and delegations, most recent first.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
          <p className="text-sm text-[#64748B]">No permission-related activity yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC] text-left text-[11px] font-bold uppercase tracking-[0.55px] text-[#64748B]">
                <th className="px-6 py-3">When</th>
                <th className="px-6 py-3">Actor</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {entries.map(e => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-6 py-4 text-[13px] text-[#475569]">
                    {new Date(e.created_at).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="px-6 py-4 text-[13px] font-semibold text-[#0F172A]">{e.actor?.full_name ?? '—'}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[11px] font-semibold text-[#334155]">
                      {ACTION_LABEL[e.action] ?? e.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[#475569]">
                    {describe(e.action, e.details as Record<string, unknown> | null)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

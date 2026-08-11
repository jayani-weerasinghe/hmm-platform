import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DelegationEndButton } from './delegation-end-button'

function statusOf(startsAt: string, endsAt: string, endedEarlyAt: string | null, endedReason: string | null, delegatorActive: boolean) {
  if (endedEarlyAt) {
    return endedReason === 'delegator_deactivated'
      ? { label: 'Ended (delegator deactivated)', cls: 'bg-gray-100 text-gray-600' }
      : { label: 'Ended Early', cls: 'bg-gray-100 text-gray-600' }
  }
  if (!delegatorActive) return { label: 'Ended (delegator deactivated)', cls: 'bg-gray-100 text-gray-600' }
  const now = new Date()
  if (new Date(startsAt) > now) return { label: 'Scheduled', cls: 'bg-yellow-100 text-yellow-700' }
  if (new Date(endsAt) <= now) return { label: 'Expired', cls: 'bg-gray-100 text-gray-600' }
  return { label: 'Active', cls: 'bg-green-100 text-green-700' }
}

export default async function DelegationsPage() {
  const supabase = await createClient()

  const { data: delegations } = await supabase
    .from('role_delegations')
    .select(`
      id, starts_at, ends_at, ended_early_at, ended_reason,
      delegator:profiles!role_delegations_delegator_id_fkey(full_name, is_active),
      delegate:profiles!role_delegations_delegate_id_fkey(full_name)
    `)
    .order('starts_at', { ascending: false })

  const rows = (delegations ?? []).map(d => ({
    ...d,
    delegator: Array.isArray(d.delegator) ? d.delegator[0] : d.delegator,
    delegate: Array.isArray(d.delegate) ? d.delegate[0] : d.delegate,
  }))

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          A delegate temporarily gains their delegator&apos;s full effective permission set, in
          addition to their own, for the scheduled window.
        </p>
        <Link
          href="/super-admin/permissions/delegations/new"
          className="rounded-lg bg-[#F5A623] px-4 py-2 text-sm font-semibold text-white hover:bg-[#D97706] transition-colors whitespace-nowrap"
        >
          Create Delegation
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
        {rows.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">No delegations yet.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Delegator</th>
                <th className="px-6 py-3">Delegate</th>
                <th className="px-6 py-3">Starts</th>
                <th className="px-6 py-3">Ends</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(d => {
                const status = statusOf(d.starts_at, d.ends_at, d.ended_early_at, d.ended_reason, d.delegator?.is_active ?? true)
                const canEnd = !d.ended_early_at && (d.delegator?.is_active ?? true) && new Date(d.ends_at) > new Date()
                return (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{d.delegator?.full_name ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{d.delegate?.full_name ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(d.starts_at).toLocaleDateString('en-AU', { dateStyle: 'medium' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(d.ends_at).toLocaleDateString('en-AU', { dateStyle: 'medium' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      {canEnd && <DelegationEndButton delegationId={d.id} />}
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

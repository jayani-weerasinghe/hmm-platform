'use client'

import { useTransition } from 'react'
import { addGroupMemberAction } from '@/actions/permissions'

interface UserOption {
  id: string
  full_name: string
  role: string
}

export function GroupMemberAddForm({ groupId, availableUsers }: { groupId: string; availableUsers: UserOption[] }) {
  const [isPending, startTransition] = useTransition()

  if (availableUsers.length === 0) {
    return <p className="text-sm text-gray-400">All active Champions and Gatekeepers are already members.</p>
  }

  return (
    <form
      action={(fd) => startTransition(() => addGroupMemberAction(fd))}
      className="flex gap-2"
    >
      <input type="hidden" name="group_id" value={groupId} />
      <select
        name="user_id"
        required
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Add a member…</option>
        {availableUsers.map(u => (
          <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
      >
        {isPending ? 'Adding…' : 'Add'}
      </button>
    </form>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { removeGroupMemberAction } from '@/actions/permissions'

export function GroupMemberRemoveButton({ groupId, userId }: { groupId: string; userId: string }) {
  const [confirm, setConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!confirm) {
    return (
      <button onClick={() => setConfirm(true)} className="text-red-600 hover:text-red-800">
        Remove
      </button>
    )
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-xs text-gray-500">Remove?</span>
      <form action={(fd) => startTransition(() => removeGroupMemberAction(fd))} className="inline-flex gap-2">
        <input type="hidden" name="group_id" value={groupId} />
        <input type="hidden" name="user_id" value={userId} />
        <button type="submit" disabled={isPending} className="font-medium text-red-600 hover:text-red-800 disabled:opacity-50">
          {isPending ? '…' : 'Yes'}
        </button>
        <button type="button" onClick={() => setConfirm(false)} className="text-gray-600 hover:text-gray-900">
          Cancel
        </button>
      </form>
    </span>
  )
}

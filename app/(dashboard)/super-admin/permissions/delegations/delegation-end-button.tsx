'use client'

import { useState, useTransition } from 'react'
import { endDelegationAction } from '@/actions/permissions'

export function DelegationEndButton({ delegationId }: { delegationId: string }) {
  const [confirm, setConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!confirm) {
    return (
      <button onClick={() => setConfirm(true)} className="text-red-600 hover:text-red-800">
        End Now
      </button>
    )
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-xs text-gray-500">End this delegation now?</span>
      <form action={(fd) => startTransition(() => endDelegationAction(fd))} className="inline-flex gap-2">
        <input type="hidden" name="delegation_id" value={delegationId} />
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

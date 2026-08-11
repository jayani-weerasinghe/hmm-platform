'use client'

import { useState, useTransition } from 'react'
import { revokeIndividualExceptionAction } from '@/actions/permissions'

export function ExceptionRevokeButton({
  overrideId,
  userId,
  permission,
}: {
  overrideId: string
  userId: string
  permission: string
}) {
  const [confirm, setConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!confirm) {
    return (
      <button onClick={() => setConfirm(true)} className="text-red-600 hover:text-red-800">
        Revoke
      </button>
    )
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-xs text-gray-500">Revoke this exception?</span>
      <form action={(fd) => startTransition(() => revokeIndividualExceptionAction(fd))} className="inline-flex gap-2">
        <input type="hidden" name="override_id" value={overrideId} />
        <input type="hidden" name="user_id" value={userId} />
        <input type="hidden" name="permission" value={permission} />
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

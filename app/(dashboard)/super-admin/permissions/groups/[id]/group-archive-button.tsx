'use client'

import { useState, useTransition } from 'react'
import { archiveGroupAction } from '@/actions/permissions'

export function GroupArchiveButton({ groupId }: { groupId: string }) {
  const [confirm, setConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Archive Group
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <p className="max-w-xs text-xs text-gray-600">
        Members lose any permission that came only from this group, reverting to their role
        default (or another group they still belong to).
      </p>
      <form action={(fd) => startTransition(() => archiveGroupAction(fd))} className="flex gap-2">
        <input type="hidden" name="group_id" value={groupId} />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? '…' : 'Yes, Archive'}
        </button>
        <button
          type="button"
          onClick={() => setConfirm(false)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </form>
    </div>
  )
}

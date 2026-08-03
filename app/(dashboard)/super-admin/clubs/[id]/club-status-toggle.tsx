'use client'

import { useState, useTransition } from 'react'
import { deactivateClubAction, reactivateClubAction } from '@/actions/clubs'

export function ClubStatusToggle({ clubId, isActive }: { clubId: string; isActive: boolean }) {
  const [confirm, setConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'border border-red-300 text-red-600 hover:bg-red-50'
            : 'border border-green-300 text-green-700 hover:bg-green-50'
        }`}
      >
        {isActive ? 'Deactivate' : 'Reactivate'}
      </button>
    )
  }

  const action = isActive ? deactivateClubAction : reactivateClubAction
  const label  = isActive ? 'Deactivate' : 'Reactivate'
  const warning = isActive
    ? 'This will restrict access for all Champions and Gatekeepers in this club.'
    : 'This will restore access for all Champions and Gatekeepers deactivated when the club was closed.'

  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <p className="max-w-xs text-xs text-gray-600">{warning}</p>
      <form action={(fd) => startTransition(() => action(fd))} className="flex gap-2">
        <input type="hidden" name="club_id" value={clubId} />
        <button
          type="submit"
          disabled={isPending}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium text-white ${
            isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          } disabled:opacity-50`}
        >
          {isPending ? '…' : `Yes, ${label}`}
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

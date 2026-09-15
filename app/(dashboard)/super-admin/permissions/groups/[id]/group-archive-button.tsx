'use client'

import { useState, useTransition } from 'react'
import { archiveGroupAction } from '@/actions/permissions'

export function GroupArchiveButton({ groupId }: { groupId: string }) {
  const [confirm, setConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!confirm) {
    return (
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="rounded-lg bg-white px-4 py-2 text-[13px] font-semibold text-[#DC2626] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] ring-1 ring-[#FECACA] transition-colors hover:bg-red-50"
      >
        Archive Group
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-3">
      <p className="max-w-xs text-[12px] text-[#475569]">
        Members lose any permission that came only from this group, reverting to their role
        default (or another group they still belong to).
      </p>
      <form action={(fd) => startTransition(() => archiveGroupAction(fd))} className="flex flex-shrink-0 gap-2">
        <input type="hidden" name="group_id" value={groupId} />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-[#DC2626] px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-50"
        >
          {isPending ? '…' : 'Yes, Archive'}
        </button>
        <button
          type="button"
          onClick={() => setConfirm(false)}
          className="rounded-lg bg-white px-3 py-1.5 text-[12px] font-semibold text-[#475569] ring-1 ring-[#E2E8F0] transition-colors hover:bg-slate-50"
        >
          Cancel
        </button>
      </form>
    </div>
  )
}

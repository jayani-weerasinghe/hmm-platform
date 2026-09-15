'use client'

import { useState, useTransition } from 'react'
import { deleteAnnouncementAction } from '@/actions/announcements'

export function AnnouncementDeleteButton({ announcementId }: { announcementId: string }) {
  const [confirm, setConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!confirm) {
    return (
      <button
        type="button"
        onClick={() => setConfirm(true)}
        aria-label="Delete announcement"
        className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[11px] font-semibold tracking-[0.44px] text-[#DC2626] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] ring-1 ring-[#E2E8F0] transition-colors hover:bg-red-50"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/trash.svg" alt="" width={11} height={12} />
      </button>
    )
  }

  return (
    <form
      action={(fd) => startTransition(() => deleteAnnouncementAction(fd))}
      className="flex items-center gap-1.5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-2 py-1.5"
    >
      <input type="hidden" name="announcement_id" value={announcementId} />
      <span className="text-[11px] text-[#475569]">Delete?</span>
      <button type="submit" disabled={isPending} className="text-[11px] font-semibold text-[#DC2626] disabled:opacity-50">
        {isPending ? '…' : 'Yes'}
      </button>
      <button type="button" onClick={() => setConfirm(false)} className="text-[11px] font-semibold text-[#475569]">
        No
      </button>
    </form>
  )
}

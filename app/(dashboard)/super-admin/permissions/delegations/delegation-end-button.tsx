'use client'

import { useState, useTransition } from 'react'
import { endDelegationAction } from '@/actions/permissions'

export function DelegationEndButton({ delegationId }: { delegationId: string }) {
  const [confirm, setConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!confirm) {
    return (
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="rounded-lg px-3 py-1.5 text-[12px] font-semibold tracking-[0.24px] text-[#DC2626] transition-colors hover:bg-red-50"
      >
        End Now
      </button>
    )
  }

  return (
    <form
      action={(fd) => startTransition(() => endDelegationAction(fd))}
      className="flex items-center justify-end gap-1.5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-2 py-1.5"
    >
      <input type="hidden" name="delegation_id" value={delegationId} />
      <span className="text-[11px] text-[#475569]">Sure?</span>
      <button type="submit" disabled={isPending} className="text-[11px] font-semibold text-[#DC2626] disabled:opacity-50">
        {isPending ? '…' : 'Yes'}
      </button>
      <button type="button" onClick={() => setConfirm(false)} className="text-[11px] font-semibold text-[#475569]">
        No
      </button>
    </form>
  )
}

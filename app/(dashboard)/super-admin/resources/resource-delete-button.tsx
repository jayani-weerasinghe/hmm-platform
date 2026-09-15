'use client'

import { useState, useTransition } from 'react'
import { deleteResourceAction } from '@/actions/resources'

// Not part of the Figma design (which shows only a primary action + Edit
// per row) — kept as a third stacked action so delete stays available;
// dropping real functionality to match a design that simply didn't depict
// it would be a regression, not a fidelity improvement.
export function ResourceDeleteButton({ resourceId, contentUrl }: { resourceId: string; contentUrl: string | null }) {
  const [confirm, setConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!confirm) {
    return (
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="rounded-lg px-3 py-1.5 text-[12px] font-semibold tracking-[0.24px] text-[#DC2626] hover:bg-red-50 transition-colors"
      >
        Delete
      </button>
    )
  }

  return (
    <form
      action={(fd) => startTransition(() => deleteResourceAction(fd))}
      className="flex items-center gap-1.5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-2 py-1"
    >
      <input type="hidden" name="resource_id" value={resourceId} />
      <input type="hidden" name="content_url" value={contentUrl ?? ''} />
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

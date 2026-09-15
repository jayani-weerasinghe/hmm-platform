'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deactivateGatekeeperAction } from '@/actions/gatekeepers'

export function GatekeeperStatusControls({
  gatekeeperId,
  isActive,
}: {
  gatekeeperId: string
  isActive: boolean
}) {
  const [confirm, setConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  if (!isActive) {
    return (
      <a
        href={`/super-admin/gatekeepers/${gatekeeperId}/reactivate`}
        className="flex items-center gap-1.5 rounded-lg border border-[#BBF0C3] bg-white px-4 py-2.5 text-xs font-semibold text-[#0D8275] shadow-sm hover:bg-[#E6FFE7]"
      >
        Reactivate
      </a>
    )
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="flex items-center gap-1.5 rounded-lg border border-[#FECACA] bg-white px-4 py-2.5 text-xs font-semibold text-[#DC2626] shadow-sm hover:bg-[#FEF2F2]"
      >
        Deactivate
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] bg-white p-3 shadow-sm">
      <p className="max-w-xs text-xs text-[#475569]">
        This will revoke the gatekeeper&apos;s login access. Their club and record will be unaffected.
      </p>
      <form
        action={(fd) => startTransition(async () => {
          await deactivateGatekeeperAction(null, fd)
          setConfirm(false)
          router.refresh()
        })}
        className="flex gap-2"
      >
        <input type="hidden" name="gatekeeper_id" value={gatekeeperId} />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-[#DC2626] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#B91C1C] disabled:opacity-50"
        >
          {isPending ? '…' : 'Yes, Deactivate'}
        </button>
        <button
          type="button"
          onClick={() => setConfirm(false)}
          className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-semibold text-[#475569] hover:bg-gray-50"
        >
          Cancel
        </button>
      </form>
    </div>
  )
}

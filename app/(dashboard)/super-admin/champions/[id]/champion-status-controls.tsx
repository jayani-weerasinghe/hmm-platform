'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deactivateChampionAction } from '@/actions/champions'

export function ChampionStatusControls({
  championId,
  isActive,
  clubIsActive,
}: {
  championId: string
  isActive: boolean
  clubIsActive: boolean
}) {
  const [confirm, setConfirm] = useState(false)
  const [soleWarning, setSoleWarning] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  if (!isActive) {
    return (
      <a
        href={`/super-admin/champions/${championId}/reactivate`}
        className="flex items-center gap-1.5 rounded-lg border border-[#BBF0C3] bg-white px-4 py-2.5 text-xs font-semibold text-[#0D8275] shadow-sm hover:bg-[#E6FFE7]"
      >
        Reactivate
      </a>
    )
  }

  if (soleWarning) {
    return (
      <div className="rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-3 text-xs text-[#D97706]">
        This champion was the sole active champion in their club. The club now has no active champions.
        <button onClick={() => setSoleWarning(false)} className="ml-2 font-semibold underline">Dismiss</button>
      </div>
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
        This will revoke the champion&apos;s login access. Their club and data will be unaffected.
      </p>
      <form
        action={(fd) => startTransition(async () => {
          const result = await deactivateChampionAction(null, fd)
          if (result?.soleChampion) setSoleWarning(true)
          setConfirm(false)
          router.refresh()
        })}
        className="flex gap-2"
      >
        <input type="hidden" name="champion_id" value={championId} />
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

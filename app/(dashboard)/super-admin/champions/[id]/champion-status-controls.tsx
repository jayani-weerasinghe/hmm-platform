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
        className="rounded-lg border border-green-300 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
      >
        Reactivate
      </a>
    )
  }

  if (soleWarning) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
        This champion was the sole active champion in their club. The club now has no active champions.
        <button onClick={() => setSoleWarning(false)} className="ml-2 underline">Dismiss</button>
      </div>
    )
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Deactivate
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <p className="max-w-xs text-xs text-gray-600">
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
          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? '…' : 'Yes, Deactivate'}
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

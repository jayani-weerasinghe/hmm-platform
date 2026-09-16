'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ModalOverlay } from '@/components/modal-overlay'
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
      <Link
        href={`/super-admin/champions/${championId}/reactivate`}
        className="flex items-center gap-1.5 rounded-lg border border-[#BBF0C3] bg-white px-4 py-2.5 text-xs font-semibold text-[#0D8275] shadow-sm hover:bg-[#E6FFE7]"
      >
        Reactivate
      </Link>
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

  return (
    <>
      <button
        onClick={() => setConfirm(true)}
        className="flex items-center gap-1.5 rounded-lg border border-[#FECACA] bg-white px-4 py-2.5 text-xs font-semibold text-[#DC2626] shadow-sm hover:bg-[#FEF2F2]"
      >
        Deactivate
      </button>

      {confirm && (
        <ModalOverlay onClose={() => setConfirm(false)}>
          <div className="mx-auto w-full max-w-[480px] overflow-hidden rounded-2xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] font-[family-name:var(--font-inter)]">
            <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
              <h1 className="text-[18px] font-bold leading-[24px] text-[#0F172A]">Deactivate Champion</h1>
              <button
                type="button"
                onClick={() => setConfirm(false)}
                aria-label="Close"
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#F1F5F9]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/x-close.svg" alt="" width={11.67} height={11.67} />
              </button>
            </div>

            <div className="px-6 pb-6">
              <p className="text-[13px] leading-5 text-[#475569]">
                This will immediately revoke the champion&apos;s login access. Their club assignment and historical
                data will be preserved and unaffected — this can be undone at any time via Reactivate.
              </p>
            </div>

            <form
              action={(fd) => startTransition(async () => {
                const result = await deactivateChampionAction(null, fd)
                if (result?.soleChampion) setSoleWarning(true)
                setConfirm(false)
                router.refresh()
              })}
              className="flex items-center justify-end gap-2.5 border-t border-[#E2E8F0] px-6 py-4"
            >
              <input type="hidden" name="champion_id" value={championId} />
              <button
                type="button"
                onClick={() => setConfirm(false)}
                className="flex h-10 items-center rounded-lg bg-[#F1F5F9] px-4 text-[13px] font-medium text-[#0F172A] transition-colors hover:bg-[#E2E8F0]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex h-10 items-center rounded-lg bg-[#DC2626] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-60"
              >
                {isPending ? 'Deactivating…' : 'Yes, Deactivate'}
              </button>
            </form>
          </div>
        </ModalOverlay>
      )}
    </>
  )
}

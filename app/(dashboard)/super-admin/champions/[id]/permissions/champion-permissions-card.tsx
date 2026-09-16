'use client'

import { useRouter } from 'next/navigation'
import { EffectivePermissionsTable, type EffectiveRow } from '@/app/(dashboard)/super-admin/permissions/effective/effective-permissions-table'

interface Champion {
  id: string
  full_name: string
  is_active: boolean
}

export function ChampionPermissionsCard({
  champion,
  rows,
  error,
  onClose,
}: {
  champion: Champion
  rows: EffectiveRow[]
  error?: string
  onClose?: () => void
}) {
  const router = useRouter()
  const close = onClose ?? (() => router.push(`/super-admin/champions/${champion.id}`))

  return (
    <div className="mx-auto flex max-h-[85vh] w-full max-w-[720px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] font-[family-name:var(--font-inter)]">
      <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-[18px] font-bold leading-[24px] text-[#0F172A]">Permissions — {champion.full_name}</h1>
          <p className="text-[12px] leading-[16px] text-[#64748B]">
            Effective result and which layer decided it — Individual overrides Group, which overrides Role Default.
            {!champion.is_active && <span className="ml-1 text-[#DC2626]">(inactive)</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#F1F5F9]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/x-close.svg" alt="" width={11.67} height={11.67} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-6">
        {error ? (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            Could not resolve this champion&apos;s permissions: {error}
          </div>
        ) : (
          <EffectivePermissionsTable rows={rows} roleName="Champion" />
        )}
      </div>

      <div className="flex items-center justify-end gap-2.5 border-t border-[#E2E8F0] px-6 py-4">
        <button
          type="button"
          onClick={close}
          className="flex h-10 items-center rounded-lg bg-[#F1F5F9] px-4 text-[13px] font-medium text-[#0F172A] transition-colors hover:bg-[#E2E8F0]"
        >
          Close
        </button>
      </div>
    </div>
  )
}

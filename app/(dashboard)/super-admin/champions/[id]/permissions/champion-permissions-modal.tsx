'use client'

import { useRouter } from 'next/navigation'
import { ModalOverlay } from '@/components/modal-overlay'
import { ChampionPermissionsCard } from './champion-permissions-card'
import { type EffectiveRow } from '@/app/(dashboard)/super-admin/permissions/effective/effective-permissions-table'

interface Champion {
  id: string
  full_name: string
  is_active: boolean
}

export function ChampionPermissionsModal({
  champion,
  rows,
  error,
}: {
  champion: Champion
  rows: EffectiveRow[]
  error?: string
}) {
  const router = useRouter()
  const close = () => router.back()

  return (
    <ModalOverlay onClose={close}>
      <ChampionPermissionsCard champion={champion} rows={rows} error={error} onClose={close} />
    </ModalOverlay>
  )
}

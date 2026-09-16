'use client'

import { useRouter } from 'next/navigation'
import { ModalOverlay } from '@/components/modal-overlay'
import { ReactivateChampionForm } from '../../../[id]/reactivate/reactivate-champion-form'

interface Champion { id: string; full_name: string; email: string; club_id: string | null }
interface Club { id: string; name: string; is_active?: boolean }

export function ReactivateChampionModal({
  champion,
  currentClub,
  activeClubs,
}: {
  champion: Champion
  currentClub: Club | null
  activeClubs: Club[]
}) {
  const router = useRouter()
  const close = () => router.back()

  return (
    <ModalOverlay onClose={close}>
      <ReactivateChampionForm champion={champion} currentClub={currentClub} activeClubs={activeClubs} onClose={close} />
    </ModalOverlay>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { ModalOverlay } from '@/components/modal-overlay'
import { ReactivateGatekeeperForm } from '@/app/(dashboard)/super-admin/gatekeepers/[id]/reactivate/reactivate-gatekeeper-form'

interface Gatekeeper { id: string; full_name: string; email: string; club_id: string | null }
interface Club { id: string; name: string; is_active?: boolean }

export function ReactivateGatekeeperModal({
  gatekeeper,
  currentClub,
  activeClubs,
}: {
  gatekeeper: Gatekeeper
  currentClub: Club | null
  activeClubs: Club[]
}) {
  const router = useRouter()
  const close = () => router.back()

  return (
    <ModalOverlay onClose={close}>
      <ReactivateGatekeeperForm gatekeeper={gatekeeper} currentClub={currentClub} activeClubs={activeClubs} onClose={close} />
    </ModalOverlay>
  )
}

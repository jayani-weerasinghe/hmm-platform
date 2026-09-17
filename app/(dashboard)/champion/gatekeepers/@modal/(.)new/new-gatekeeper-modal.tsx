'use client'

import { useRouter } from 'next/navigation'
import { ModalOverlay } from '@/components/modal-overlay'
import { CreateGatekeeperForm } from '../../create-gatekeeper-form'

export function NewGatekeeperModal({ clubName }: { clubName: string }) {
  const router = useRouter()
  const close = () => router.back()

  return (
    <ModalOverlay onClose={close}>
      <CreateGatekeeperForm clubName={clubName} onClose={close} />
    </ModalOverlay>
  )
}

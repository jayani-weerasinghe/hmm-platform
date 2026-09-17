'use client'

import { useRouter } from 'next/navigation'
import { ModalOverlay } from '@/components/modal-overlay'
import { CreateAnnouncementForm } from '../../create-announcement-form'

export function NewAnnouncementModal({ clubName }: { clubName: string }) {
  const router = useRouter()
  const close = () => router.back()

  return (
    <ModalOverlay onClose={close}>
      <CreateAnnouncementForm clubName={clubName} onClose={close} />
    </ModalOverlay>
  )
}

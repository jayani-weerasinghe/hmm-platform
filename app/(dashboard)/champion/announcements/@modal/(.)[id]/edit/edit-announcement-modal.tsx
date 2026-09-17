'use client'

import { useRouter } from 'next/navigation'
import { ModalOverlay } from '@/components/modal-overlay'
import { EditAnnouncementForm } from '../../../[id]/edit/edit-announcement-form'

interface AnnouncementValues {
  id: string
  title: string
  body: string
  publish_date: string
  expiry_date: string | null
}

export function EditAnnouncementModal({ announcement }: { announcement: AnnouncementValues }) {
  const router = useRouter()
  const close = () => router.back()

  return (
    <ModalOverlay onClose={close}>
      <EditAnnouncementForm announcement={announcement} onClose={close} />
    </ModalOverlay>
  )
}

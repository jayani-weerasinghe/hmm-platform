'use client'

import { useRouter } from 'next/navigation'
import { ModalOverlay } from '@/components/modal-overlay'
import { AnnouncementForm } from '../../../announcement-form'

interface AnnouncementValues {
  id: string
  title: string
  body: string
  publish_date: string
  expiry_date: string | null
  priority: 'standard' | 'mandatory' | 'urgent'
  audience: 'all' | 'champions' | 'gatekeepers' | 'specific_clubs'
  status: 'draft' | 'published'
  club_id: string | null
  is_pinned: boolean
}

export function EditAnnouncementModal({
  announcement,
  clubs,
}: {
  announcement: AnnouncementValues
  clubs: { id: string; name: string }[]
}) {
  const router = useRouter()
  const close = () => router.back()

  return (
    <ModalOverlay onClose={close}>
      <AnnouncementForm announcement={announcement} clubs={clubs} onClose={close} />
    </ModalOverlay>
  )
}

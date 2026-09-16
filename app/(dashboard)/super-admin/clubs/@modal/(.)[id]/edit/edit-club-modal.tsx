'use client'

import { useRouter } from 'next/navigation'
import { ModalOverlay } from '@/components/modal-overlay'
import { ClubEditForm } from '../../../[id]/edit/club-edit-form'

interface Club {
  id: string
  club_code: string | null
  name: string
  location: string
  description: string | null
  contact_email: string | null
  contact_phone: string | null
  is_active: boolean
}

export function EditClubModal({ club }: { club: Club }) {
  const router = useRouter()
  const close = () => router.back()

  return (
    <ModalOverlay onClose={close}>
      <ClubEditForm club={club} onClose={close} />
    </ModalOverlay>
  )
}

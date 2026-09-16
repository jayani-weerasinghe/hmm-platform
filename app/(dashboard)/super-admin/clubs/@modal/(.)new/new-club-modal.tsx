'use client'

import { useRouter } from 'next/navigation'
import { ModalOverlay } from '@/components/modal-overlay'
import { CreateClubForm } from '../../create-club-form'

export function NewClubModal() {
  const router = useRouter()
  const close = () => router.back()

  return (
    <ModalOverlay onClose={close}>
      <CreateClubForm onClose={close} />
    </ModalOverlay>
  )
}

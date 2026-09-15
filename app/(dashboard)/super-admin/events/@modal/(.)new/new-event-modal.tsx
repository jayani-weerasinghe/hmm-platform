'use client'

import { useRouter } from 'next/navigation'
import { ModalOverlay } from '@/components/modal-overlay'
import { CreateEventForm } from '../../create-event-form'

export function NewEventModal({ clubs }: { clubs: { id: string; name: string }[] }) {
  const router = useRouter()
  const close = () => router.back()

  return (
    <ModalOverlay onClose={close}>
      <CreateEventForm clubs={clubs} onClose={close} />
    </ModalOverlay>
  )
}

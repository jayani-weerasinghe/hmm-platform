'use client'

import { useRouter } from 'next/navigation'
import { ModalOverlay } from '@/components/modal-overlay'
import { EditEventForm } from '../../../[id]/edit/edit-event-form'

interface EventValues {
  id: string
  title: string
  type: string
  event_date: string
  start_time: string
  end_time: string
  venue: string
  facilitator: string
  virtual_link: string
  max_participants: string
  description: string
  club_name: string
}

export function EditEventModal({ event }: { event: EventValues }) {
  const router = useRouter()
  const close = () => router.back()

  return (
    <ModalOverlay onClose={close}>
      <EditEventForm event={event} onClose={close} />
    </ModalOverlay>
  )
}

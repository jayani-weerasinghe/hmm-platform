'use client'

import { useRouter } from 'next/navigation'
import { ModalOverlay } from '@/components/modal-overlay'
import { EditResourceForm } from '../../../resource-form'

interface ResourceValues {
  id: string
  title: string
  description: string | null
  type: string
  category: string | null
  publication_date: string
  content_url: string | null
  content_text: string | null
}

export function EditResourceModal({ resource }: { resource: ResourceValues }) {
  const router = useRouter()
  const close = () => router.back()

  return (
    <ModalOverlay onClose={close}>
      <EditResourceForm resource={resource} onClose={close} />
    </ModalOverlay>
  )
}

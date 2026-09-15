'use client'

import { useRouter } from 'next/navigation'
import { ModalOverlay } from '@/components/modal-overlay'
import { CreateResourceForm } from '../../create-resource-form'

export function NewResourceModal({ categories }: { categories: string[] }) {
  const router = useRouter()
  const close = () => router.back()

  return (
    <ModalOverlay onClose={close}>
      <CreateResourceForm categories={categories} onClose={close} />
    </ModalOverlay>
  )
}

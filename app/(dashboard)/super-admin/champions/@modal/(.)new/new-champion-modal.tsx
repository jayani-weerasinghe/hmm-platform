'use client'

import { useRouter } from 'next/navigation'
import { ModalOverlay } from '@/components/modal-overlay'
import { CreateChampionForm } from '../../create-champion-form'

interface Club { id: string; name: string }

export function NewChampionModal({ clubs }: { clubs: Club[] }) {
  const router = useRouter()
  const close = () => router.back()

  return (
    <ModalOverlay onClose={close}>
      <CreateChampionForm clubs={clubs} onClose={close} />
    </ModalOverlay>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { ModalOverlay } from '@/components/modal-overlay'
import { ChampionEditForm } from '../../../[id]/edit/champion-edit-form'

interface Champion {
  id: string
  full_name: string
  email: string
  phone: string | null
  title: string | null
  club_id: string | null
  version: number
}
interface Club { id: string; name: string }

export function EditChampionModal({ champion, clubs }: { champion: Champion; clubs: Club[] }) {
  const router = useRouter()
  const close = () => router.back()

  return (
    <ModalOverlay onClose={close}>
      <ChampionEditForm champion={champion} clubs={clubs} onClose={close} />
    </ModalOverlay>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { ModalOverlay } from '@/components/modal-overlay'
import { NewDelegationForm } from '../../../delegations/new/new-delegation-form'

interface UserOption {
  id: string
  full_name: string
  role: string
}

export function NewDelegationModal({ users }: { users: UserOption[] }) {
  const router = useRouter()
  const close = () => router.back()

  return (
    <ModalOverlay onClose={close}>
      <NewDelegationForm users={users} onClose={close} />
    </ModalOverlay>
  )
}

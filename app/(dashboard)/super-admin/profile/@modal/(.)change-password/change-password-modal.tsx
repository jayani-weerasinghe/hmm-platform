'use client'

import { useRouter } from 'next/navigation'
import { ModalOverlay } from '@/components/modal-overlay'
import { ChangePasswordForm } from '../../change-password-form'

export function ChangePasswordModal() {
  const router = useRouter()
  const close = () => router.back()

  return (
    <ModalOverlay onClose={close}>
      <ChangePasswordForm onClose={close} />
    </ModalOverlay>
  )
}

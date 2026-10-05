'use client'

import { useRouter } from 'next/navigation'
import { ModalOverlay } from '@/components/modal-overlay'
import { ChangeEmailForm } from '../../change-email-form'

export function ChangeEmailModal({ currentEmail, pendingEmail }: { currentEmail: string; pendingEmail: string | null }) {
  const router = useRouter()
  const close = () => router.back()

  return (
    <ModalOverlay onClose={close}>
      <ChangeEmailForm currentEmail={currentEmail} pendingEmail={pendingEmail} onClose={close} />
    </ModalOverlay>
  )
}

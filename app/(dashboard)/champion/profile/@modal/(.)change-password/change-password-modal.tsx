'use client'

import { useRouter } from 'next/navigation'
import { ModalOverlay } from '@/components/modal-overlay'
import { ChangePasswordForm } from '@/app/(dashboard)/super-admin/profile/change-password-form'

export function ChampionChangePasswordModal() {
  const router = useRouter()
  const close = () => router.back()

  return (
    <ModalOverlay onClose={close}>
      <ChangePasswordForm onClose={close} profilePath="/champion/profile" />
    </ModalOverlay>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { updateRoleDefaultAction } from '@/actions/permissions'

export function RoleDefaultToggle({
  role,
  permission,
  initialEnabled,
}: {
  role: 'champion' | 'gatekeeper'
  permission: string
  initialEnabled: boolean
}) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [isPending, startTransition] = useTransition()

  function toggle() {
    const next = !enabled
    setEnabled(next)
    const fd = new FormData()
    fd.set('role', role)
    fd.set('permission', permission)
    fd.set('is_enabled', String(next))
    startTransition(async () => {
      await updateRoleDefaultAction(fd)
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      role="switch"
      aria-checked={enabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
        enabled ? 'bg-[#F4AC1E]' : 'bg-[#E2E8F0]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

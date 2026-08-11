'use client'

import { useState, useTransition } from 'react'
import { setGroupPermissionAction } from '@/actions/permissions'

type Setting = 'unset' | 'allow' | 'deny'

export function GroupPermissionControl({
  groupId,
  permission,
  initialSetting,
}: {
  groupId: string
  permission: string
  initialSetting: Setting
}) {
  const [setting, setSetting] = useState<Setting>(initialSetting)
  const [isPending, startTransition] = useTransition()

  function apply(next: Setting) {
    setSetting(next)
    const fd = new FormData()
    fd.set('group_id', groupId)
    fd.set('permission', permission)
    fd.set('setting', next)
    startTransition(async () => {
      await setGroupPermissionAction(fd)
    })
  }

  const OPTIONS: { value: Setting; label: string }[] = [
    { value: 'unset', label: 'Not Set' },
    { value: 'allow', label: 'Allow' },
    { value: 'deny', label: 'Deny' },
  ]

  return (
    <div className="inline-flex rounded-lg border border-gray-200 p-0.5" role="radiogroup">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={setting === opt.value}
          disabled={isPending}
          onClick={() => apply(opt.value)}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
            setting === opt.value
              ? opt.value === 'allow'
                ? 'bg-green-100 text-green-700'
                : opt.value === 'deny'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-200 text-gray-700'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

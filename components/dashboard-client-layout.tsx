'use client'

import { useState, useCallback, useTransition } from 'react'
import Link from 'next/link'
import { useSessionTimeout } from '@/hooks/use-session-timeout'
import { SessionTimeoutModal } from '@/components/session-timeout-modal'
import { logoutAction } from '@/actions/auth'

const TIMEOUT_MS = 20 * 60 * 1000  // 20 minutes idle
const WARNING_MS =  2 * 60 * 1000  // warn 2 minutes before

interface Profile {
  full_name: string
  role: 'super_admin' | 'champion' | 'gatekeeper'
}

export function DashboardClientLayout({
  children,
  profile,
}: {
  children: React.ReactNode
  profile: Profile
}) {
  const [showWarning, setShowWarning] = useState(false)
  const [isPending, startTransition]  = useTransition()

  const handleTimeout = useCallback(() => {
    startTransition(() => logoutAction())
  }, [])

  const { reset } = useSessionTimeout({
    timeoutMs:        TIMEOUT_MS,
    warningMs:        WARNING_MS,
    onWarning:        () => setShowWarning(true),
    onDismissWarning: () => setShowWarning(false),
    onTimeout:        handleTimeout,
  })

  const handleStayActive = useCallback(() => {
    setShowWarning(false)
    reset()
  }, [reset])

  const roleLabel = profile.role === 'super_admin' ? 'Super Admin' : 'Champion'

  return (
    <>
      <nav className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-900">Healing Minds Matter</span>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            {roleLabel}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{profile.full_name}</span>
          <Link
            href="/settings/change-password"
            className="hover:text-gray-900 underline underline-offset-2"
          >
            Change password
          </Link>
          <button
            onClick={() => startTransition(() => logoutAction())}
            disabled={isPending}
            className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {isPending ? 'Logging out…' : 'Log out'}
          </button>
        </div>
      </nav>

      <main className="flex-1 bg-gray-50">
        {children}
      </main>

      {showWarning && (
        <SessionTimeoutModal
          warningMs={WARNING_MS}
          onStayActive={handleStayActive}
          onTimeout={handleTimeout}
        />
      )}
    </>
  )
}

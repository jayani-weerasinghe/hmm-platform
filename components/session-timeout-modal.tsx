'use client'

import { useEffect, useState } from 'react'

interface Props {
  warningMs:    number
  onStayActive: () => void
  onTimeout:    () => void
}

export function SessionTimeoutModal({ warningMs, onStayActive, onTimeout }: Props) {
  const [seconds, setSeconds] = useState(Math.ceil(warningMs / 1000))

  useEffect(() => {
    if (seconds <= 0) {
      onTimeout()
      return
    }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds, onTimeout])

  const m = Math.floor(seconds / 60)
  const s = (seconds % 60).toString().padStart(2, '0')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm mx-4 rounded-2xl bg-white p-8 shadow-2xl text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl">
          ⏱
        </div>
        <h2 className="mb-2 text-lg font-semibold text-gray-900">
          Session expiring soon
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Your session will expire in{' '}
          <span className="font-semibold text-amber-600">
            {m}:{s}
          </span>{' '}
          due to inactivity.
        </p>
        <button
          onClick={onStayActive}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Stay logged in
        </button>
      </div>
    </div>
  )
}

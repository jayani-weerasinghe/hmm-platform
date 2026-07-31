'use client'

import { useEffect, useRef, useCallback } from 'react'

const ACTIVITY_EVENTS = [
  'mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll', 'click',
] as const

interface Options {
  timeoutMs:        number
  warningMs:        number
  onWarning:        () => void
  onTimeout:        () => void
  onDismissWarning: () => void
}

export function useSessionTimeout({
  timeoutMs,
  warningMs,
  onWarning,
  onTimeout,
  onDismissWarning,
}: Options) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningActive = useRef(false)

  // Keep callbacks in refs to avoid stale closures without re-subscribing events
  const onWarningRef        = useRef(onWarning)
  const onTimeoutRef        = useRef(onTimeout)
  const onDismissWarningRef = useRef(onDismissWarning)
  useEffect(() => { onWarningRef.current        = onWarning        }, [onWarning])
  useEffect(() => { onTimeoutRef.current        = onTimeout        }, [onTimeout])
  useEffect(() => { onDismissWarningRef.current = onDismissWarning }, [onDismissWarning])

  const clear = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
  }, [])

  const reset = useCallback(() => {
    clear()
    warningActive.current = false
    onDismissWarningRef.current()

    warningRef.current = setTimeout(() => {
      warningActive.current = true
      onWarningRef.current()
    }, timeoutMs - warningMs)

    timeoutRef.current = setTimeout(() => {
      onTimeoutRef.current()
    }, timeoutMs)
  }, [clear, timeoutMs, warningMs])

  useEffect(() => {
    // Activity resets the timer only if warning is not yet showing —
    // once warning is shown, only the "Stay logged in" button resets it
    const handleActivity = () => {
      if (!warningActive.current) reset()
    }

    ACTIVITY_EVENTS.forEach(e =>
      window.addEventListener(e, handleActivity, { passive: true })
    )
    reset()

    return () => {
      clear()
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, handleActivity))
    }
  }, [reset, clear])

  return { reset }
}

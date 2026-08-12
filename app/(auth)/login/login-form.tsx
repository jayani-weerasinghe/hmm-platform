'use client'

import { useActionState, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { loginAction } from '@/actions/auth'

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null)
  const searchParams = useSearchParams()
  const resetSuccess = searchParams.get('reset') === 'success'
  const errorParam = searchParams.get('error')
  const sessionExpired = errorParam === 'session_expired'
  const forcedLogoutMessage =
    errorParam === 'club_inactive' ? 'Your club is currently inactive. Please contact your administrator.' :
    errorParam === 'account_inactive' ? 'Your account has been deactivated. Please contact an administrator.' :
    null
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="rounded-3xl bg-white p-10 shadow-md">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#F5A623]">
        HMM PLATFORM
      </p>
      <h1 className="mb-1 text-3xl font-bold text-[#1B2B4A]">Sign in</h1>
      <p className="mb-8 text-sm text-gray-500">For Super Admins and Champions.</p>

      {resetSuccess && (
        <div className="mb-5 rounded-xl bg-green-50 p-3 text-sm text-green-700">
          Password reset successfully. Please sign in with your new password.
        </div>
      )}
      {sessionExpired && (
        <div className="mb-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
          Your session expired due to inactivity. Please sign in again.
        </div>
      )}
      {forcedLogoutMessage && (
        <div className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {forcedLogoutMessage}
        </div>
      )}
      {state?.error && (
        <div className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@healingmindsmatter.org"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              placeholder="••••••••••"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-16 text-sm outline-none transition focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#1B2B4A] hover:text-[#F5A623] transition-colors"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              name="keep_signed_in"
              className="h-4 w-4 rounded border-gray-300 accent-[#F5A623]"
            />
            Keep me signed in
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-[#1B2B4A] hover:text-[#F5A623] transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-[#F5A623] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E8941A] disabled:opacity-60"
        >
          {isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-gray-400">
        Gatekeepers use the HMM mobile app.{' '}
        <a
          href="mailto:support@healingmindsmatter.org"
          className="font-semibold text-[#1B2B4A] hover:underline"
        >
          Contact support
        </a>
      </p>
    </div>
  )
}

'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { loginAction } from '@/actions/auth'

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null)
  const searchParams = useSearchParams()
  const resetSuccess = searchParams.get('reset') === 'success'
  const sessionExpired = searchParams.get('error') === 'session_expired'

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">Sign in to your account</h2>

      {resetSuccess && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          Password reset successfully. Please sign in with your new password.
        </div>
      )}

      {sessionExpired && (
        <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          Your session expired due to inactivity. Please sign in again.
        </div>
      )}

      {state?.error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

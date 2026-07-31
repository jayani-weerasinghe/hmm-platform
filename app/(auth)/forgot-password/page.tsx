'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { forgotPasswordAction } from '@/actions/auth'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, null)
  const searchParams = useSearchParams()
  const linkExpired = searchParams.get('error') === 'link_expired'

  if (state?.sent) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl">
          ✓
        </div>
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Check your email</h2>
        {/* Scenario 02: generic message regardless of whether email exists */}
        <p className="mb-6 text-sm text-gray-500">
          If this email is registered, a password reset link has been sent. Please check
          your inbox and follow the instructions.
        </p>
        <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700">
          ← Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
      <h2 className="mb-1 text-xl font-semibold text-gray-900">Reset your password</h2>
      <p className="mb-6 text-sm text-gray-500">
        Enter your registered email and we&apos;ll send you a reset link.
      </p>

      {linkExpired && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
          Your reset link has expired or has already been used. Please request a new one.
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

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isPending ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700">
          ← Back to sign in
        </Link>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  )
}

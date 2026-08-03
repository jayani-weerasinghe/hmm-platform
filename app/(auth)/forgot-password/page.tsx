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
      <div className="rounded-3xl bg-white p-10 shadow-md text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl">
          ✓
        </div>
        <h2 className="mb-2 text-xl font-bold text-[#1B2B4A]">Check your email</h2>
        <p className="mb-6 text-sm text-gray-500">
          If this email is registered, a password reset link has been sent. Please check
          your inbox and follow the instructions.
        </p>
        <Link
          href="/login"
          className="text-sm font-semibold text-[#1B2B4A] hover:text-[#F5A623] transition-colors"
        >
          ← Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-3xl bg-white p-10 shadow-md">
      <Link
        href="/login"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1B2B4A] transition-colors"
      >
        ← Back to sign in
      </Link>

      <h1 className="mb-2 text-3xl font-bold text-[#1B2B4A]">Forgot password</h1>
      <p className="mb-8 text-sm text-gray-500">
        Enter your registered email and we&apos;ll send a link to reset your password.
      </p>

      {linkExpired && (
        <div className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">
          Your reset link has expired or has already been used. Please request a new one.
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

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-[#F5A623] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E8941A] disabled:opacity-60"
        >
          {isPending ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <div className="mt-6 rounded-xl bg-[#FEF3DC] p-4 text-sm text-[#9B6A0A]">
        The reset link expires in 30 minutes. Check your spam folder if it doesn&apos;t arrive
        within a few minutes.
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

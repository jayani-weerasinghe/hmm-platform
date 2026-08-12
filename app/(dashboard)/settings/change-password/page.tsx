'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { changePasswordAction } from '@/actions/auth'
import { checkPasswordRules } from '@/lib/password-validation'

const RULES = [
  { key: 'minLength'   , label: 'At least 8 characters' },
  { key: 'hasUppercase', label: 'At least one uppercase letter' },
  { key: 'hasLowercase', label: 'At least one lowercase letter' },
  { key: 'hasNumber'   , label: 'At least one number' },
  { key: 'hasSpecial'  , label: 'At least one special character (!@#$%^&*)' },
] as const

export default function ChangePasswordPage() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, null)
  const [newPassword, setNewPassword] = useState('')
  const rules = checkPasswordRules(newPassword)

  if (state?.success) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl">
            ✓
          </div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Password changed</h2>
          {/* Scenario 08 (confirmation email) is pending: no transactional email
              provider is configured yet, so we don't claim one was sent. */}
          <p className="mb-6 text-sm text-gray-500">
            Your password has been updated. If you did not make this change, please contact
            support immediately.
          </p>
          <Link
            href=".."
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-md">
        <div className="mb-6">
          <Link href=".." className="text-sm text-blue-600 hover:text-blue-700">
            ← Back
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-gray-900">Change password</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update your password. You&apos;ll be asked to sign in again on any other active sessions.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          {state?.error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 whitespace-pre-line" role="alert">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            {/* Real-time requirements checklist */}
            {newPassword.length > 0 && (
              <ul className="space-y-1 rounded-lg bg-gray-50 p-3 text-xs">
                {RULES.map(r => (
                  <li
                    key={r.key}
                    className={`flex items-center gap-2 ${rules[r.key] ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    <span>{rules[r.key] ? '✓' : '○'}</span>
                    {r.label}
                  </li>
                ))}
              </ul>
            )}

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
                Confirm new password
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isPending ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

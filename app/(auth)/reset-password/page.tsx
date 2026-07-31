'use client'

import { useActionState, useState } from 'react'
import { resetPasswordAction } from '@/actions/auth'
import { checkPasswordRules } from '@/lib/password-validation'

const RULES = [
  { key: 'minLength'   , label: 'At least 8 characters' },
  { key: 'hasUppercase', label: 'At least one uppercase letter' },
  { key: 'hasLowercase', label: 'At least one lowercase letter' },
  { key: 'hasNumber'   , label: 'At least one number' },
  { key: 'hasSpecial'  , label: 'At least one special character (!@#$%^&*)' },
] as const

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null)
  const [password, setPassword] = useState('')
  const rules = checkPasswordRules(password)

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
      <h2 className="mb-1 text-xl font-semibold text-gray-900">Set a new password</h2>
      <p className="mb-6 text-sm text-gray-500">
        Choose a strong password for your account.
      </p>

      {state?.error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 whitespace-pre-line" role="alert">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        {/* Real-time password requirements checklist */}
        {password.length > 0 && (
          <ul className="space-y-1 rounded-lg bg-gray-50 p-3 text-xs">
            {RULES.map(r => (
              <li key={r.key} className={`flex items-center gap-2 ${rules[r.key] ? 'text-green-600' : 'text-gray-400'}`}>
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
          {isPending ? 'Saving…' : 'Set new password'}
        </button>
      </form>
    </div>
  )
}

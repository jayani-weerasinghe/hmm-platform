'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { grantIndividualExceptionAction } from '@/actions/permissions'

interface UserOption {
  id: string
  full_name: string
  role: string
}

export function NewExceptionForm({ users }: { users: UserOption[] }) {
  const [state, formAction, isPending] = useActionState(grantIndividualExceptionAction, null)

  return (
    <div>
      <div className="mb-6">
        <Link href="/super-admin/permissions/exceptions" className="text-sm text-blue-600 hover:text-blue-800">
          ← Back to Exceptions
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-gray-900">Grant Individual Exception</h1>
      </div>

      <div className="mx-auto max-w-xl rounded-xl bg-white p-8 ring-1 ring-gray-200">
        {state?.error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {state.error}
          </div>
        )}
        <form action={formAction} className="space-y-5">
          <div>
            <label htmlFor="user_id" className="block text-sm font-medium text-gray-700">
              User <span className="text-red-500">*</span>
            </label>
            <select
              id="user_id"
              name="user_id"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a user…</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
              ))}
            </select>
            {users.length === 0 && (
              <p className="mt-1 text-xs text-gray-400">No active Champions or Gatekeepers exist yet.</p>
            )}
          </div>

          <div>
            <label htmlFor="permission" className="block text-sm font-medium text-gray-700">
              Permission Key <span className="text-red-500">*</span>
            </label>
            <input
              id="permission"
              name="permission"
              type="text"
              required
              placeholder="e.g. manage_events"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="is_enabled" className="block text-sm font-medium text-gray-700">
              Setting <span className="text-red-500">*</span>
            </label>
            <select
              id="is_enabled"
              name="is_enabled"
              required
              defaultValue="true"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">Allow</option>
              <option value="false">Deny</option>
            </select>
            <p className="mt-1 text-xs text-gray-400">
              This overrides both the user's Group and Role default settings for this permission only.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isPending ? 'Granting…' : 'Grant Exception'}
            </button>
            <Link
              href="/super-admin/permissions/exceptions"
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

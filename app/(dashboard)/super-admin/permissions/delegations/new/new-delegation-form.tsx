'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createDelegationAction } from '@/actions/permissions'

interface UserOption {
  id: string
  full_name: string
  role: string
}

export function NewDelegationForm({ users }: { users: UserOption[] }) {
  const [state, formAction, isPending] = useActionState(createDelegationAction, null)

  return (
    <div>
      <div className="mb-6">
        <Link href="/super-admin/permissions/delegations" className="text-sm text-blue-600 hover:text-blue-800">
          ← Back to Delegations
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-gray-900">Create Delegation</h1>
      </div>

      <div className="mx-auto max-w-xl rounded-xl bg-white p-8 ring-1 ring-gray-200">
        {state?.error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {state.error}
          </div>
        )}
        <form action={formAction} className="space-y-5">
          <div>
            <label htmlFor="delegator_id" className="block text-sm font-medium text-gray-700">
              Delegator (going on leave) <span className="text-red-500">*</span>
            </label>
            <select
              id="delegator_id"
              name="delegator_id"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a user…</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="delegate_id" className="block text-sm font-medium text-gray-700">
              Delegate (covering) <span className="text-red-500">*</span>
            </label>
            <select
              id="delegate_id"
              name="delegate_id"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a user…</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">
              The delegate keeps their own access and additionally gains the delegator&apos;s full
              effective permission set for the period below.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="starts_at" className="block text-sm font-medium text-gray-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                id="starts_at"
                name="starts_at"
                type="date"
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="ends_at" className="block text-sm font-medium text-gray-700">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                id="ends_at"
                name="ends_at"
                type="date"
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isPending ? 'Creating…' : 'Create Delegation'}
            </button>
            <Link
              href="/super-admin/permissions/delegations"
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

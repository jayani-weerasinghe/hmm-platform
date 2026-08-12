'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createChampionAction } from '@/actions/champions'

interface Club { id: string; name: string }

export function NewChampionForm({ clubs }: { clubs: Club[] }) {
  const [state, formAction, isPending] = useActionState(createChampionAction, null)

  return (
    <>
      <div className="mb-6">
        <Link href="/super-admin/champions" className="text-sm text-blue-600 hover:text-blue-800">
          ← Back to Champions
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-gray-900">Create Champion</h1>
        <p className="mt-1 text-sm text-gray-500">
          An invitation email will be sent to the champion to set their password.
        </p>
      </div>

      <div className="mx-auto max-w-xl rounded-xl bg-white p-8 ring-1 ring-gray-200">
        {state?.error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {state.error}
          </div>
        )}
        <form action={formAction} className="space-y-5">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              autoComplete="off"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="off"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="club_id" className="block text-sm font-medium text-gray-700">
              Club <span className="text-red-500">*</span>
            </label>
            {clubs.length === 0 ? (
              <p className="mt-1 text-sm text-red-600">
                No active clubs available. <Link href="/super-admin/clubs/new" className="underline">Create a club first.</Link>
              </p>
            ) : (
              <select
                id="club_id"
                name="club_id"
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a club…</option>
                {clubs.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending || clubs.length === 0}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isPending ? 'Creating…' : 'Create Champion'}
            </button>
            <Link
              href="/super-admin/champions"
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  )
}

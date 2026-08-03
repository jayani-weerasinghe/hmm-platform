'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { updateClubAction } from '@/actions/clubs'

interface Club {
  id: string
  club_code: string | null
  name: string
  location: string
  description: string | null
}

export function ClubEditForm({ club }: { club: Club }) {
  const [state, formAction, isPending] = useActionState(updateClubAction, null)

  return (
    <>
      <div className="mb-6">
        <Link href={`/super-admin/clubs/${club.id}`} className="text-sm text-blue-600 hover:text-blue-800">
          ← Back to Club
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-gray-900">Edit Club</h1>
      </div>

      <div className="mx-auto max-w-xl rounded-xl bg-white p-8 ring-1 ring-gray-200">
        {state?.error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {state.error}
          </div>
        )}
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="club_id" value={club.id} />

          <div>
            <label className="block text-sm font-medium text-gray-500">Club Code</label>
            <p className="mt-1 font-mono text-sm text-gray-400">{club.club_code ?? '—'}</p>
            <p className="text-xs text-gray-400">Club code cannot be changed after creation.</p>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Club Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={club.name}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              id="location"
              name="location"
              type="text"
              required
              defaultValue={club.location}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={club.description ?? ''}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isPending ? 'Saving…' : 'Save Changes'}
            </button>
            <Link
              href={`/super-admin/clubs/${club.id}`}
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

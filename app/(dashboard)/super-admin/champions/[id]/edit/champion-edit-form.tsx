'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { updateChampionAction } from '@/actions/champions'

interface Champion {
  id: string
  full_name: string
  email: string
  phone: string | null
  club_id: string | null
  version: number
}
interface Club { id: string; name: string }

export function ChampionEditForm({ champion, clubs }: { champion: Champion; clubs: Club[] }) {
  const [state, formAction, isPending] = useActionState(updateChampionAction, null)

  return (
    <>
      <div className="mb-6">
        <Link href={`/super-admin/champions/${champion.id}`} className="text-sm text-blue-600 hover:text-blue-800">
          ← Back to Champion
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-gray-900">Edit Champion</h1>
      </div>

      <div className="mx-auto max-w-xl rounded-xl bg-white p-8 ring-1 ring-gray-200">
        {state?.conflict && (
          <div className="mb-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800" role="alert">
            This record was updated by another user while you were editing. Please{' '}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="underline"
            >
              reload the latest version
            </button>{' '}
            and reapply your changes.
          </div>
        )}
        {state?.error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <input type="hidden" name="champion_id" value={champion.id} />
          <input type="hidden" name="version" value={champion.version} />

          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              defaultValue={champion.full_name}
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
              defaultValue={champion.email}
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
              defaultValue={champion.phone ?? ''}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="club_id" className="block text-sm font-medium text-gray-700">
              Club <span className="text-red-500">*</span>
            </label>
            <select
              id="club_id"
              name="club_id"
              required
              defaultValue={champion.club_id ?? ''}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a club…</option>
              {clubs.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">
              Changing the club immediately updates this champion&apos;s access and data visibility.
            </p>
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
              href={`/super-admin/champions/${champion.id}`}
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

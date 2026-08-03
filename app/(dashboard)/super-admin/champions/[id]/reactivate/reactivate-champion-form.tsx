'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { reactivateChampionAction } from '@/actions/champions'

interface Champion { id: string; full_name: string; email: string; club_id: string | null }
interface Club { id: string; name: string; is_active?: boolean }

export function ReactivateChampionForm({
  champion,
  currentClub,
  activeClubs,
}: {
  champion: Champion
  currentClub: Club | null
  activeClubs: Club[]
}) {
  const [state, formAction, isPending] = useActionState(reactivateChampionAction, null)
  const clubIsInactive = currentClub && !currentClub.is_active

  return (
    <>
      <div className="mb-6">
        <Link href={`/super-admin/champions/${champion.id}`} className="text-sm text-blue-600 hover:text-blue-800">
          ← Back to Champion
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-gray-900">Reactivate Champion</h1>
        <p className="mt-1 text-sm text-gray-500">{champion.full_name} · {champion.email}</p>
      </div>

      <div className="mx-auto max-w-xl rounded-xl bg-white p-8 ring-1 ring-gray-200">
        {clubIsInactive && (
          <div className="mb-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
            <strong>{currentClub.name}</strong> is currently inactive. Assign an active club below before reactivating.
          </div>
        )}
        {state?.error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <input type="hidden" name="champion_id" value={champion.id} />

          <div>
            <label htmlFor="club_id" className="block text-sm font-medium text-gray-700">
              Club assignment <span className="text-red-500">*</span>
            </label>
            <select
              id="club_id"
              name="club_id"
              required
              defaultValue={!clubIsInactive ? (champion.club_id ?? '') : ''}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a club…</option>
              {activeClubs.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">
              Confirm or change the club before restoring access.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:bg-green-400"
            >
              {isPending ? 'Reactivating…' : 'Reactivate Champion'}
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

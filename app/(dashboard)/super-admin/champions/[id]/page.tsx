import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChampionStatusControls } from './champion-status-controls'

export default async function ChampionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: champion } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, is_active, deactivation_reason, club_id, created_at, clubs(id, name, is_active)')
    .eq('id', id)
    .eq('role', 'champion')
    .single()

  if (!champion) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const club = champion.clubs as any

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link href="/super-admin/champions" className="text-sm text-blue-600 hover:text-blue-800">
            ← Back to Champions
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-gray-900">{champion.full_name}</h1>
          <p className="mt-1 text-sm text-gray-400">{champion.email}</p>
        </div>
        <div className="flex gap-2">
          {champion.is_active && (
            <Link
              href={`/super-admin/champions/${id}/edit`}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Edit
            </Link>
          )}
          <ChampionStatusControls
            championId={id}
            isActive={champion.is_active}
            clubIsActive={club?.is_active ?? false}
          />
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 ring-1 ring-gray-200">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div>
            <dt className="font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                champion.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {champion.is_active ? 'Active' : 'Inactive'}
              </span>
              {!champion.is_active && champion.deactivation_reason && (
                <span className="ml-2 text-xs text-gray-400">
                  ({champion.deactivation_reason === 'club_deactivated' ? 'Club deactivated' : 'Manually deactivated'})
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Phone</dt>
            <dd className="mt-1 text-gray-900">{champion.phone ?? '—'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Club</dt>
            <dd className="mt-1">
              {club ? (
                <Link href={`/super-admin/clubs/${club.id}`} className="text-blue-600 hover:text-blue-800">
                  {club.name}
                  {!club.is_active && <span className="ml-1 text-xs text-red-500">(inactive)</span>}
                </Link>
              ) : '—'}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(champion.created_at).toLocaleDateString('en-AU', { dateStyle: 'medium' })}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

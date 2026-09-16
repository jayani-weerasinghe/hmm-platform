import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReactivateChampionModal } from './reactivate-champion-modal'

export default async function InterceptedReactivateChampionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: champion }, { data: clubs }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, club_id, is_active, clubs!profiles_club_id_fkey(id, name, is_active)')
      .eq('id', id)
      .eq('role', 'champion')
      .single(),
    supabase
      .from('clubs')
      .select('id, name')
      .eq('is_active', true)
      .order('name'),
  ])

  if (!champion) notFound()
  if (champion.is_active) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentClub = champion.clubs as any

  return (
    <ReactivateChampionModal
      champion={{ id: champion.id, full_name: champion.full_name, email: champion.email, club_id: champion.club_id }}
      currentClub={currentClub}
      activeClubs={clubs ?? []}
    />
  )
}

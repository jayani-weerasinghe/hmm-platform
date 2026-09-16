import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReactivateGatekeeperModal } from './reactivate-gatekeeper-modal'

export default async function InterceptedReactivateGatekeeperPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: gatekeeper }, { data: clubs }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, club_id, is_active, clubs!profiles_club_id_fkey(id, name, is_active)')
      .eq('id', id)
      .eq('role', 'gatekeeper')
      .single(),
    supabase
      .from('clubs')
      .select('id, name')
      .eq('is_active', true)
      .order('name'),
  ])

  if (!gatekeeper) notFound()
  if (gatekeeper.is_active) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentClub = gatekeeper.clubs as any

  return (
    <ReactivateGatekeeperModal
      gatekeeper={{ id: gatekeeper.id, full_name: gatekeeper.full_name, email: gatekeeper.email, club_id: gatekeeper.club_id }}
      currentClub={currentClub}
      activeClubs={clubs ?? []}
    />
  )
}

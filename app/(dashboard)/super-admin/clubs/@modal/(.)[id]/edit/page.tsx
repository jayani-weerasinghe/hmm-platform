import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditClubModal } from './edit-club-modal'

export default async function InterceptedEditClubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: club } = await supabase
    .from('clubs')
    .select('id, club_code, name, location, description, contact_email, contact_phone, is_active')
    .eq('id', id)
    .single()

  if (!club) notFound()

  return <EditClubModal club={club} />
}

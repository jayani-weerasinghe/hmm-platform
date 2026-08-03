import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClubEditForm } from './club-edit-form'

export default async function EditClubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: club } = await supabase
    .from('clubs')
    .select('id, club_code, name, location, description')
    .eq('id', id)
    .single()

  if (!club) notFound()

  return (
    <div className="p-8">
      <ClubEditForm club={club} />
    </div>
  )
}

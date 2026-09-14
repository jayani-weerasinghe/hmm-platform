import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditChampionModal } from './edit-champion-modal'

export default async function InterceptedEditChampionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: champion }, { data: clubs }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, phone, title, club_id, version')
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

  return <EditChampionModal champion={champion} clubs={clubs ?? []} />
}

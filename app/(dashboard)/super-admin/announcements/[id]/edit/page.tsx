import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AnnouncementForm } from '../../announcement-form'

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: announcement }, { data: clubs }] = await Promise.all([
    supabase
      .from('announcements')
      .select('id, title, body, publish_date, expiry_date, priority, audience, status, club_id')
      .eq('id', id)
      .single(),
    supabase.from('clubs').select('id, name').eq('is_active', true).order('name'),
  ])

  if (!announcement) notFound()

  return <AnnouncementForm announcement={announcement} clubs={clubs ?? []} />
}

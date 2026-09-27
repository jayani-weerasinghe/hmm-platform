import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AnnouncementForm } from '../../announcement-form'

export const metadata = { title: 'Edit Announcement — HMM Super Admin' }

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
      .select('id, title, body, publish_date, expiry_date, priority, audience, status, club_id, is_pinned')
      .eq('id', id)
      .single(),
    supabase.from('clubs').select('id, name').eq('is_active', true).order('name'),
  ])

  if (!announcement) notFound()

  return (
    <div className="flex justify-center p-8">
      <AnnouncementForm announcement={announcement} clubs={clubs ?? []} />
    </div>
  )
}

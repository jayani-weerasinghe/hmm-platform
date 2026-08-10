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

  const { data: announcement } = await supabase
    .from('announcements')
    .select('id, title, body, publish_date, expiry_date')
    .eq('id', id)
    .single()

  if (!announcement) notFound()

  return <AnnouncementForm announcement={announcement} />
}

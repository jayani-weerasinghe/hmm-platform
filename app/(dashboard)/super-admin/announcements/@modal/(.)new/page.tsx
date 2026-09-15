import { createClient } from '@/lib/supabase/server'
import { NewAnnouncementModal } from './new-announcement-modal'

export default async function InterceptedNewAnnouncementPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('clubs').select('id, name').eq('is_active', true).order('name')

  return <NewAnnouncementModal clubs={data ?? []} />
}

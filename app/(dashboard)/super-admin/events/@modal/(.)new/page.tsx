import { createClient } from '@/lib/supabase/server'
import { NewEventModal } from './new-event-modal'

export default async function InterceptedNewEventPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('clubs').select('id, name').eq('is_active', true).order('name')

  return <NewEventModal clubs={data ?? []} />
}

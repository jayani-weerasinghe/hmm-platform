import { createClient } from '@/lib/supabase/server'
import { NewChampionModal } from './new-champion-modal'

export default async function InterceptedNewChampionPage() {
  const supabase = await createClient()
  const { data: clubs } = await supabase
    .from('clubs')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  return <NewChampionModal clubs={clubs ?? []} />
}

import { createClient } from '@/lib/supabase/server'
import { NewChampionForm } from './new-champion-form'

export const metadata = { title: 'Create Champion — HMM Super Admin' }

export default async function NewChampionPage() {
  const supabase = await createClient()
  const { data: clubs } = await supabase
    .from('clubs')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="p-8">
      <NewChampionForm clubs={clubs ?? []} />
    </div>
  )
}

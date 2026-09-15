import { createClient } from '@/lib/supabase/server'
import { NewResourceModal } from './new-resource-modal'

export default async function InterceptedNewResourcePage() {
  const supabase = await createClient()
  const { data } = await supabase.from('resources').select('category')
  const categories = Array.from(
    new Set((data ?? []).map(r => r.category?.trim()).filter((c): c is string => !!c))
  ).sort()

  return <NewResourceModal categories={categories} />
}

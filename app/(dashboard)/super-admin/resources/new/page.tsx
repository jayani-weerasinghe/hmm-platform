import { createClient } from '@/lib/supabase/server'
import { CreateResourceForm } from '../create-resource-form'

export const metadata = { title: 'Create Resource — HMM Super Admin' }

export default async function NewResourcePage() {
  const supabase = await createClient()
  const { data } = await supabase.from('resources').select('category')
  const categories = Array.from(
    new Set((data ?? []).map(r => r.category?.trim()).filter((c): c is string => !!c))
  ).sort()

  return (
    <div className="flex justify-center p-8">
      <CreateResourceForm categories={categories} />
    </div>
  )
}

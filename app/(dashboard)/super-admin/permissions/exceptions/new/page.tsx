import { createClient } from '@/lib/supabase/server'
import { NewExceptionForm } from './new-exception-form'

export default async function NewExceptionPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .in('role', ['champion', 'gatekeeper'])
    .eq('is_active', true)
    .order('full_name')

  return <NewExceptionForm users={users ?? []} />
}

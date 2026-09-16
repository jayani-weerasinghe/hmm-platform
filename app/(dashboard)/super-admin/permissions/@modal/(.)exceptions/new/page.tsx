import { createClient } from '@/lib/supabase/server'
import { NewExceptionModal } from './new-exception-modal'

export default async function InterceptedNewExceptionPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .in('role', ['champion', 'gatekeeper'])
    .eq('is_active', true)
    .order('full_name')

  return <NewExceptionModal users={users ?? []} />
}

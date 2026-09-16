import { createClient } from '@/lib/supabase/server'
import { NewDelegationModal } from './new-delegation-modal'

export default async function InterceptedFromProfileNewDelegationPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .in('role', ['champion', 'gatekeeper'])
    .eq('is_active', true)
    .order('full_name')

  return <NewDelegationModal users={users ?? []} />
}

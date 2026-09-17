import 'server-only'
import bcrypt from 'bcryptjs'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const HISTORY_LIMIT = 5
const SALT_ROUNDS = 10

export async function isPasswordReused(userId: string, newPassword: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('password_history')
    .select('password_hash')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(HISTORY_LIMIT)

  if (!data?.length) return false

  for (const { password_hash } of data) {
    if (await bcrypt.compare(newPassword, password_hash)) return true
  }
  return false
}

export async function recordPasswordHash(userId: string, password: string): Promise<void> {
  const supabase = await createClient()
  const hash = await bcrypt.hash(password, SALT_ROUNDS)

  await supabase.from('password_history').insert({ user_id: userId, password_hash: hash })

  // Prune to keep only last HISTORY_LIMIT entries
  const { data: all } = await supabase
    .from('password_history')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (all && all.length > HISTORY_LIMIT) {
    const stale = all.slice(HISTORY_LIMIT).map(r => r.id)
    await supabase.from('password_history').delete().in('id', stale)
  }
}

// Account-creation time only: there's no user session yet to run the
// regular per-request client under, so this uses the admin client directly.
// Seeding the generated temp password here means the reuse check already
// correctly rejects a user "changing" their password to the exact same
// temp value they were emailed — no separate history-pruning logic needed
// since this is always the first-ever row for a brand-new user.
export async function seedPasswordHistoryAdmin(userId: string, password: string): Promise<void> {
  const admin = createAdminClient()
  const hash = await bcrypt.hash(password, SALT_ROUNDS)
  await admin.from('password_history').insert({ user_id: userId, password_hash: hash })
}

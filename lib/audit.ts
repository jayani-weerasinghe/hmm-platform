import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

export async function writeAuditLog({
  actorId,
  action,
  entityType,
  entityId,
  details,
}: {
  actorId?: string
  action: string
  entityType: string
  entityId?: string
  details?: Record<string, unknown>
}) {
  const admin = createAdminClient()
  await admin.from('audit_logs').insert({
    actor_id: actorId ?? null,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    details: details ?? null,
  })
}

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/audit'
import { endDelegationsForDeactivatedUser } from '@/actions/permissions'

async function getActorId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id
}

export type ClubActionState = { error?: string; success?: boolean } | null

export async function createClubAction(
  _prev: ClubActionState,
  formData: FormData
): Promise<ClubActionState> {
  const clubCode   = (formData.get('club_code')   as string | null)?.trim()
  const name       = (formData.get('name')         as string | null)?.trim()
  const location   = (formData.get('location')     as string | null)?.trim()
  const description = (formData.get('description') as string | null)?.trim() || null
  const contactEmail = (formData.get('contact_email') as string | null)?.trim() || null
  const contactPhone = (formData.get('contact_phone') as string | null)?.trim() || null

  if (!clubCode) return { error: 'Club code is required.' }
  if (!name)     return { error: 'Club name is required.' }
  if (!location) return { error: 'Location is required.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check for duplicate club_code
  const { data: existing } = await supabase
    .from('clubs')
    .select('id')
    .eq('club_code', clubCode)
    .maybeSingle()

  if (existing) return { error: `Club code "${clubCode}" is already taken. Please choose a unique code.` }

  const { data: club, error } = await supabase
    .from('clubs')
    .insert({
      club_code: clubCode, name, location, description,
      contact_email: contactEmail, contact_phone: contactPhone,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'A club with that name already exists.' }
    return { error: error.message }
  }

  await writeAuditLog({
    actorId: user.id,
    action: 'club.created',
    entityType: 'club',
    entityId: club.id,
    details: { club_code: clubCode, name },
  })

  return { success: true }
}

export async function updateClubAction(
  _prev: ClubActionState,
  formData: FormData
): Promise<ClubActionState> {
  const clubId     = formData.get('club_id')    as string
  const name       = (formData.get('name')      as string | null)?.trim()
  const location   = (formData.get('location')  as string | null)?.trim()
  const description = (formData.get('description') as string | null)?.trim() || null
  const contactEmail = (formData.get('contact_email') as string | null)?.trim() || null
  const contactPhone = (formData.get('contact_phone') as string | null)?.trim() || null

  if (!name)     return { error: 'Club name is required.' }
  if (!location) return { error: 'Location is required.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('clubs')
    .update({ name, location, description, contact_email: contactEmail, contact_phone: contactPhone })
    .eq('id', clubId)

  if (error) {
    if (error.code === '23505') return { error: 'A club with that name already exists.' }
    return { error: error.message }
  }

  await writeAuditLog({
    actorId: user.id,
    action: 'club.updated',
    entityType: 'club',
    entityId: clubId,
    details: { name, location },
  })

  revalidatePath(`/super-admin/clubs/${clubId}`)
  revalidatePath('/super-admin/clubs')
  return { success: true }
}

export async function deactivateClubAction(formData: FormData) {
  const clubId = formData.get('club_id') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Collect active members for audit log before deactivating
  const { data: affected } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('club_id', clubId)
    .eq('is_active', true)

  await supabase
    .from('clubs')
    .update({ is_active: false })
    .eq('id', clubId)

  if (affected && affected.length > 0) {
    await supabase
      .from('profiles')
      .update({
        is_active: false,
        deactivation_reason: 'club_deactivated',
        deactivated_club_id: clubId,
      })
      .eq('club_id', clubId)
      .eq('is_active', true)
  }

  await writeAuditLog({
    actorId: user.id,
    action: 'club.deactivated',
    entityType: 'club',
    entityId: clubId,
    details: {
      affectedUsers: affected?.map(p => ({ id: p.id, role: p.role, name: p.full_name })) ?? [],
    },
  })

  for (const member of affected ?? []) {
    await endDelegationsForDeactivatedUser(member.id, user.id)
  }

  revalidatePath(`/super-admin/clubs/${clubId}`)
  revalidatePath('/super-admin/clubs')
}

export async function reactivateClubAction(formData: FormData) {
  const clubId = formData.get('club_id') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('clubs')
    .update({ is_active: true })
    .eq('id', clubId)

  // Restore only cascade-deactivated members of this specific club
  const { data: restored } = await supabase
    .from('profiles')
    .update({
      is_active: true,
      deactivation_reason: null,
      deactivated_club_id: null,
    })
    .eq('deactivated_club_id', clubId)
    .eq('deactivation_reason', 'club_deactivated')
    .select('id, full_name, role')

  await writeAuditLog({
    actorId: user.id,
    action: 'club.reactivated',
    entityType: 'club',
    entityId: clubId,
    details: {
      restoredUsers: restored?.map(p => ({ id: p.id, role: p.role, name: p.full_name })) ?? [],
    },
  })

  revalidatePath(`/super-admin/clubs/${clubId}`)
  revalidatePath('/super-admin/clubs')
}

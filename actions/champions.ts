'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeAuditLog } from '@/lib/audit'
import { endDelegationsForDeactivatedUser } from '@/actions/permissions'
import { describeInviteError } from '@/lib/invite-errors'

export type ChampionActionState = {
  error?: string
  conflict?: boolean
  success?: boolean
  soleChampion?: boolean
} | null

export async function createChampionAction(
  _prev: ChampionActionState,
  formData: FormData
): Promise<ChampionActionState> {
  const fullName = (formData.get('full_name') as string | null)?.trim()
  const email    = (formData.get('email')     as string | null)?.trim().toLowerCase()
  const phone    = (formData.get('phone')     as string | null)?.trim() || null
  const title    = (formData.get('title')     as string | null)?.trim() || null
  const clubId   = formData.get('club_id')    as string | null

  if (!fullName) return { error: 'Full name is required.' }
  if (!email)    return { error: 'Email is required.' }
  if (!clubId)   return { error: 'Club assignment is required.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check for duplicate email in profiles
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existing) return { error: 'An account with this email already exists.' }

  const admin = createAdminClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  // Invite creates the auth user and sends a welcome email with a set-password link
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  })

  if (inviteError) {
    if (inviteError.message.toLowerCase().includes('already registered')) {
      return { error: 'An account with this email already exists.' }
    }
    return { error: describeInviteError(inviteError) }
  }

  const newUserId = invited.user.id

  const { error: profileError } = await admin.from('profiles').insert({
    id: newUserId,
    full_name: fullName,
    email,
    phone,
    title,
    role: 'champion',
    club_id: clubId,
    is_active: true,
  })

  if (profileError) {
    // Roll back auth user if profile insert fails
    await admin.auth.admin.deleteUser(newUserId)
    return { error: profileError.message }
  }

  await writeAuditLog({
    actorId: user.id,
    action: 'champion.created',
    entityType: 'champion',
    entityId: newUserId,
    details: { full_name: fullName, email, club_id: clubId },
  })

  revalidatePath('/super-admin/champions')
  return { success: true }
}

export async function updateChampionAction(
  _prev: ChampionActionState,
  formData: FormData
): Promise<ChampionActionState> {
  const championId   = formData.get('champion_id') as string
  const knownVersion = parseInt(formData.get('version') as string, 10)
  const fullName     = (formData.get('full_name')  as string | null)?.trim()
  const email        = (formData.get('email')      as string | null)?.trim().toLowerCase()
  const phone        = (formData.get('phone')      as string | null)?.trim() || null
  const title        = (formData.get('title')      as string | null)?.trim() || null
  const clubId       = formData.get('club_id')     as string | null

  if (!fullName) return { error: 'Full name is required.' }
  if (!email)    return { error: 'Email is required.' }
  if (!clubId)   return { error: 'Club assignment is required.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // OCC: fetch current profile to check version and detect changes
  const { data: current } = await supabase
    .from('profiles')
    .select('version, email, club_id')
    .eq('id', championId)
    .single()

  if (!current) return { error: 'Champion not found.' }
  if (current.version !== knownVersion) return { conflict: true }

  const { data: updated, error: updateError } = await supabase
    .from('profiles')
    .update({ full_name: fullName, email, phone, title, club_id: clubId })
    .eq('id', championId)
    .eq('version', knownVersion)
    .select('id')

  if (updateError) {
    if (updateError.code === '23505') return { error: 'That email is already used by another account.' }
    return { error: updateError.message }
  }
  if (!updated || updated.length === 0) return { conflict: true }

  const admin = createAdminClient()

  // Sync email in auth.users if it changed
  if (email !== current.email) {
    await admin.auth.admin.updateUserById(championId, { email })
  }

  await writeAuditLog({
    actorId: user.id,
    action: 'champion.updated',
    entityType: 'champion',
    entityId: championId,
    details: {
      full_name: fullName,
      email,
      club_id: clubId,
      club_changed: clubId !== current.club_id,
    },
  })

  revalidatePath(`/super-admin/champions/${championId}`)
  revalidatePath('/super-admin/champions')
  return { success: true }
}

export async function deactivateChampionAction(
  _prev: ChampionActionState,
  formData: FormData
): Promise<ChampionActionState> {
  const championId = formData.get('champion_id') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch champion's club to check sole-champion scenario
  const { data: champion } = await supabase
    .from('profiles')
    .select('club_id')
    .eq('id', championId)
    .single()

  await supabase
    .from('profiles')
    .update({ is_active: false, deactivation_reason: 'manual' })
    .eq('id', championId)

  await writeAuditLog({
    actorId: user.id,
    action: 'champion.deactivated',
    entityType: 'champion',
    entityId: championId,
    details: { deactivation_reason: 'manual' },
  })

  await endDelegationsForDeactivatedUser(championId, user.id)

  // Check if this was the sole active champion in the club
  let soleChampion = false
  if (champion?.club_id) {
    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('club_id', champion.club_id)
      .eq('role', 'champion')
      .eq('is_active', true)

    soleChampion = count === 0
  }

  revalidatePath(`/super-admin/champions/${championId}`)
  revalidatePath('/super-admin/champions')

  return { success: true, soleChampion }
}

export async function reactivateChampionAction(
  _prev: ChampionActionState,
  formData: FormData
): Promise<ChampionActionState> {
  const championId     = formData.get('champion_id') as string
  const confirmedClubId = formData.get('club_id')    as string | null

  if (!confirmedClubId) return { error: 'Club assignment is required.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify the target club is active
  const { data: club } = await supabase
    .from('clubs')
    .select('is_active, name')
    .eq('id', confirmedClubId)
    .single()

  if (!club) return { error: 'Club not found.' }
  if (!club.is_active) {
    return { error: `Club "${club.name}" is currently inactive. Reactivate the club first or assign an active club.` }
  }

  await supabase
    .from('profiles')
    .update({
      is_active: true,
      deactivation_reason: null,
      deactivated_club_id: null,
      club_id: confirmedClubId,
    })
    .eq('id', championId)

  await writeAuditLog({
    actorId: user.id,
    action: 'champion.reactivated',
    entityType: 'champion',
    entityId: championId,
    details: { confirmed_club_id: confirmedClubId, club_name: club.name },
  })

  revalidatePath(`/super-admin/champions/${championId}`)
  revalidatePath('/super-admin/champions')
  return { success: true }
}

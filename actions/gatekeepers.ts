'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeAuditLog } from '@/lib/audit'
import { createInvitedUser } from '@/lib/create-invited-user'

export type GatekeeperActionState = {
  error?: string
  conflict?: boolean
  success?: boolean
} | null

export type BulkGatekeeperRow = { row: number; email: string; error?: string; success?: boolean }
export type BulkGatekeeperState = {
  error?: string
  success?: boolean
  results?: BulkGatekeeperRow[]
  createdCount?: number
} | null

function threeYearsFrom(dateStr: string): string {
  const d = new Date(dateStr)
  d.setUTCFullYear(d.getUTCFullYear() + 3)
  return d.toISOString().slice(0, 10)
}

async function inviteAndCreateGatekeeper(params: {
  fullName: string
  email: string
  phone: string | null
  preferredLanguage: string
  clubId: string
  certificationDate: string
  actorId: string
}) {
  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('profiles')
    .select('id')
    .eq('email', params.email)
    .maybeSingle()
  if (existing) return { error: 'An account with this email already exists.' }

  const { data: gkCode, error: codeError } = await admin.rpc('next_gatekeeper_code')
  if (codeError) return { error: codeError.message }

  // Creates the auth user with a system-generated temporary password and
  // emails it directly (Supabase's own invite email can't embed a
  // password) — see lib/create-invited-user.ts.
  const invited = await createInvitedUser({ email: params.email, fullName: params.fullName, roleLabel: 'Gatekeeper' })
  if ('error' in invited) return { error: invited.error }

  const newUserId = invited.userId
  const qprExpiryDate = threeYearsFrom(params.certificationDate)

  const { error: profileError } = await admin.from('profiles').insert({
    id: newUserId,
    full_name: params.fullName,
    email: params.email,
    phone: params.phone,
    role: 'gatekeeper',
    club_id: params.clubId,
    preferred_language: params.preferredLanguage,
    qpr_certification_date: params.certificationDate,
    qpr_expiry_date: qprExpiryDate,
    gatekeeper_code: gkCode,
    is_active: true,
    must_change_password: true,
  })

  if (profileError) {
    await admin.auth.admin.deleteUser(newUserId)
    return { error: profileError.message }
  }

  await writeAuditLog({
    actorId: params.actorId,
    action: 'gatekeeper.created',
    entityType: 'gatekeeper',
    entityId: newUserId,
    details: { full_name: params.fullName, email: params.email, club_id: params.clubId, gatekeeper_code: gkCode },
  })

  return { id: newUserId, gatekeeper_code: gkCode }
}

// inviteAndCreateGatekeeper uses the service-role admin client, which
// bypasses RLS entirely — so club scoping for a Champion caller has to be
// enforced here, not left to the database. A Champion's submitted club_id
// (if any) is always ignored in favor of their own club; only a Super Admin
// may target an arbitrary club. Shared by both the Super Admin and Champion
// create-gatekeeper UIs rather than forked into a second action.
async function resolveScopedClubId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  requestedClubId: string | null
): Promise<{ clubId: string } | { error: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: caller } = await supabase
    .from('profiles')
    .select('role, club_id')
    .eq('id', user.id)
    .single()

  if (caller?.role === 'champion') {
    if (!caller.club_id) return { error: 'Your account has no assigned club.' }
    return { clubId: caller.club_id }
  }
  if (caller?.role === 'super_admin') {
    if (!requestedClubId) return { error: 'Assigned club is required.' }
    return { clubId: requestedClubId }
  }
  return { error: 'Not authorized.' }
}

export async function createGatekeeperAction(
  _prev: GatekeeperActionState,
  formData: FormData
): Promise<GatekeeperActionState> {
  const fullName = (formData.get('full_name') as string | null)?.trim()
  const email    = (formData.get('email') as string | null)?.trim().toLowerCase()
  const phone    = (formData.get('phone') as string | null)?.trim() || null
  const preferredLanguage = (formData.get('preferred_language') as string | null) || 'en'
  const requestedClubId = formData.get('club_id') as string | null
  const certificationDate = formData.get('certification_date') as string | null

  if (!fullName) return { error: 'Full name is required.' }
  if (!email)    return { error: 'Email is required.' }
  if (!certificationDate) return { error: 'Certification date is required.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const scoped = await resolveScopedClubId(supabase, requestedClubId)
  if ('error' in scoped) return { error: scoped.error }

  const result = await inviteAndCreateGatekeeper({
    fullName, email, phone, preferredLanguage, clubId: scoped.clubId, certificationDate, actorId: user.id,
  })
  if ('error' in result) return { error: result.error }

  revalidatePath('/super-admin/gatekeepers')
  revalidatePath('/champion/gatekeepers')
  return { success: true }
}

// CSV header: full_name,email,phone,club_id,certification_date
// phone is optional (leave blank); club_id must be a real active club UUID.
function parseCsv(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => line.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')))
}

export async function createGatekeepersBulkAction(
  _prev: BulkGatekeeperState,
  formData: FormData
): Promise<BulkGatekeeperState> {
  const file = formData.get('csv_file') as File | null
  if (!file || file.size === 0) return { error: 'Select a CSV file to upload.' }

  const text = await file.text()
  const rows = parseCsv(text)
  if (rows.length === 0) return { error: 'The CSV file is empty.' }

  const header = rows[0].map(h => h.toLowerCase())
  const dataRows = rows.slice(1)
  if (dataRows.length === 0) return { error: 'The CSV file has no data rows.' }
  if (dataRows.length > 50) return { error: `The CSV has ${dataRows.length} rows — maximum is 50 per upload.` }

  const col = (name: string) => header.indexOf(name)
  const nameIdx = col('full_name')
  const emailIdx = col('email')
  const phoneIdx = col('phone')
  const clubIdx = col('club_id')
  const certIdx = col('certification_date')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: caller } = await supabase
    .from('profiles')
    .select('role, club_id')
    .eq('id', user.id)
    .single()

  if (caller?.role !== 'champion' && caller?.role !== 'super_admin') {
    return { error: 'Not authorized.' }
  }
  // A Champion's rows are always scoped to their own club regardless of any
  // club_id column in the CSV — same rule as the single-gatekeeper form. A
  // Super Admin's CSV still requires a real club_id column, same as before.
  const forcedClubId = caller.role === 'champion' ? caller.club_id : null
  if (caller.role === 'champion' && !forcedClubId) return { error: 'Your account has no assigned club.' }

  if (nameIdx === -1 || emailIdx === -1 || certIdx === -1 || (caller.role === 'super_admin' && clubIdx === -1)) {
    const clubHint = caller.role === 'super_admin' ? 'full_name, email, club_id, certification_date' : 'full_name, email, certification_date'
    return { error: `CSV header must include: ${clubHint} (phone${caller.role === 'super_admin' ? '' : ' and club_id'} is optional).` }
  }

  const results: BulkGatekeeperRow[] = []
  let createdCount = 0

  for (let i = 0; i < dataRows.length; i++) {
    const cells = dataRows[i]
    const rowNum = i + 2 // 1-indexed + header row
    const fullName = cells[nameIdx]?.trim()
    const email = cells[emailIdx]?.trim().toLowerCase()
    const phone = phoneIdx !== -1 ? (cells[phoneIdx]?.trim() || null) : null
    const clubId = forcedClubId ?? (clubIdx !== -1 ? cells[clubIdx]?.trim() : undefined)
    const certificationDate = cells[certIdx]?.trim()

    if (!fullName || !email || !clubId || !certificationDate) {
      results.push({ row: rowNum, email: email || '(missing)', error: 'Missing required field(s).' })
      continue
    }

    const result = await inviteAndCreateGatekeeper({
      fullName, email, phone, preferredLanguage: 'en', clubId, certificationDate, actorId: user.id,
    })
    if ('error' in result) {
      results.push({ row: rowNum, email, error: result.error })
    } else {
      results.push({ row: rowNum, email, success: true })
      createdCount++
    }
  }

  if (createdCount > 0) {
    revalidatePath('/super-admin/gatekeepers')
    revalidatePath('/champion/gatekeepers')
  }

  return { success: createdCount === dataRows.length, results, createdCount }
}

export async function updateGatekeeperAction(
  _prev: GatekeeperActionState,
  formData: FormData
): Promise<GatekeeperActionState> {
  const gatekeeperId = formData.get('gatekeeper_id') as string
  const knownVersion  = parseInt(formData.get('version') as string, 10)
  const fullName = (formData.get('full_name') as string | null)?.trim()
  const email    = (formData.get('email') as string | null)?.trim().toLowerCase()
  const phone    = (formData.get('phone') as string | null)?.trim() || null
  const preferredLanguage = (formData.get('preferred_language') as string | null) || 'en'
  const clubId   = formData.get('club_id') as string | null
  const certificationDate = formData.get('certification_date') as string | null

  if (!fullName) return { error: 'Full name is required.' }
  if (!email)    return { error: 'Email is required.' }
  if (!clubId)   return { error: 'Assigned club is required.' }
  if (!certificationDate) return { error: 'Certification date is required.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: current } = await supabase
    .from('profiles')
    .select('version, email, club_id')
    .eq('id', gatekeeperId)
    .single()

  if (!current) return { error: 'Gatekeeper not found.' }
  if (current.version !== knownVersion) return { conflict: true }

  const qprExpiryDate = threeYearsFrom(certificationDate)

  const { data: updated, error: updateError } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      email,
      phone,
      preferred_language: preferredLanguage,
      club_id: clubId,
      qpr_certification_date: certificationDate,
      qpr_expiry_date: qprExpiryDate,
    })
    .eq('id', gatekeeperId)
    .eq('version', knownVersion)
    .select('id')

  if (updateError) {
    if (updateError.code === '23505') return { error: 'That email is already used by another account.' }
    return { error: updateError.message }
  }
  if (!updated || updated.length === 0) return { conflict: true }

  const admin = createAdminClient()
  if (email !== current.email) {
    await admin.auth.admin.updateUserById(gatekeeperId, { email })
  }

  await writeAuditLog({
    actorId: user.id,
    action: 'gatekeeper.updated',
    entityType: 'gatekeeper',
    entityId: gatekeeperId,
    details: { full_name: fullName, email, club_id: clubId, club_changed: clubId !== current.club_id },
  })

  revalidatePath(`/super-admin/gatekeepers/${gatekeeperId}`)
  revalidatePath('/super-admin/gatekeepers')
  return { success: true }
}

export async function deactivateGatekeeperAction(
  _prev: GatekeeperActionState,
  formData: FormData
): Promise<GatekeeperActionState> {
  const gatekeeperId = formData.get('gatekeeper_id') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('profiles')
    .update({ is_active: false, deactivation_reason: 'manual' })
    .eq('id', gatekeeperId)

  await writeAuditLog({
    actorId: user.id,
    action: 'gatekeeper.deactivated',
    entityType: 'gatekeeper',
    entityId: gatekeeperId,
    details: { deactivation_reason: 'manual' },
  })

  revalidatePath(`/super-admin/gatekeepers/${gatekeeperId}`)
  revalidatePath('/super-admin/gatekeepers')
  return { success: true }
}

export async function reactivateGatekeeperAction(
  _prev: GatekeeperActionState,
  formData: FormData
): Promise<GatekeeperActionState> {
  const gatekeeperId    = formData.get('gatekeeper_id') as string
  const confirmedClubId = formData.get('club_id') as string | null

  if (!confirmedClubId) return { error: 'Club assignment is required.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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
    .eq('id', gatekeeperId)

  await writeAuditLog({
    actorId: user.id,
    action: 'gatekeeper.reactivated',
    entityType: 'gatekeeper',
    entityId: gatekeeperId,
    details: { confirmed_club_id: confirmedClubId, club_name: club.name },
  })

  revalidatePath(`/super-admin/gatekeepers/${gatekeeperId}`)
  revalidatePath('/super-admin/gatekeepers')
  return { success: true }
}

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/audit'

export type AnnouncementActionState = { error?: string; success?: boolean } | null

function readFields(formData: FormData) {
  const title      = (formData.get('title') as string | null)?.trim()
  const body       = (formData.get('body') as string | null)?.trim()
  const publishDate = formData.get('publish_date') as string | null
  const expiryDate  = (formData.get('expiry_date') as string | null) || null
  const priority    = (formData.get('priority') as string | null) || 'standard'
  const audience    = (formData.get('audience') as string | null) || 'all'
  const clubId      = (formData.get('club_id') as string | null) || null
  const intent      = (formData.get('intent') as string | null) || 'publish'

  return { title, body, publishDate, expiryDate, priority, audience, clubId, intent }
}

function validate(fields: ReturnType<typeof readFields>): string | null {
  const { title, body, publishDate, expiryDate, audience, clubId } = fields
  if (!title) return 'Title is required.'
  if (!body) return 'Content is required.'
  if (!publishDate) return 'Publication date is required.'
  if (expiryDate && expiryDate < publishDate) return 'Expiry date must be on or after the publication date.'
  if (audience === 'specific_clubs' && !clubId) return 'Select a club for Specific Cohort visibility.'
  return null
}

// The Champion insert/update RLS policies require club_id = their own club
// on every row, unlike Super Admin who can post platform-wide (club_id NULL)
// or to any specific club. A Champion's announcements are therefore always
// genuinely single-club — audience is forced to 'specific_clubs' (an honest
// description, not a fabricated one) and club_id to their own, regardless of
// what the Champion-only create/edit form submits (it exposes no
// audience/club picker at all, matching the literal requirement scope).
async function resolveAnnouncementScope(
  supabase: Awaited<ReturnType<typeof createClient>>,
  fields: { audience: string; clubId: string | null }
): Promise<{ audience: string; clubId: string | null } | { error: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: caller } = await supabase
    .from('profiles')
    .select('role, club_id')
    .eq('id', user.id)
    .single()

  if (caller?.role === 'champion') {
    if (!caller.club_id) return { error: 'Your account has no assigned club.' }
    return { audience: 'specific_clubs', clubId: caller.club_id }
  }

  return { audience: fields.audience, clubId: fields.audience === 'specific_clubs' ? fields.clubId : null }
}

export async function createAnnouncementAction(
  _prev: AnnouncementActionState,
  formData: FormData
): Promise<AnnouncementActionState> {
  const fields = readFields(formData)
  const validationError = validate(fields)
  if (validationError) return { error: validationError }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const scope = await resolveAnnouncementScope(supabase, { audience: fields.audience, clubId: fields.clubId })
  if ('error' in scope) return { error: scope.error }

  const { data: announcement, error } = await supabase
    .from('announcements')
    .insert({
      title: fields.title,
      body: fields.body,
      publish_date: fields.publishDate,
      expiry_date: fields.expiryDate,
      priority: fields.priority,
      audience: scope.audience,
      club_id: scope.clubId,
      status: fields.intent === 'draft' ? 'draft' : 'published',
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  await writeAuditLog({
    actorId: user.id,
    action: 'announcement.created',
    entityType: 'announcement',
    entityId: announcement.id,
    details: { title: fields.title, publish_date: fields.publishDate, priority: fields.priority, audience: scope.audience, status: fields.intent === 'draft' ? 'draft' : 'published' },
  })

  revalidatePath('/super-admin/announcements')
  revalidatePath('/champion/announcements')
  return { success: true }
}

export async function updateAnnouncementAction(
  _prev: AnnouncementActionState,
  formData: FormData
): Promise<AnnouncementActionState> {
  const announcementId = formData.get('announcement_id') as string
  const fields = readFields(formData)
  const validationError = validate(fields)
  if (validationError) return { error: validationError }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const scope = await resolveAnnouncementScope(supabase, { audience: fields.audience, clubId: fields.clubId })
  if ('error' in scope) return { error: scope.error }

  const { error } = await supabase
    .from('announcements')
    .update({
      title: fields.title,
      body: fields.body,
      publish_date: fields.publishDate,
      expiry_date: fields.expiryDate,
      priority: fields.priority,
      audience: scope.audience,
      club_id: scope.clubId,
      status: fields.intent === 'draft' ? 'draft' : 'published',
    })
    .eq('id', announcementId)

  if (error) return { error: error.message }

  await writeAuditLog({
    actorId: user.id,
    action: 'announcement.updated',
    entityType: 'announcement',
    entityId: announcementId,
    details: { title: fields.title, publish_date: fields.publishDate, priority: fields.priority, audience: scope.audience },
  })

  revalidatePath('/super-admin/announcements')
  revalidatePath('/champion/announcements')
  return { success: true }
}

export async function deleteAnnouncementAction(formData: FormData) {
  const announcementId = formData.get('announcement_id') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('announcements').delete().eq('id', announcementId)
  if (error) return

  await writeAuditLog({
    actorId: user.id,
    action: 'announcement.deleted',
    entityType: 'announcement',
    entityId: announcementId,
  })

  revalidatePath('/super-admin/announcements')
  revalidatePath('/champion/announcements')
}

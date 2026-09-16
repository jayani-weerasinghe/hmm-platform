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

  const { data: announcement, error } = await supabase
    .from('announcements')
    .insert({
      title: fields.title,
      body: fields.body,
      publish_date: fields.publishDate,
      expiry_date: fields.expiryDate,
      priority: fields.priority,
      audience: fields.audience,
      club_id: fields.audience === 'specific_clubs' ? fields.clubId : null,
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
    details: { title: fields.title, publish_date: fields.publishDate, priority: fields.priority, audience: fields.audience, status: fields.intent === 'draft' ? 'draft' : 'published' },
  })

  revalidatePath('/super-admin/announcements')
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

  const { error } = await supabase
    .from('announcements')
    .update({
      title: fields.title,
      body: fields.body,
      publish_date: fields.publishDate,
      expiry_date: fields.expiryDate,
      priority: fields.priority,
      audience: fields.audience,
      club_id: fields.audience === 'specific_clubs' ? fields.clubId : null,
      status: fields.intent === 'draft' ? 'draft' : 'published',
    })
    .eq('id', announcementId)

  if (error) return { error: error.message }

  await writeAuditLog({
    actorId: user.id,
    action: 'announcement.updated',
    entityType: 'announcement',
    entityId: announcementId,
    details: { title: fields.title, publish_date: fields.publishDate, priority: fields.priority, audience: fields.audience },
  })

  revalidatePath('/super-admin/announcements')
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
}

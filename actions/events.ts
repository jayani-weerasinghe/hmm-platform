'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/audit'

export type EventActionState = { error?: string; success?: boolean } | null

function readFields(formData: FormData) {
  const title        = (formData.get('title') as string | null)?.trim()
  const type         = formData.get('type') as string | null
  const eventDate    = formData.get('event_date') as string | null
  const startTime    = formData.get('start_time') as string | null
  const endTime      = (formData.get('end_time') as string | null) || null
  const clubId       = formData.get('club_id') as string | null
  const facilitator  = (formData.get('facilitator') as string | null)?.trim() || null
  const venue        = (formData.get('venue') as string | null)?.trim()
  const virtualLink  = (formData.get('virtual_link') as string | null)?.trim() || null
  const description  = (formData.get('description') as string | null)?.trim() || null
  const maxParticipants = (formData.get('max_participants') as string | null) || null

  return { title, type, eventDate, startTime, endTime, clubId, facilitator, venue, virtualLink, description, maxParticipants }
}

function validate(fields: ReturnType<typeof readFields>): string | null {
  const { title, type, eventDate, startTime, endTime, clubId, facilitator, venue } = fields
  if (!title) return 'Event title is required.'
  if (!type) return 'Event type is required.'
  if (!eventDate) return 'Event date is required.'
  if (!startTime) return 'Start time is required.'
  if (endTime && endTime <= startTime) return 'End time must be after the start time.'
  if (!clubId) return 'Assigned club is required.'
  if (!facilitator) return 'Primary facilitator is required.'
  if (!venue) return 'Venue / location is required.'
  return null
}

export async function createEventAction(
  _prev: EventActionState,
  formData: FormData
): Promise<EventActionState> {
  const fields = readFields(formData)
  const validationError = validate(fields)
  if (validationError) return { error: validationError }

  const startsAt = new Date(`${fields.eventDate}T${fields.startTime}:00Z`).toISOString()
  const endsAt = fields.endTime ? new Date(`${fields.eventDate}T${fields.endTime}:00Z`).toISOString() : null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      title: fields.title,
      type: fields.type,
      starts_at: startsAt,
      ends_at: endsAt,
      venue: fields.venue,
      description: fields.description,
      max_participants: fields.maxParticipants ? parseInt(fields.maxParticipants, 10) : null,
      club_id: fields.clubId,
      facilitator: fields.facilitator,
      virtual_link: fields.virtualLink,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  await writeAuditLog({
    actorId: user.id,
    action: 'event.created',
    entityType: 'event',
    entityId: event.id,
    details: { title: fields.title, type: fields.type, starts_at: startsAt, club_id: fields.clubId },
  })

  revalidatePath('/super-admin/events')
  return { success: true }
}

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import mediaInfoFactory from 'mediainfo.js'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeAuditLog } from '@/lib/audit'
import { isAllowedCategory, isResourceCategory } from '@/lib/resource-categories'

const BUCKET = 'resources'
const RESOURCE_TYPES = ['video', 'article', 'document', 'other'] as const
type ResourceType = (typeof RESOURCE_TYPES)[number]

// Matches this Supabase project's actual configured Storage file size limit
// (confirmed via the Management API's /config/storage endpoint) — a hard
// platform ceiling, not something raisable from application code alone.
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024

export type ResourceActionState = { error?: string; success?: boolean } | null

function isExternalUrl(value: string) {
  return /^https?:\/\//i.test(value)
}

// Real duration for an uploaded video file, read from the already-in-memory
// upload buffer (no second round-trip to Storage). Never throws — extraction
// failure (corrupt file, unsupported codec, WASM init issue) just means
// duration_seconds stays null and estimated_completion remains the fallback
// for display; it must never block the upload itself.
async function extractVideoDuration(buffer: Buffer): Promise<number | null> {
  try {
    const mediainfo = await mediaInfoFactory({ format: 'object' })
    const getSize = () => buffer.length
    const readChunk = (size: number, offset: number) =>
      new Uint8Array(buffer.buffer, buffer.byteOffset + offset, Math.min(size, buffer.length - offset))
    const result = await mediainfo.analyzeData(getSize, readChunk)
    mediainfo.close()

    const generalTrack = result.media?.track.find((track) => track['@type'] === 'General')
    const duration = generalTrack?.Duration // seconds, per mediainfo.js's own docs for format:'object'
    if (typeof duration !== 'number' || !Number.isFinite(duration) || duration <= 0) return null
    return Math.round(duration)
  } catch (err) {
    console.warn('[resources] video duration extraction failed:', err instanceof Error ? err.message : err)
    return null
  }
}

async function uploadResourceFile(file: File, type: string): Promise<{ path: string; durationSeconds: number | null }> {
  const admin = createAdminClient()
  const ext = file.name.includes('.') ? file.name.split('.').pop() : ''
  const path = `${crypto.randomUUID()}${ext ? `.${ext}` : ''}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await admin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type || undefined })

  if (error) throw new Error(`File upload failed: ${error.message}`)

  // Only for uploaded video files — external URLs (any type) never go
  // through this function at all, so there's no separate branch needed to
  // exclude them.
  const durationSeconds = type === 'video' ? await extractVideoDuration(buffer) : null

  return { path, durationSeconds }
}

async function deleteResourceFile(path: string) {
  const admin = createAdminClient()
  await admin.storage.from(BUCKET).remove([path])
}

function readCommonFields(formData: FormData) {
  const title           = (formData.get('title') as string | null)?.trim()
  const description     = (formData.get('description') as string | null)?.trim() || null
  const type            = formData.get('type') as string | null
  const category         = (formData.get('category') as string | null)?.trim() || null
  const publicationDate = formData.get('publication_date') as string | null
  const contentUrl      = (formData.get('content_url') as string | null)?.trim() || null
  const contentText     = (formData.get('content_text') as string | null)?.trim() || null
  const file            = formData.get('file') as File | null

  return { title, description, type, category, publicationDate, contentUrl, contentText, file }
}

function validate({
  title, type, publicationDate, contentUrl, contentText, file,
}: ReturnType<typeof readCommonFields>): string | null {
  if (!title) return 'Title is required.'
  if (!type || !RESOURCE_TYPES.includes(type as ResourceType)) return 'A valid resource type is required.'
  if (!publicationDate) return 'Publication date is required.'

  const hasFile = !!(file && file.size > 0)

  if (hasFile && file!.size > MAX_FILE_SIZE_BYTES) {
    return `File is too large (${(file!.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is 50MB.`
  }

  if (type === 'article') {
    if (!contentText && !contentUrl) return 'Provide article content or an external link.'
  } else {
    if (!hasFile && !contentUrl) return 'Upload a file or provide an external URL.'
  }

  return null
}

export async function createResourceAction(
  _prev: ResourceActionState,
  formData: FormData
): Promise<ResourceActionState> {
  const fields = readCommonFields(formData)
  // The Create New Resource modal (Figma node 54:17908) has no publication-date
  // field — default to today, same as the real moment of creation/publication.
  // The older full-page create form still sends an explicit date, which wins.
  if (!fields.publicationDate) fields.publicationDate = new Date().toISOString().slice(0, 10)

  const validationError = validate(fields)
  if (validationError) return { error: validationError }
  if (!isResourceCategory(fields.category)) return { error: 'Choose a category from the list.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let contentUrl = fields.contentUrl
  let durationSeconds: number | null = null
  const hasFile = !!(fields.file && fields.file.size > 0)

  if (hasFile) {
    try {
      const uploaded = await uploadResourceFile(fields.file as File, fields.type as string)
      contentUrl = uploaded.path
      durationSeconds = uploaded.durationSeconds
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'File upload failed.' }
    }
  }

  // "intent" is set by whichever footer button submitted the form (Save as
  // Draft vs. Publish Resource) — absent on the older full-page form, which
  // always publishes immediately, matching its pre-existing behavior.
  const intent = formData.get('intent') as string | null
  const status = intent === 'draft' ? 'draft' : 'published'
  const visibleToChampions  = formData.get('visible_to_champions')  ? true : false
  const visibleToGatekeepers = formData.get('visible_to_gatekeepers') ? true : false
  const estimatedCompletion = (formData.get('estimated_completion') as string | null)?.trim() || null
  // The audience checkboxes only exist in the new modal — when absent (the
  // older full-page form), default both to true so behavior for that path is
  // unchanged from before these columns existed.
  const hasAudienceFields = formData.has('visible_to_champions') || formData.has('visible_to_gatekeepers') || formData.has('intent')

  const { data: resource, error } = await supabase
    .from('resources')
    .insert({
      title: fields.title,
      description: fields.description,
      type: fields.type,
      category: fields.category,
      publication_date: fields.publicationDate,
      content_url: contentUrl,
      content_text: fields.type === 'article' ? fields.contentText : null,
      created_by: user.id,
      status,
      estimated_completion: estimatedCompletion,
      duration_seconds: durationSeconds,
      visible_to_champions: hasAudienceFields ? visibleToChampions : true,
      visible_to_gatekeepers: hasAudienceFields ? visibleToGatekeepers : true,
    })
    .select('id')
    .single()

  if (error) {
    if (hasFile && contentUrl) await deleteResourceFile(contentUrl)
    return { error: error.message }
  }

  await writeAuditLog({
    actorId: user.id,
    action: 'resource.created',
    entityType: 'resource',
    entityId: resource.id,
    details: { title: fields.title, type: fields.type, status },
  })

  revalidatePath('/super-admin/resources')

  // No redirect() here: this action is invoked from inside the Create New
  // Resource modal (an intercepted route). redirect() from within a server
  // action called from an intercepted route can leave the @modal slot stuck
  // open even though the URL changes underneath it — same bug and fix as
  // the Champions create/edit modals. The form closes itself client-side on
  // success instead (see create-resource-form.tsx).
  return { success: true }
}

export async function updateResourceAction(
  _prev: ResourceActionState,
  formData: FormData
): Promise<ResourceActionState> {
  const resourceId = formData.get('resource_id') as string
  const previousContentUrl = (formData.get('previous_content_url') as string | null) || null
  const fields = readCommonFields(formData)
  const hasFile = !!(fields.file && fields.file.size > 0)

  // The External URL field is intentionally left blank in the edit form when the
  // resource's existing content is a stored file (it only pre-fills for http(s) URLs).
  // So "no new file, no URL typed" means "leave the existing file alone", not "remove it".
  // Only for a stored file, though: when the existing content is an external link,
  // the field was pre-filled, so an empty field means the user deliberately cleared
  // it — that must fail validation below, not silently restore the old link while
  // reporting success.
  if (
    fields.type !== 'article' && !hasFile && !fields.contentUrl &&
    previousContentUrl && !isExternalUrl(previousContentUrl)
  ) {
    fields.contentUrl = previousContentUrl
  }

  const validationError = validate(fields)
  if (validationError) return { error: validationError }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Read the stored category from the database (not from the form), so only
  // a genuinely unchanged older category is let through.
  const { data: existing } = await supabase
    .from('resources')
    .select('category')
    .eq('id', resourceId)
    .single()
  if (!isAllowedCategory(fields.category, existing?.category ?? null)) {
    return { error: 'Choose a category from the list.' }
  }

  let contentUrl = fields.contentUrl
  // Only set when a NEW file is uploaded this request — omitted from the
  // update payload entirely otherwise, so an existing real duration (or an
  // existing null, if extraction failed originally) is left untouched
  // rather than being overwritten just because some other field changed.
  let durationSeconds: number | null | undefined

  if (hasFile) {
    try {
      const uploaded = await uploadResourceFile(fields.file as File, fields.type as string)
      contentUrl = uploaded.path
      durationSeconds = uploaded.durationSeconds
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'File upload failed.' }
    }
  }

  const { error } = await supabase
    .from('resources')
    .update({
      title: fields.title,
      description: fields.description,
      type: fields.type,
      category: fields.category,
      publication_date: fields.publicationDate,
      content_url: contentUrl,
      content_text: fields.type === 'article' ? fields.contentText : null,
      ...(hasFile ? { duration_seconds: durationSeconds } : {}),
    })
    .eq('id', resourceId)

  if (error) {
    if (hasFile && contentUrl) await deleteResourceFile(contentUrl)
    return { error: error.message }
  }

  // Replaced a stored file with a new file, a new URL, or removed it — remove the old
  // file from storage whenever the resource no longer points at it.
  if (previousContentUrl && !isExternalUrl(previousContentUrl) && contentUrl !== previousContentUrl) {
    await deleteResourceFile(previousContentUrl)
  }

  await writeAuditLog({
    actorId: user.id,
    action: 'resource.updated',
    entityType: 'resource',
    entityId: resourceId,
    details: { title: fields.title, type: fields.type },
  })

  revalidatePath('/super-admin/resources')
  return { success: true }
}

export async function deleteResourceAction(formData: FormData) {
  const resourceId = formData.get('resource_id') as string
  const contentUrl = (formData.get('content_url') as string | null) || null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('resources').delete().eq('id', resourceId)
  if (error) return

  if (contentUrl && !isExternalUrl(contentUrl)) {
    await deleteResourceFile(contentUrl)
  }

  await writeAuditLog({
    actorId: user.id,
    action: 'resource.deleted',
    entityType: 'resource',
    entityId: resourceId,
  })

  revalidatePath('/super-admin/resources')
}

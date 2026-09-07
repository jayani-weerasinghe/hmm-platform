'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeAuditLog } from '@/lib/audit'

const BUCKET = 'resources'
const RESOURCE_TYPES = ['video', 'article', 'document', 'other'] as const
type ResourceType = (typeof RESOURCE_TYPES)[number]

export type ResourceActionState = { error?: string } | null

function isExternalUrl(value: string) {
  return /^https?:\/\//i.test(value)
}

async function uploadResourceFile(file: File) {
  const admin = createAdminClient()
  const ext = file.name.includes('.') ? file.name.split('.').pop() : ''
  const path = `${crypto.randomUUID()}${ext ? `.${ext}` : ''}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await admin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type || undefined })

  if (error) throw new Error(`File upload failed: ${error.message}`)
  return path
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
  const validationError = validate(fields)
  if (validationError) return { error: validationError }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let contentUrl = fields.contentUrl
  const hasFile = !!(fields.file && fields.file.size > 0)

  if (hasFile) {
    try {
      contentUrl = await uploadResourceFile(fields.file as File)
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'File upload failed.' }
    }
  }

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
    details: { title: fields.title, type: fields.type },
  })

  revalidatePath('/super-admin/resources')
  redirect('/super-admin/resources')
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
  if (fields.type !== 'article' && !hasFile && !fields.contentUrl && previousContentUrl) {
    fields.contentUrl = previousContentUrl
  }

  const validationError = validate(fields)
  if (validationError) return { error: validationError }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let contentUrl = fields.contentUrl

  if (hasFile) {
    try {
      contentUrl = await uploadResourceFile(fields.file as File)
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
  redirect('/super-admin/resources')
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

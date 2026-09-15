'use server'

import { createClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/audit'

export type ProfileData = {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: string
  title: string | null
  preferred_language: string
  office_location: string | null
  created_at: string
}

export async function getProfile(): Promise<ProfileData | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, role, title, preferred_language, office_location, created_at')
    .eq('id', user.id)
    .single()

  return data ?? null
}

export async function updateProfileAction(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const full_name = (formData.get('full_name') as string | null)?.trim()
  const phone     = (formData.get('phone')     as string | null)?.trim() || null
  const title     = (formData.get('title')     as string | null)?.trim() || null
  const preferred_language = (formData.get('preferred_language') as string | null) || 'en'
  const office_location = (formData.get('office_location') as string | null)?.trim() || null

  if (!full_name) return { error: 'Full name is required.' }
  if (full_name.length > 100) return { error: 'Full name must be 100 characters or fewer.' }
  if (phone && phone.length > 30) return { error: 'Phone number must be 30 characters or fewer.' }
  if (title && title.length > 150) return { error: 'Job title must be 150 characters or fewer.' }
  if (office_location && office_location.length > 200) return { error: 'Office location must be 200 characters or fewer.' }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name, phone, title, preferred_language, office_location, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: 'Failed to save changes. Please try again.' }

  await writeAuditLog({
    actorId: user.id,
    action: 'profile.update',
    entityType: 'profile',
    entityId: user.id,
    details: { updated_fields: ['full_name', 'phone', 'title', 'preferred_language', 'office_location'] },
  })

  return { success: true }
}

import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ResourceForm } from '../../resource-form'

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: resource } = await supabase
    .from('resources')
    .select('id, title, description, type, category, publication_date, content_url, content_text')
    .eq('id', id)
    .single()

  if (!resource) notFound()

  return <ResourceForm resource={resource} />
}

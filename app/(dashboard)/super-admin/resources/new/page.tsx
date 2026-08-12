import { ResourceForm } from '../resource-form'

export const metadata = { title: 'Add Resource — HMM Super Admin' }

export default async function NewResourcePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  return <ResourceForm defaultCategory={category} />
}

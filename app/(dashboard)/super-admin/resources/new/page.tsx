import { CreateResourceForm } from '../create-resource-form'

export const metadata = { title: 'Create Resource — HMM Super Admin' }

export default function NewResourcePage() {
  return (
    <div className="flex justify-center p-8">
      <CreateResourceForm />
    </div>
  )
}

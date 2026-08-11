import { PermissionsSubNav } from './permissions-sub-nav'

export const metadata = { title: 'Permissions — HMM Super Admin' }

export default function PermissionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-8">
      <PermissionsSubNav />
      <div className="mt-6">{children}</div>
    </div>
  )
}

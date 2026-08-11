'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/super-admin/permissions',             label: 'Role Defaults',        exact: true },
  { href: '/super-admin/permissions/exceptions',  label: 'Individual Exceptions' },
  { href: '/super-admin/permissions/groups',      label: 'Groups' },
  { href: '/super-admin/permissions/delegations',  label: 'Delegations' },
]

export function PermissionsSubNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 border-b border-gray-200">
      {TABS.map(tab => {
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              active
                ? 'border-[#F5A623] text-[#1B2B4A]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}

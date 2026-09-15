'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/super-admin/permissions',             label: 'Role Defaults',        exact: true },
  { href: '/super-admin/permissions/exceptions',  label: 'Individual Exceptions' },
  { href: '/super-admin/permissions/groups',      label: 'Groups' },
  { href: '/super-admin/permissions/delegations',  label: 'Delegations' },
  { href: '/super-admin/permissions/audit',       label: 'Audit History' },
]

export function PermissionsSubNav() {
  const pathname = usePathname()

  return (
    <div className="flex flex-wrap items-center gap-1 self-start rounded-lg bg-[#F1F5F9] p-1">
      {TABS.map(tab => {
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-[5px] px-4 py-1.5 text-[12px] font-semibold tracking-[0.24px] transition-colors ${
              active ? 'bg-[#022C51] text-white shadow-sm' : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}

import Link from 'next/link'
import { PermissionsSubNav } from './permissions-sub-nav'

export const metadata = { title: 'Permissions — HMM Super Admin' }

export default function PermissionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6 p-8 font-[family-name:var(--font-inter)]">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-[24px] font-bold tracking-[-0.6px] leading-[32px] text-[#0F172A]">
            Permissions & Access Controls
          </h1>
          <p className="mt-1 max-w-[620px] text-[14px] leading-5 text-[#64748B]">
            Easily manage default capabilities for Champions and Gatekeepers, handle individual
            temporary adjustments, and maintain a secure community.
          </p>
        </div>
        <Link
          href="/super-admin/permissions/exceptions/new"
          className="flex flex-shrink-0 items-center gap-2 rounded-md bg-[#F4AC1E] px-4 py-2.5 text-[14px] font-medium text-white shadow-[0px_1px_1px_rgba(0,0,0,0.05)] transition hover:brightness-95"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/permissions/add-exception.svg" alt="" width={16.5} height={12} />
          Add Custom Exception
        </Link>
      </div>
      <PermissionsSubNav />
      {children}
    </div>
  )
}

'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createGroupAction } from '@/actions/permissions'

export default function NewGroupPage() {
  const [state, formAction, isPending] = useActionState(createGroupAction, null)

  return (
    <div className="font-[family-name:var(--font-inter)]">
      <Link href="/super-admin/permissions/groups" className="text-[13px] font-semibold text-[#1E4BB8] hover:underline">
        ← Back to Groups
      </Link>
      <h1 className="mt-3 text-[22px] font-bold tracking-[-0.22px] text-[#0F172A] font-[family-name:var(--font-jakarta)]">
        Create Group
      </h1>

      <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-white p-8 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
        {state?.error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {state.error}
          </div>
        )}
        <form action={formAction} className="flex flex-col gap-5">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-[13px] font-medium text-[#0F172A]">
              Group Name <span className="text-[#DC2626]">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 text-sm text-[#0F172A] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1E4BB8]"
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-1.5 block text-[13px] font-medium text-[#0F172A]">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1E4BB8]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-[#F4AC1E] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition-colors hover:bg-[#E09B0F] disabled:opacity-60"
            >
              {isPending ? 'Creating…' : 'Create Group'}
            </button>
            <Link
              href="/super-admin/permissions/groups"
              className="rounded-lg bg-[#F1F5F9] px-5 py-2.5 text-[13px] font-medium text-[#0F172A] transition-colors hover:bg-[#E2E8F0]"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

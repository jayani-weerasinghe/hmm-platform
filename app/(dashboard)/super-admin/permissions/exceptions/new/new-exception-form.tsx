'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { grantIndividualExceptionAction } from '@/actions/permissions'

interface UserOption {
  id: string
  full_name: string
  role: string
}

export function NewExceptionForm({ users }: { users: UserOption[] }) {
  const [state, formAction, isPending] = useActionState(grantIndividualExceptionAction, null)

  return (
    <div className="font-[family-name:var(--font-inter)]">
      <Link href="/super-admin/permissions/exceptions" className="text-[13px] font-semibold text-[#1E4BB8] hover:underline">
        ← Back to Exceptions
      </Link>
      <h1 className="mt-3 text-[22px] font-bold tracking-[-0.22px] text-[#0F172A] font-[family-name:var(--font-jakarta)]">
        Grant Individual Exception
      </h1>

      <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-white p-8 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
        {state?.error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {state.error}
          </div>
        )}
        <form action={formAction} className="flex flex-col gap-5">
          <div>
            <label htmlFor="user_id" className="mb-1.5 block text-[13px] font-medium text-[#0F172A]">
              User <span className="text-[#DC2626]">*</span>
            </label>
            <select
              id="user_id"
              name="user_id"
              required
              className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 text-sm text-[#0F172A] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1E4BB8]"
            >
              <option value="">Select a user…</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
              ))}
            </select>
            {users.length === 0 && (
              <p className="mt-1.5 text-[11px] text-[#94A3B8]">No active Champions or Gatekeepers exist yet.</p>
            )}
          </div>

          <div>
            <label htmlFor="permission" className="mb-1.5 block text-[13px] font-medium text-[#0F172A]">
              Permission Key <span className="text-[#DC2626]">*</span>
            </label>
            <input
              id="permission"
              name="permission"
              type="text"
              required
              placeholder="e.g. manage_events"
              className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 font-mono text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1E4BB8]"
            />
          </div>

          <div>
            <label htmlFor="is_enabled" className="mb-1.5 block text-[13px] font-medium text-[#0F172A]">
              Setting <span className="text-[#DC2626]">*</span>
            </label>
            <select
              id="is_enabled"
              name="is_enabled"
              required
              defaultValue="true"
              className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 text-sm text-[#0F172A] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1E4BB8]"
            >
              <option value="true">Allow</option>
              <option value="false">Deny</option>
            </select>
            <p className="mt-1.5 text-[11px] text-[#94A3B8]">
              This overrides both the user&apos;s Group and Role default settings for this permission only.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-[#F4AC1E] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition-colors hover:bg-[#E09B0F] disabled:opacity-60"
            >
              {isPending ? 'Granting…' : 'Grant Exception'}
            </button>
            <Link
              href="/super-admin/permissions/exceptions"
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

'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createDelegationAction } from '@/actions/permissions'

interface UserOption {
  id: string
  full_name: string
  role: string
}

export function NewDelegationForm({ users }: { users: UserOption[] }) {
  const [state, formAction, isPending] = useActionState(createDelegationAction, null)

  return (
    <div className="font-[family-name:var(--font-inter)]">
      <Link href="/super-admin/permissions/delegations" className="text-[13px] font-semibold text-[#1E4BB8] hover:underline">
        ← Back to Delegations
      </Link>
      <h1 className="mt-3 text-[22px] font-bold tracking-[-0.22px] text-[#0F172A] font-[family-name:var(--font-jakarta)]">
        Create Delegation
      </h1>

      <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-white p-8 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
        {state?.error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {state.error}
          </div>
        )}
        <form action={formAction} className="flex flex-col gap-5">
          <div>
            <label htmlFor="delegator_id" className="mb-1.5 block text-[13px] font-medium text-[#0F172A]">
              Delegator (going on leave) <span className="text-[#DC2626]">*</span>
            </label>
            <select
              id="delegator_id"
              name="delegator_id"
              required
              className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 text-sm text-[#0F172A] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1E4BB8]"
            >
              <option value="">Select a user…</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="delegate_id" className="mb-1.5 block text-[13px] font-medium text-[#0F172A]">
              Delegate (covering) <span className="text-[#DC2626]">*</span>
            </label>
            <select
              id="delegate_id"
              name="delegate_id"
              required
              className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 text-sm text-[#0F172A] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1E4BB8]"
            >
              <option value="">Select a user…</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
              ))}
            </select>
            <p className="mt-1.5 text-[11px] text-[#94A3B8]">
              The delegate keeps their own access and additionally gains the delegator&apos;s full
              effective permission set for the period below.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="starts_at" className="mb-1.5 block text-[13px] font-medium text-[#0F172A]">
                Start Date <span className="text-[#DC2626]">*</span>
              </label>
              <input
                id="starts_at"
                name="starts_at"
                type="date"
                required
                className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 text-sm text-[#0F172A] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1E4BB8]"
              />
            </div>
            <div>
              <label htmlFor="ends_at" className="mb-1.5 block text-[13px] font-medium text-[#0F172A]">
                End Date <span className="text-[#DC2626]">*</span>
              </label>
              <input
                id="ends_at"
                name="ends_at"
                type="date"
                required
                className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 text-sm text-[#0F172A] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1E4BB8]"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-[#F4AC1E] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition-colors hover:bg-[#E09B0F] disabled:opacity-60"
            >
              {isPending ? 'Creating…' : 'Create Delegation'}
            </button>
            <Link
              href="/super-admin/permissions/delegations"
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

'use client'

import { useActionState } from 'react'
import { updateProfileAction } from '@/actions/profile'

export function ProfileForm({
  initialFullName,
  initialPhone,
}: {
  initialFullName: string
  initialPhone: string
}) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, null)

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700" role="status">
          Profile updated successfully.
        </div>
      )}

      {/* Full name — editable */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-semibold text-[#1B2B4A]">
          Full name <span className="text-red-500">*</span>
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          maxLength={100}
          defaultValue={initialFullName}
          className="mt-2 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
        />
      </div>

      {/* Phone — editable */}
      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-[#1B2B4A]">
          Phone number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          maxLength={30}
          defaultValue={initialPhone}
          placeholder="+61 4xx xxx xxx"
          className="mt-2 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
        />
      </div>

      <div className="pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-[#F5A623] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#D97706] disabled:opacity-60"
        >
          {isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

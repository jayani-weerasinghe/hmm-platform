'use client'

import { useActionState, useEffect, useState } from 'react'
import { useSubmitWithoutReset } from '@/hooks/use-submit-without-reset'
import { useRouter } from 'next/navigation'
import { updateAnnouncementAction } from '@/actions/announcements'

interface AnnouncementValues {
  id: string
  title: string
  body: string
  publish_date: string
  expiry_date: string | null
}

// publish_date/expiry_date are TIMESTAMPTZ columns (e.g.
// "2026-09-16T00:00:00+00:00"), but a native date input's defaultValue only
// matches an exact "YYYY-MM-DD" string — without this it silently renders
// as an empty field instead of erroring, so the bug is easy to miss.
function toDateInputValue(value: string) {
  return value.slice(0, 10)
}

export function EditAnnouncementForm({
  announcement,
  fallbackPath = '/champion/announcements',
  onClose,
}: {
  announcement: AnnouncementValues
  fallbackPath?: string
  onClose?: () => void
}) {
  const router = useRouter()
  const close = onClose ?? (() => router.push(fallbackPath))
  const [state, formAction, isPending] = useActionState(updateAnnouncementAction, null)
  const submit = useSubmitWithoutReset(formAction)
  const [hasExpiry, setHasExpiry] = useState(Boolean(announcement.expiry_date))

  useEffect(() => {
    if (state?.success) close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
    <div className="mx-auto flex max-h-[90vh] w-full max-w-[672px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] font-[family-name:var(--font-inter)]">
      <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
        <h1 className="text-[18px] font-bold leading-6 tracking-[-0.22px] text-[#0F172A]">Edit Announcement</h1>
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#F1F5F9]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/x-close.svg" alt="" width={11.67} height={11.67} />
        </button>
      </div>

      <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
        <input type="hidden" name="announcement_id" value={announcement.id} />
        <input type="hidden" name="intent" value="publish" />

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-[#F8FAFC] p-6">
          {state?.error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{state.error}</div>
          )}

          <div className="flex flex-col gap-4 rounded-xl bg-white p-5">
            <div>
              <label htmlFor="title" className="mb-1.5 block text-[13px] font-medium tracking-[0.24px] text-[#0F172A]">
                Announcement Title <span className="text-[#DC2626]">*</span>
              </label>
              <input
                id="title" name="title" type="text" required autoComplete="off" defaultValue={announcement.title}
                className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 text-sm text-[#0F172A] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1E4BB8]"
              />
            </div>

            <div>
              <label htmlFor="body" className="mb-1.5 block text-[13px] font-medium tracking-[0.24px] text-[#0F172A]">
                Announcement Content <span className="text-[#DC2626]">*</span>
              </label>
              <textarea
                id="body" name="body" rows={5} required defaultValue={announcement.body}
                className="w-full resize-none rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-[13px] leading-[21px] text-[#0F172A] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1E4BB8]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="publish_date" className="mb-1.5 block text-[13px] font-medium tracking-[0.24px] text-[#0F172A]">
                  Publication Date <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  id="publish_date" name="publish_date" type="date" required defaultValue={toDateInputValue(announcement.publish_date)}
                  className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 text-sm text-[#0F172A] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1E4BB8]"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-[13px] font-medium tracking-[0.24px] text-[#0F172A]">
                  <input
                    type="checkbox" checked={hasExpiry} onChange={e => setHasExpiry(e.target.checked)}
                    className="h-[13px] w-[13px] accent-[#003495]"
                  />
                  Expiration Date
                </label>
                <input
                  id="expiry_date" name="expiry_date" type="date"
                  disabled={!hasExpiry}
                  defaultValue={announcement.expiry_date ? toDateInputValue(announcement.expiry_date) : ''}
                  className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 text-sm text-[#0F172A] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1E4BB8] disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-[#E2E8F0] px-6 py-4">
          <button type="button" onClick={close} className="flex h-10 items-center rounded-lg bg-[#F1F5F9] px-4 text-[13px] font-medium text-[#0F172A] transition-colors hover:bg-[#E2E8F0]">
            Cancel
          </button>
          <button
            type="submit" disabled={isPending}
            className="flex h-10 items-center gap-2 rounded-lg bg-[#F4AC1E] px-5 text-[13px] font-semibold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition-colors hover:bg-[#E09B0F] disabled:opacity-60"
          >
            {!isPending && <img src="/icons/check.svg" alt="" width={11.55} height={8.52} />}
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

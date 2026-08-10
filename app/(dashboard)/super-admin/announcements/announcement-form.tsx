'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createAnnouncementAction, updateAnnouncementAction, type AnnouncementActionState } from '@/actions/announcements'

interface AnnouncementValues {
  id: string
  title: string
  body: string
  publish_date: string
  expiry_date: string | null
}

function toDateInputValue(value: string) {
  return value.slice(0, 10)
}

export function AnnouncementForm({ announcement }: { announcement?: AnnouncementValues }) {
  const isEdit = !!announcement
  const action = isEdit ? updateAnnouncementAction : createAnnouncementAction
  const [state, formAction, isPending] = useActionState<AnnouncementActionState, FormData>(action, null)

  const backHref = '/super-admin/announcements'

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href={backHref} className="text-sm text-blue-600 hover:text-blue-800">
          ← Back to Announcements
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-gray-900">{isEdit ? 'Edit Announcement' : 'Create Announcement'}</h1>
      </div>

      <div className="mx-auto max-w-xl rounded-xl bg-white p-8 ring-1 ring-gray-200">
        {state?.error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {state.error}
          </div>
        )}
        <form action={formAction} className="space-y-5">
          {isEdit && <input type="hidden" name="announcement_id" value={announcement.id} />}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={announcement?.title}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700">
              Body <span className="text-red-500">*</span>
            </label>
            <textarea
              id="body"
              name="body"
              rows={5}
              required
              defaultValue={announcement?.body}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="publish_date" className="block text-sm font-medium text-gray-700">
                Publish Date <span className="text-red-500">*</span>
              </label>
              <input
                id="publish_date"
                name="publish_date"
                type="date"
                required
                defaultValue={announcement ? toDateInputValue(announcement.publish_date) : undefined}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-400">Today for immediate publish, or a future date to schedule.</p>
            </div>
            <div>
              <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700">
                Expiry Date
              </label>
              <input
                id="expiry_date"
                name="expiry_date"
                type="date"
                defaultValue={announcement?.expiry_date ? toDateInputValue(announcement.expiry_date) : undefined}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-400">Optional — leave blank to never expire.</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isPending ? (isEdit ? 'Saving…' : 'Publishing…') : (isEdit ? 'Save Changes' : 'Publish Announcement')}
            </button>
            <Link
              href={backHref}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

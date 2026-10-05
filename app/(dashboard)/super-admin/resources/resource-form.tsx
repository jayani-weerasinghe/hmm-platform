'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateResourceAction, type ResourceActionState } from '@/actions/resources'
import { RESOURCE_CATEGORIES, isResourceCategory } from '@/lib/resource-categories'

interface ResourceValues {
  id: string
  title: string
  description: string | null
  type: string
  category: string | null
  publication_date: string
  content_url: string | null
  content_text: string | null
}

const inputClass = 'mt-1.5 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-[13.5px] text-[#0F172A] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1E4BB8]'
const labelClass = 'block text-[13px] font-medium text-[#0F172A]'

// Edit-only — Create goes through CreateResourceForm (matches the real
// Figma "Create New Resource" modal). No Figma edit-modal design exists, so
// this keeps its own simpler field layout — only the surrounding chrome
// (header/close/footer) matches the app's shared modal-card convention.
export function EditResourceForm({ resource, onClose }: { resource: ResourceValues; onClose?: () => void }) {
  const router = useRouter()
  const close = onClose ?? (() => router.push('/super-admin/resources'))
  const [state, formAction, isPending] = useActionState<ResourceActionState, FormData>(updateResourceAction, null)
  const [type, setType] = useState(resource.type)

  useEffect(() => {
    if (state?.success) close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
    <div className="mx-auto flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] font-[family-name:var(--font-inter)]">
      <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
        <h1 className="text-[18px] font-bold leading-[24px] text-[#0F172A]">Edit Resource</h1>
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

      <form action={formAction} className="flex flex-1 flex-col overflow-hidden">
        <input type="hidden" name="resource_id" value={resource.id} />
        <input type="hidden" name="previous_content_url" value={resource.content_url ?? ''} />

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto bg-[#F8FAFC] p-6">
          {state?.error && (
            <div className="rounded-lg bg-red-50 p-3 text-[13px] text-red-700" role="alert">
              {state.error}
            </div>
          )}

          <div>
            <label htmlFor="title" className={labelClass}>
              Title <span className="text-[#DC2626]">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={resource.title}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={resource.description ?? ''}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className={labelClass}>
                Type <span className="text-[#DC2626]">*</span>
              </label>
              <select
                id="type"
                name="type"
                required
                value={type}
                onChange={e => setType(e.target.value)}
                className={inputClass}
              >
                <option value="video">Video</option>
                <option value="article">Article</option>
                <option value="document">Document</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="category" className={labelClass}>
                Category <span className="text-[#DC2626]">*</span>
              </label>
              <select
                id="category"
                name="category"
                required
                defaultValue={resource.category ?? ''}
                className={inputClass}
              >
                <option value="" disabled>Select a category</option>
                {RESOURCE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                {/* A category from before the fixed list existed can be kept as
                    is (the server allows it only while unchanged). */}
                {resource.category && !isResourceCategory(resource.category) && (
                  <option value={resource.category}>{resource.category} (older category)</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="publication_date" className={labelClass}>
              Publication Date <span className="text-[#DC2626]">*</span>
            </label>
            <input
              id="publication_date"
              name="publication_date"
              type="date"
              required
              defaultValue={resource.publication_date}
              className={inputClass}
            />
          </div>

          {type === 'article' ? (
            <>
              <div>
                <label htmlFor="content_text" className={labelClass}>
                  Article Content
                </label>
                <textarea
                  id="content_text"
                  name="content_text"
                  rows={6}
                  defaultValue={resource.content_text ?? ''}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="content_url" className={labelClass}>
                  External Link
                </label>
                <input
                  id="content_url"
                  name="content_url"
                  type="url"
                  placeholder="https://…"
                  defaultValue={resource.content_url && /^https?:\/\//i.test(resource.content_url) ? resource.content_url : ''}
                  className={inputClass}
                />
                <p className="mt-1.5 text-[12px] text-[#64748B]">
                  Provide article content, an external link, or both.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="file" className={labelClass}>
                  Upload File
                </label>
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept={type === 'video' ? 'video/*' : undefined}
                  className={inputClass}
                />
                <p className="mt-1.5 text-[12px] text-[#64748B]">Max 50MB.</p>
                {resource.content_url && !/^https?:\/\//i.test(resource.content_url) && (
                  <p className="mt-1.5 text-[12px] text-[#64748B]">
                    A file is already attached. Uploading a new one replaces it.
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="content_url" className={labelClass}>
                  External URL
                </label>
                <input
                  id="content_url"
                  name="content_url"
                  type="url"
                  placeholder="https://…"
                  defaultValue={resource.content_url && /^https?:\/\//i.test(resource.content_url) ? resource.content_url : ''}
                  className={inputClass}
                />
                <p className="mt-1.5 text-[12px] text-[#64748B]">
                  Upload a file or link to an external URL (e.g. YouTube).
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-[#E2E8F0] px-6 py-4">
          <button
            type="button"
            onClick={close}
            className="flex h-10 items-center rounded-lg bg-[#F1F5F9] px-4 text-[13px] font-medium text-[#0F172A] transition-colors hover:bg-[#E2E8F0]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex h-10 items-center rounded-lg bg-[#F4AC1E] px-5 text-[13px] font-semibold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition-colors hover:bg-[#E09B0F] disabled:opacity-60"
          >
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

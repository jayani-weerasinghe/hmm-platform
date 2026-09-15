'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { updateResourceAction, type ResourceActionState } from '@/actions/resources'

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

// Edit-only — Create now goes through CreateResourceForm (matches the real
// Figma "Create New Resource" modal). No Figma edit-modal design exists, so
// this keeps its original full-page layout/copy untouched.
export function EditResourceForm({ resource }: { resource: ResourceValues }) {
  const [state, formAction, isPending] = useActionState<ResourceActionState, FormData>(updateResourceAction, null)
  const [type, setType] = useState(resource.type)

  const backHref = '/super-admin/resources'

  return (
    <div className="p-8 font-[family-name:var(--font-inter)]">
      <div className="mb-6">
        <Link href={backHref} className="text-[13px] font-semibold text-[#003495]">
          ← Back to Resources
        </Link>
        <h1 className="mt-3 text-[24px] font-bold tracking-[-0.4px] text-[#0F172A]">
          Edit Resource
        </h1>
      </div>

      <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
        {state?.error && (
          <div className="mb-5 rounded-lg bg-red-50 p-3 text-[13px] text-red-700" role="alert">
            {state.error}
          </div>
        )}
        <form action={formAction} className="space-y-5" encType="multipart/form-data">
          <input type="hidden" name="resource_id" value={resource.id} />
          <input type="hidden" name="previous_content_url" value={resource.content_url ?? ''} />

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
                Category
              </label>
              <input
                id="category"
                name="category"
                type="text"
                defaultValue={resource.category ?? ''}
                className={inputClass}
              />
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

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-[#F4AC1E] px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition-colors hover:bg-[#E09B0F] disabled:opacity-60"
            >
              {isPending ? 'Saving…' : 'Save Changes'}
            </button>
            <Link
              href={backHref}
              className="flex items-center rounded-lg border border-[#E2E8F0] px-5 py-2.5 text-[13.5px] font-semibold text-[#475569] hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

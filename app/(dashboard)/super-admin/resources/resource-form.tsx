'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { createResourceAction, updateResourceAction, type ResourceActionState } from '@/actions/resources'
import { archivo, manrope } from './fonts'
import { colors } from './design-tokens'

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

const inputStyle: React.CSSProperties = {
  border: `1px solid ${colors.border}`,
  color: colors.navy,
}

const labelClass = `${manrope.className} block text-[13px] font-semibold`

export function ResourceForm({ resource, defaultCategory }: { resource?: ResourceValues; defaultCategory?: string }) {
  const isEdit = !!resource
  const action = isEdit ? updateResourceAction : createResourceAction
  const [state, formAction, isPending] = useActionState<ResourceActionState, FormData>(action, null)
  const [type, setType] = useState(resource?.type ?? 'video')

  const backHref = '/super-admin/resources'

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href={backHref} className={`${manrope.className} text-[13px] font-bold`} style={{ color: colors.link }}>
          ← Back to Resources
        </Link>
        <h1 className={`${archivo.className} mt-3 text-[24px] font-extrabold`} style={{ color: colors.navy, letterSpacing: '-0.4px' }}>
          {isEdit ? 'Edit Resource' : 'Add Resource'}
        </h1>
      </div>

      <div className="mx-auto max-w-xl rounded-[18px] bg-white p-8" style={{ border: `1px solid ${colors.border}` }}>
        {state?.error && (
          <div className={`${manrope.className} mb-5 rounded-xl p-3 text-[13px]`} style={{ backgroundColor: '#FBEAE8', color: colors.danger }} role="alert">
            {state.error}
          </div>
        )}
        <form action={formAction} className="space-y-5" encType="multipart/form-data">
          {isEdit && (
            <>
              <input type="hidden" name="resource_id" value={resource.id} />
              <input type="hidden" name="previous_content_url" value={resource.content_url ?? ''} />
            </>
          )}

          <div>
            <label htmlFor="title" className={labelClass} style={{ color: colors.navy }}>
              Title <span style={{ color: colors.danger }}>*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={resource?.title}
              className={`${manrope.className} mt-1.5 w-full rounded-[10px] px-3 py-2 text-[13.5px] focus:outline-none`}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="description" className={labelClass} style={{ color: colors.navy }}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={resource?.description ?? ''}
              className={`${manrope.className} mt-1.5 w-full rounded-[10px] px-3 py-2 text-[13.5px] focus:outline-none`}
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className={labelClass} style={{ color: colors.navy }}>
                Type <span style={{ color: colors.danger }}>*</span>
              </label>
              <select
                id="type"
                name="type"
                required
                value={type}
                onChange={e => setType(e.target.value)}
                className={`${manrope.className} mt-1.5 w-full rounded-[10px] px-3 py-2 text-[13.5px] focus:outline-none`}
                style={inputStyle}
              >
                <option value="video">Video</option>
                <option value="article">Article</option>
                <option value="document">Document</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="category" className={labelClass} style={{ color: colors.navy }}>
                Category
              </label>
              <input
                id="category"
                name="category"
                type="text"
                defaultValue={resource?.category ?? defaultCategory ?? ''}
                className={`${manrope.className} mt-1.5 w-full rounded-[10px] px-3 py-2 text-[13.5px] focus:outline-none`}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label htmlFor="publication_date" className={labelClass} style={{ color: colors.navy }}>
              Publication Date <span style={{ color: colors.danger }}>*</span>
            </label>
            <input
              id="publication_date"
              name="publication_date"
              type="date"
              required
              defaultValue={resource?.publication_date}
              className={`${manrope.className} mt-1.5 w-full rounded-[10px] px-3 py-2 text-[13.5px] focus:outline-none`}
              style={inputStyle}
            />
          </div>

          {type === 'article' ? (
            <>
              <div>
                <label htmlFor="content_text" className={labelClass} style={{ color: colors.navy }}>
                  Article Content
                </label>
                <textarea
                  id="content_text"
                  name="content_text"
                  rows={6}
                  defaultValue={resource?.content_text ?? ''}
                  className={`${manrope.className} mt-1.5 w-full rounded-[10px] px-3 py-2 text-[13.5px] focus:outline-none`}
                  style={inputStyle}
                />
              </div>
              <div>
                <label htmlFor="content_url" className={labelClass} style={{ color: colors.navy }}>
                  External Link
                </label>
                <input
                  id="content_url"
                  name="content_url"
                  type="url"
                  placeholder="https://…"
                  defaultValue={resource?.content_url && /^https?:\/\//i.test(resource.content_url) ? resource.content_url : ''}
                  className={`${manrope.className} mt-1.5 w-full rounded-[10px] px-3 py-2 text-[13.5px] focus:outline-none`}
                  style={inputStyle}
                />
                <p className={`${manrope.className} mt-1.5 text-[12px]`} style={{ color: colors.description }}>
                  Provide article content, an external link, or both.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="file" className={labelClass} style={{ color: colors.navy }}>
                  Upload File{type === 'document' && !resource ? <span style={{ color: colors.danger }}> *</span> : ''}
                </label>
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept={type === 'video' ? 'video/*' : undefined}
                  className={`${manrope.className} mt-1.5 w-full rounded-[10px] px-3 py-2 text-[13.5px] focus:outline-none`}
                  style={inputStyle}
                />
                {isEdit && resource?.content_url && !/^https?:\/\//i.test(resource.content_url) && (
                  <p className={`${manrope.className} mt-1.5 text-[12px]`} style={{ color: colors.description }}>
                    A file is already attached. Uploading a new one replaces it.
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="content_url" className={labelClass} style={{ color: colors.navy }}>
                  External URL
                </label>
                <input
                  id="content_url"
                  name="content_url"
                  type="url"
                  placeholder="https://…"
                  defaultValue={resource?.content_url && /^https?:\/\//i.test(resource.content_url) ? resource.content_url : ''}
                  className={`${manrope.className} mt-1.5 w-full rounded-[10px] px-3 py-2 text-[13.5px] focus:outline-none`}
                  style={inputStyle}
                />
                <p className={`${manrope.className} mt-1.5 text-[12px]`} style={{ color: colors.description }}>
                  Upload a file or link to an external URL (e.g. YouTube).
                </p>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className={`${archivo.className} rounded-[11px] text-[13.5px] font-extrabold disabled:opacity-60`}
              style={{
                backgroundColor: colors.amber,
                color: colors.navy,
                padding: '0 22px',
                height: '46px',
                boxShadow: `0 10px 22px -12px ${colors.amberShadow}`,
              }}
            >
              {isPending ? (isEdit ? 'Saving…' : 'Publishing…') : (isEdit ? 'Save Changes' : 'Publish Resource')}
            </button>
            <Link
              href={backHref}
              className={`${manrope.className} flex items-center rounded-[11px] px-5 text-[13.5px] font-bold`}
              style={{ border: `1px solid ${colors.border}`, color: colors.meta, height: '46px' }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

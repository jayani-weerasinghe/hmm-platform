'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { createResourceAction, updateResourceAction, type ResourceActionState } from '@/actions/resources'

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

export function ResourceForm({ resource }: { resource?: ResourceValues }) {
  const isEdit = !!resource
  const action = isEdit ? updateResourceAction : createResourceAction
  const [state, formAction, isPending] = useActionState<ResourceActionState, FormData>(action, null)
  const [type, setType] = useState(resource?.type ?? 'video')

  const backHref = '/super-admin/resources'

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href={backHref} className="text-sm text-blue-600 hover:text-blue-800">
          ← Back to Resources
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-gray-900">{isEdit ? 'Edit Resource' : 'Add Resource'}</h1>
      </div>

      <div className="mx-auto max-w-xl rounded-xl bg-white p-8 ring-1 ring-gray-200">
        {state?.error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
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
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={resource?.title}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={resource?.description ?? ''}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                required
                value={type}
                onChange={e => setType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="video">Video</option>
                <option value="article">Article</option>
                <option value="document">Document</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <input
                id="category"
                name="category"
                type="text"
                defaultValue={resource?.category ?? ''}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="publication_date" className="block text-sm font-medium text-gray-700">
              Publication Date <span className="text-red-500">*</span>
            </label>
            <input
              id="publication_date"
              name="publication_date"
              type="date"
              required
              defaultValue={resource?.publication_date}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {type === 'article' ? (
            <>
              <div>
                <label htmlFor="content_text" className="block text-sm font-medium text-gray-700">
                  Article Content
                </label>
                <textarea
                  id="content_text"
                  name="content_text"
                  rows={6}
                  defaultValue={resource?.content_text ?? ''}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="content_url" className="block text-sm font-medium text-gray-700">
                  External Link
                </label>
                <input
                  id="content_url"
                  name="content_url"
                  type="url"
                  placeholder="https://…"
                  defaultValue={resource?.content_url && /^https?:\/\//i.test(resource.content_url) ? resource.content_url : ''}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-400">Provide article content, an external link, or both.</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                  Upload File{type === 'document' && !resource ? <span className="text-red-500"> *</span> : ''}
                </label>
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept={type === 'video' ? 'video/*' : undefined}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {isEdit && resource?.content_url && !/^https?:\/\//i.test(resource.content_url) && (
                  <p className="mt-1 text-xs text-gray-400">A file is already attached. Uploading a new one replaces it.</p>
                )}
              </div>
              <div>
                <label htmlFor="content_url" className="block text-sm font-medium text-gray-700">
                  External URL
                </label>
                <input
                  id="content_url"
                  name="content_url"
                  type="url"
                  placeholder="https://…"
                  defaultValue={resource?.content_url && /^https?:\/\//i.test(resource.content_url) ? resource.content_url : ''}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-400">Upload a file or link to an external URL (e.g. YouTube).</p>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isPending ? (isEdit ? 'Saving…' : 'Publishing…') : (isEdit ? 'Save Changes' : 'Publish Resource')}
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

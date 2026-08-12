'use client'

import { useState, useTransition } from 'react'
import { deleteResourceAction } from '@/actions/resources'
import { colors } from './design-tokens'
import { manrope } from './fonts'

export function ResourceDeleteButton({ resourceId, contentUrl }: { resourceId: string; contentUrl: string | null }) {
  const [confirm, setConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!confirm) {
    return (
      <button type="button" onClick={() => setConfirm(true)} className={manrope.className} style={{ color: colors.danger }}>
        Delete
      </button>
    )
  }

  return (
    <form action={(fd) => startTransition(() => deleteResourceAction(fd))} className="inline-flex items-center gap-2">
      <input type="hidden" name="resource_id" value={resourceId} />
      <input type="hidden" name="content_url" value={contentUrl ?? ''} />
      <span className={`${manrope.className} text-[12px] font-semibold`} style={{ color: colors.meta }}>Sure?</span>
      <button type="submit" disabled={isPending} className={manrope.className} style={{ color: colors.danger }}>
        {isPending ? '…' : 'Yes'}
      </button>
      <button type="button" onClick={() => setConfirm(false)} className={manrope.className} style={{ color: colors.meta }}>
        No
      </button>
    </form>
  )
}

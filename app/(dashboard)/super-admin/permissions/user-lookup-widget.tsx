'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { searchAssignableUsersAction, type AssignableUserMatch } from '@/actions/permissions'

export function UserLookupWidget() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AssignableUserMatch[] | null>(null)
  const [isPending, startTransition] = useTransition()

  function onChange(value: string) {
    setQuery(value)
    if (value.trim().length < 2) {
      setResults(null)
      return
    }
    startTransition(async () => {
      setResults(await searchAssignableUsersAction(value))
    })
  }

  return (
    <div className="flex w-full flex-col gap-3 rounded-[10px] border border-[#E2E8F0] bg-white p-[21px]">
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/permissions/search-header.svg" alt="" width={17} height={16} />
        <h3 className="text-[14px] font-bold text-[#0F172A]">Check Access for a User</h3>
      </div>
      <p className="text-[12px] leading-4 text-[#64748B]">
        Quickly see what any Champion or Gatekeeper can do in their club.
      </p>
      <div className="relative w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/permissions/search-input.svg"
          alt=""
          width={13.5}
          height={13.5}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
        />
        <input
          type="text"
          value={query}
          onChange={e => onChange(e.target.value)}
          placeholder="Search by name…"
          className="w-full rounded-md border border-[#E2E8F0] bg-[#F8FAFC] py-2.5 pl-9 pr-3 text-[12px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#022C51]"
        />
      </div>

      {isPending && <p className="text-[11px] text-[#94A3B8]">Searching…</p>}

      {!isPending && results !== null && results.length === 0 && (
        <p className="text-[11px] text-[#94A3B8]">No active Champion or Gatekeeper matches &quot;{query}&quot;.</p>
      )}

      {!isPending && results && results.length > 0 && (
        <div className="flex w-full flex-col gap-2">
          {results.map(r => (
            <div key={r.id} className="w-full rounded-[6px] border border-[#CCFBF1] bg-[rgba(240,253,250,0.6)] p-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#0F172A]">{r.full_name}</span>
                <span className="rounded-[2px] bg-white px-2 py-0.5 text-[11px] font-semibold text-[#115E59]">
                  {r.role === 'champion' ? 'Champion' : 'Gatekeeper'}
                  {r.club_name ? ` (${r.club_name})` : ''}
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-[16.5px] text-[#475569]">
                {r.allowed_count} of {r.total_count} permissions currently allowed.
              </p>
              <Link
                href={`/super-admin/permissions/effective/${r.id}`}
                className="mt-1 inline-block text-[11px] font-medium text-[#0F766E] hover:underline"
              >
                View full breakdown →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

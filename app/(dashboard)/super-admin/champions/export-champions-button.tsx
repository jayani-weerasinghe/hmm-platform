'use client'

export type ExportRow = {
  full_name: string
  email: string
  phone: string | null
  title: string | null
  club_name: string
  gatekeepers: number
  is_active: boolean
}

function toCsv(rows: ExportRow[]): string {
  const header = ['Full Name', 'Email', 'Phone', 'Title', 'Assigned Club', 'Gatekeepers in Club', 'Status']
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
  const lines = [header.map(escape).join(',')]
  for (const r of rows) {
    lines.push([
      r.full_name,
      r.email,
      r.phone ?? '',
      r.title ?? '',
      r.club_name,
      String(r.gatekeepers),
      r.is_active ? 'Active' : 'Inactive',
    ].map(escape).join(','))
  }
  return lines.join('\n')
}

// Client-side CSV export of the champion rows currently displayed on the
// page — no server round-trip, no fabricated feature (real data already
// fetched), same pattern as export-clubs-button.tsx.
export function ExportChampionsButton({ rows }: { rows: ExportRow[] }) {
  const handleExport = () => {
    const csv = toCsv(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `champions-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={rows.length === 0}
      className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-[17px] py-[9px] text-[12px] font-semibold tracking-[0.24px] text-[#0F172A] shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/export.svg" alt="" width={12} height={12} />
      Export
    </button>
  )
}

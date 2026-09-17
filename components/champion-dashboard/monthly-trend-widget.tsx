import type { MonthlyCount } from '@/actions/champion-dashboard'

export function MonthlyTrendWidget({ data }: { data: MonthlyCount[] }) {
  const max = Math.max(1, ...data.map(d => d.count))

  return (
    <div className="flex h-full flex-col rounded-2xl bg-white p-5">
      <h2 className="font-[family-name:var(--font-jakarta)] text-base font-bold text-[#0F172A]">
        Monthly Onboarding Trend
      </h2>
      <p className="mt-1 text-[11px] text-[#64748B]">New Gatekeepers joining your club</p>

      <div className="mt-4 flex flex-1 items-end justify-between gap-2 px-1">
        {data.map(({ month, count }) => (
          <div key={month} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#0F172A]">{count}</span>
            <div
              className="w-full max-w-[27px] rounded-t-[4px] bg-[#022C51]"
              style={{ height: `${Math.max(4, (count / max) * 100)}px` }}
            />
            <span className="text-[10px] font-semibold text-[#0F172A]">{month}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

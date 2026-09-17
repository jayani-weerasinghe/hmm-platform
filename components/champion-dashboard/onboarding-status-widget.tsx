import type { NotLoggedInGatekeeper } from '@/actions/champion-dashboard'

// Real, not fabricated: reads Supabase Auth's own last_sign_in_at (set the
// moment any invited user first authenticates) — genuinely tracks "added but
// never logged in" even though no Gatekeeper mobile app exists yet to log
// in from. Figma's Mobile-App-Status-column equivalent on the Super Admin
// Gatekeepers screen was excluded for lacking exactly this kind of backing;
// this one has it.
export function OnboardingStatusWidget({ data }: { data: NotLoggedInGatekeeper[] }) {
  return (
    <div className="flex h-full flex-col rounded-2xl bg-white p-5">
      <h2 className="font-[family-name:var(--font-jakarta)] text-base font-bold text-[#0F172A]">
        Onboarding Status
      </h2>
      <p className="mt-1 text-[11px] text-[#64748B]">Added to the system but not yet logged in</p>

      {data.length === 0 ? (
        <div className="mt-4 flex flex-1 items-center justify-center rounded-xl bg-[#F9F9F9] p-4">
          <p className="text-center text-[12px] text-[#64748B]">
            Every active Gatekeeper in your club has logged in at least once.
          </p>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2 overflow-y-auto">
          {data.slice(0, 5).map(g => (
            <div key={g.id} className="flex items-center justify-between rounded-lg bg-[#F9F9F9] px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-[#0F172A]">{g.full_name}</p>
                <p className="truncate text-[11px] text-[#64748B]">{g.email}</p>
              </div>
              <span className="flex-shrink-0 rounded-full bg-[rgba(255,251,235,0.8)] px-2 py-0.5 text-[10px] font-bold text-[#92400E]">
                Not logged in
              </span>
            </div>
          ))}
          {data.length > 5 && (
            <p className="mt-1 text-center text-[11px] text-[#64748B]">+{data.length - 5} more</p>
          )}
        </div>
      )}
    </div>
  )
}

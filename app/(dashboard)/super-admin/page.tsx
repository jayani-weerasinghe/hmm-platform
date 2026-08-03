import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getDashboardData } from '@/actions/dashboard'
import { ClubOnboardingCard } from '@/components/dashboard/club-onboarding-card'
import { EventsWidget } from '@/components/dashboard/events-widget'

export const metadata = { title: 'Dashboard — HMM Super Admin' }

// ── KPI tile ──────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  subColor = 'text-gray-400',
  href,
}: {
  label: string
  value: string | number
  sub: string
  subColor?: string
  href?: string
}) {
  const body = (
    <>
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="text-5xl font-bold tabular-nums text-[#1B2B4A]">{value}</p>
      <p className={`mt-2 text-sm font-semibold ${subColor}`}>{sub}</p>
    </>
  )
  return href ? (
    <Link href={href} className="flex flex-col rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      {body}
    </Link>
  ) : (
    <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm">{body}</div>
  )
}

// ── QPR donut ring ────────────────────────────────────────────────────────────

function QprRing({ pct, size = 140 }: { pct: number; size?: number }) {
  const sw = 14
  const r  = (size - sw) / 2
  const cx = size / 2
  const circ = 2 * Math.PI * r
  const dash = (Math.min(pct, 100) / 100) * circ
  const fs   = size < 120 ? 18 : 22
  const fsub = size < 120 ?  9 : 11
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#EDEEF2" strokeWidth={sw} />
      <circle
        cx={cx} cy={cx} r={r} fill="none"
        stroke="#F5A623" strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ - dash}`}
        transform={`rotate(-90 ${cx} ${cx})`}
      />
      <text x={cx} y={cx - 5} textAnchor="middle" fontSize={fs} fontWeight="700" fill="#1B2B4A">
        {Math.round(pct)}%
      </text>
      <text x={cx} y={cx + fsub + 2} textAnchor="middle" fontSize={fsub} fill="#9CA3AF">valid</text>
    </svg>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function SuperAdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') redirect('/champion')

  const data = await getDashboardData()

  const qprPct = data.qprData.total > 0
    ? (data.qprData.certified / data.qprData.total) * 100
    : 0

  const totalActiveGk  = data.activeGatekeepersPerClub.reduce((s, c) => s + c.count, 0)
  const newGkThisMonth = data.onboardingProgress.reduce((s, c) => s + c.count, 0)

  return (
    <div className="space-y-5 p-8">

      {/* ── Row 1: 4 body count cards ── */}
      <div className="grid grid-cols-4 gap-5">

        {/* Active Gatekeepers */}
        <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Active Gatekeepers</p>
          <p className="text-5xl font-bold tabular-nums text-[#1B2B4A]">{totalActiveGk.toLocaleString()}</p>
          {newGkThisMonth > 0 && (
            <p className="mt-2 text-sm font-semibold text-[#F5A623]">+{newGkThisMonth} this month</p>
          )}
        </div>

        {/* Active Champions */}
        <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Active Champions</p>
          <p className="text-5xl font-bold tabular-nums text-[#1B2B4A]">{data.totalActiveChampions}</p>
          <p className="mt-2 text-sm text-gray-400">
            across {data.activeGatekeepersPerClub.length} club{data.activeGatekeepersPerClub.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* QPR Certified — plain count, no donut */}
        <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">QPR Certified</p>
          <p className="text-5xl font-bold tabular-nums text-[#1B2B4A]">{data.qprData.certified.toLocaleString()}</p>
          <p className="mt-2 text-sm font-semibold text-[#F5A623]">{Math.round(qprPct)}% currently valid</p>
        </div>

        {/* Upcoming Events — clickable */}
        <Link href="/super-admin/events" className="flex flex-col rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Upcoming Events</p>
          <p className="text-5xl font-bold tabular-nums text-[#1B2B4A]">{data.upcomingEvents.total}</p>
          <p className="mt-2 text-sm text-gray-400">next 30 days</p>
        </Link>
      </div>

      {/* ── Row 3: Club progress (left) + QPR & Events stacked (right) ── */}
      <div className="grid grid-cols-3 gap-5">

        {/* Left — Club onboarding progress (View all clubs → sortable modal) */}
        <div className="col-span-2">
          <ClubOnboardingCard
            gatekeeperStatus={data.gatekeeperStatusPerClub}
            initialOnboarding={data.onboardingProgress}
          />
        </div>

        {/* Right — QPR certification + Upcoming events stacked */}
        <div className="flex flex-col gap-5">

          {/* QPR certification card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <QprRing pct={qprPct} size={110} />
              <div className="min-w-0">
                <p className="mb-1 text-base font-bold text-[#1B2B4A]">QPR certification</p>
                <p className="text-sm leading-snug text-gray-500">
                  {data.qprData.certified.toLocaleString()} of{' '}
                  {data.qprData.total.toLocaleString()} certifications active
                </p>
                {data.qprData.expiringSoon > 0 && (
                  <p className="mt-2 text-sm font-semibold text-[#F5A623]">
                    {data.qprData.expiringSoon} expiring in 90 days
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming events card */}
          <EventsWidget initialData={data.upcomingEvents} />
        </div>
      </div>

    </div>
  )
}

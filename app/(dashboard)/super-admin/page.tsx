import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getDashboardData } from '@/actions/dashboard'
import { BarChartWidget } from '@/components/dashboard/bar-chart-widget'
import { StackedBarWidget } from '@/components/dashboard/stacked-bar-widget'
import { OnboardingWidget } from '@/components/dashboard/onboarding-widget'
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

  return (
    <div className="space-y-5 p-8">

      {/* ── Row 1: the 3 spec'd top-row KPI tiles (#2, #5, #6) ── */}
      <div className="grid grid-cols-3 gap-5">

        {/* #2 Active Champions */}
        <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Active Champions</p>
          <p className="text-5xl font-bold tabular-nums text-[#1B2B4A]">{data.totalActiveChampions}</p>
          <p className="mt-2 text-sm text-gray-400">
            across {data.activeGatekeepersPerClub.length} club{data.activeGatekeepersPerClub.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* #5 Upcoming Events — clickable, navigates to full calendar (Sc06) */}
        <Link href="/super-admin/events" className="flex flex-col rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Upcoming Events</p>
          <p className="text-5xl font-bold tabular-nums text-[#1B2B4A]">{data.upcomingEvents.total}</p>
          <p className="mt-2 text-sm text-gray-400">next 30 days</p>
        </Link>

        {/* #6 QPR Certified — "count/total (pct%)" per spec's own example format */}
        <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">QPR Certified</p>
          <p className="text-5xl font-bold tabular-nums text-[#1B2B4A]">{data.qprData.certified.toLocaleString()}</p>
          <p className="mt-2 text-sm font-semibold text-[#F5A623]">
            {data.qprData.certified.toLocaleString()}/{data.qprData.total.toLocaleString()} ({qprPct.toFixed(1)}%) certified
          </p>
        </div>
      </div>

      {/* ── Row 2: the 3 spec'd chart elements (#1, #3, #4), each its own panel ── */}
      <div className="grid grid-cols-3 gap-5">

        <div className="col-span-2 space-y-5">
          {/* #1 Active Gatekeeper Count per Club — horizontal bar, sorted desc */}
          <BarChartWidget
            title="Active Gatekeepers per Club"
            data={data.activeGatekeepersPerClub}
            color="bg-blue-500"
          />

          {/* #3 Club Onboarding Progress — own filter, live on the widget */}
          <OnboardingWidget initialData={data.onboardingProgress} />

          {/* #4 Club-wise Gatekeeper Count — stacked active/inactive + legend */}
          <StackedBarWidget data={data.gatekeeperStatusPerClub} />
        </div>

        {/* Right column — supplementary QPR donut + the Upcoming Events mini-list/filter */}
        <div className="flex flex-col gap-5">
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

          <EventsWidget initialData={data.upcomingEvents} />
        </div>
      </div>

    </div>
  )
}

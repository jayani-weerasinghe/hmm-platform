'use server'

import { createClient } from '@/lib/supabase/server'

export type BarItem = { club_id: string; club_name: string; count: number; club_location?: string | null }
export type StackedItem = { club_id: string; club_name: string; active: number; inactive: number }
export type UpcomingEvent = { id: string; title: string; club_name: string; starts_at: string; type: string }
export type EventsData = { total: number; events: UpcomingEvent[] }
export type QPRData = { certified: number; total: number; expiringSoon: number }
export type OnboardingFilter = 'this_month' | 'last_month' | 'this_quarter'
export type EventsFilter = 'next_7_days' | 'next_30_days' | 'all_upcoming'

export type DashboardData = {
  activeGatekeepersPerClub: BarItem[]
  totalActiveChampions: number
  onboardingProgress: BarItem[]
  gatekeeperStatusPerClub: StackedItem[]
  upcomingEvents: EventsData
  qprData: QPRData
}

const EMPTY: DashboardData = {
  activeGatekeepersPerClub: [],
  totalActiveChampions: 0,
  onboardingProgress: [],
  gatekeeperStatusPerClub: [],
  upcomingEvents: { total: 0, events: [] },
  qprData: { certified: 0, total: 0, expiringSoon: 0 },
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()

  const { data: clubs } = await supabase
    .from('clubs')
    .select('id, name, location')
    .eq('is_active', true)

  const activeClubs = clubs ?? []
  const clubIds = activeClubs.map(c => c.id)
  if (!clubIds.length) return EMPTY

  const nameById = Object.fromEntries(activeClubs.map(c => [c.id, c.name]))

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
  const today = now.toISOString().split('T')[0]
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [
    { data: allGk },
    { count: champCount },
    { data: newGk },
    { data: events },
    { data: certUsers },
  ] = await Promise.all([
    supabase.from('profiles').select('club_id, is_active').eq('role', 'gatekeeper').in('club_id', clubIds),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'champion').eq('is_active', true).in('club_id', clubIds),
    supabase.from('profiles').select('club_id').eq('role', 'gatekeeper').in('club_id', clubIds).gte('created_at', thisMonthStart),
    supabase.from('events').select('id, title, starts_at, club_id, type').gt('starts_at', now.toISOString()).eq('is_cancelled', false).in('club_id', clubIds).order('starts_at', { ascending: true }).lte('starts_at', in30Days),
    supabase.from('profiles').select('qpr_expiry_date').in('role', ['champion', 'gatekeeper']).eq('is_active', true).in('club_id', clubIds),
  ])

  const activeGkByClub: Record<string, number> = {}
  const inactiveGkByClub: Record<string, number> = {}
  for (const gk of allGk ?? []) {
    if (!gk.club_id) continue
    if (gk.is_active) activeGkByClub[gk.club_id] = (activeGkByClub[gk.club_id] ?? 0) + 1
    else inactiveGkByClub[gk.club_id] = (inactiveGkByClub[gk.club_id] ?? 0) + 1
  }

  const newGkByClub: Record<string, number> = {}
  for (const gk of newGk ?? []) {
    if (gk.club_id) newGkByClub[gk.club_id] = (newGkByClub[gk.club_id] ?? 0) + 1
  }

  const allCertUsers = certUsers ?? []
  const eventList = events ?? []

  return {
    activeGatekeepersPerClub: activeClubs
      .map(c => ({ club_id: c.id, club_name: c.name, club_location: c.location, count: activeGkByClub[c.id] ?? 0 }))
      .sort((a, b) => b.count - a.count),

    totalActiveChampions: champCount ?? 0,

    onboardingProgress: activeClubs
      .map(c => ({ club_id: c.id, club_name: c.name, count: newGkByClub[c.id] ?? 0 }))
      .sort((a, b) => b.count - a.count),

    gatekeeperStatusPerClub: activeClubs
      .map(c => ({
        club_id: c.id,
        club_name: c.name,
        active: activeGkByClub[c.id] ?? 0,
        inactive: inactiveGkByClub[c.id] ?? 0,
      }))
      .sort((a, b) => (b.active + b.inactive) - (a.active + a.inactive)),

    upcomingEvents: {
      total: eventList.length,
      events: eventList.slice(0, 3).map(e => ({
        id: e.id,
        title: e.title,
        club_name: nameById[e.club_id] ?? '',
        starts_at: e.starts_at,
        type: e.type,
      })),
    },

    qprData: {
      certified: allCertUsers.filter(u => u.qpr_expiry_date && u.qpr_expiry_date >= today).length,
      total: allCertUsers.length,
      expiringSoon: allCertUsers.filter(u => u.qpr_expiry_date && u.qpr_expiry_date >= today && u.qpr_expiry_date <= in90Days).length,
    },
  }
}

export async function getOnboardingProgress(filter: OnboardingFilter): Promise<BarItem[]> {
  const supabase = await createClient()
  const { data: clubs } = await supabase.from('clubs').select('id, name').eq('is_active', true)
  const activeClubs = clubs ?? []
  if (!activeClubs.length) return []

  const clubIds = activeClubs.map(c => c.id)
  const now = new Date()
  let startDate: Date
  let endDate: Date | null = null

  if (filter === 'this_month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  } else if (filter === 'last_month') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    endDate = new Date(now.getFullYear(), now.getMonth(), 1)
  } else {
    const q = Math.floor(now.getMonth() / 3)
    startDate = new Date(now.getFullYear(), q * 3, 1)
  }

  let query = supabase
    .from('profiles')
    .select('club_id')
    .eq('role', 'gatekeeper')
    .in('club_id', clubIds)
    .gte('created_at', startDate.toISOString())

  if (endDate) query = query.lt('created_at', endDate.toISOString())

  const { data: newGk } = await query
  const countByClub: Record<string, number> = {}
  for (const gk of newGk ?? []) {
    if (gk.club_id) countByClub[gk.club_id] = (countByClub[gk.club_id] ?? 0) + 1
  }

  return activeClubs
    .map(c => ({ club_id: c.id, club_name: c.name, count: countByClub[c.id] ?? 0 }))
    .sort((a, b) => b.count - a.count)
}

export async function getUpcomingEvents(filter: EventsFilter): Promise<EventsData> {
  const supabase = await createClient()
  const { data: clubs } = await supabase.from('clubs').select('id, name').eq('is_active', true)
  const activeClubs = clubs ?? []
  if (!activeClubs.length) return { total: 0, events: [] }

  const clubIds = activeClubs.map(c => c.id)
  const nameById = Object.fromEntries(activeClubs.map(c => [c.id, c.name]))
  const now = new Date()

  let query = supabase
    .from('events')
    .select('id, title, starts_at, club_id, type')
    .gt('starts_at', now.toISOString())
    .eq('is_cancelled', false)
    .in('club_id', clubIds)
    .order('starts_at', { ascending: true })

  if (filter === 'next_7_days') {
    const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    query = query.lte('starts_at', end.toISOString())
  } else if (filter === 'next_30_days') {
    const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    query = query.lte('starts_at', end.toISOString())
  }

  const { data: events } = await query
  const eventList = events ?? []

  return {
    total: eventList.length,
    events: eventList.slice(0, 3).map(e => ({
      id: e.id,
      title: e.title,
      club_name: nameById[e.club_id] ?? '',
      starts_at: e.starts_at,
      type: e.type,
    })),
  }
}

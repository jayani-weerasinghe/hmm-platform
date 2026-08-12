import { createClient } from '@/lib/supabase/server'
import { EventsCalendar } from './events-calendar'
import { monthGridRange } from './date-grid'

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; year?: string; month?: string; club?: string; type?: string; event?: string }>
}) {
  const sp = await searchParams
  const view: 'month' | 'list' = sp.view === 'list' ? 'list' : 'month'
  const now = new Date()
  const year = sp.year ? parseInt(sp.year, 10) : now.getUTCFullYear()
  const month = sp.month ? parseInt(sp.month, 10) : now.getUTCMonth() + 1 // 1-12
  const clubFilter = sp.club || ''
  const typeFilter = sp.type || ''
  const selectedEventId = sp.event || ''

  const supabase = await createClient()

  const { data: clubs } = await supabase.from('clubs').select('id, name').order('name')
  const clubNameById = Object.fromEntries((clubs ?? []).map(c => [c.id, c.name]))

  const EVENT_COLUMNS = 'id, title, type, starts_at, ends_at, venue, description, max_participants, club_id'

  let eventsQuery = supabase
    .from('events')
    .select(EVENT_COLUMNS)
    .eq('is_cancelled', false)
    .order('starts_at', { ascending: true })

  if (view === 'month') {
    const { gridStart, gridEnd } = monthGridRange(year, month)
    const gridEndExclusive = new Date(gridEnd)
    gridEndExclusive.setUTCDate(gridEndExclusive.getUTCDate() + 1)
    eventsQuery = eventsQuery.gte('starts_at', gridStart.toISOString()).lt('starts_at', gridEndExclusive.toISOString())
  }
  if (clubFilter) eventsQuery = eventsQuery.eq('club_id', clubFilter)
  if (typeFilter) eventsQuery = eventsQuery.eq('type', typeFilter)

  const { data: events } = await eventsQuery

  const eventsWithClub = (events ?? []).map(e => ({ ...e, club_name: clubNameById[e.club_id] ?? '—' }))

  let selectedEvent = null
  if (selectedEventId) {
    const { data } = await supabase
      .from('events')
      .select(EVENT_COLUMNS)
      .eq('id', selectedEventId)
      .maybeSingle()
    if (data) selectedEvent = { ...data, club_name: clubNameById[data.club_id] ?? '—' }
  }

  return (
    <EventsCalendar
      view={view}
      year={year}
      month={month}
      club={clubFilter}
      type={typeFilter}
      events={eventsWithClub}
      clubs={clubs ?? []}
      selectedEvent={selectedEvent}
    />
  )
}

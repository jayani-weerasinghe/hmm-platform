// Sunday-start month/week grid (matches the Figma calendar's SUN–SAT header
// row — the previous hand-rolled version was Monday-start), computed in UTC
// so the grid boundaries and the events queried/bucketed into it always
// agree regardless of server timezone.

export function monthGridRange(year: number, month1to12: number) {
  const firstOfMonth = new Date(Date.UTC(year, month1to12 - 1, 1))
  const lastOfMonth = new Date(Date.UTC(year, month1to12, 0))

  const gridStart = new Date(firstOfMonth)
  gridStart.setUTCDate(firstOfMonth.getUTCDate() - firstOfMonth.getUTCDay())

  const gridEnd = new Date(lastOfMonth)
  gridEnd.setUTCDate(lastOfMonth.getUTCDate() + (6 - lastOfMonth.getUTCDay()))

  return { gridStart, gridEnd, firstOfMonth, lastOfMonth }
}

// Sunday-start week containing `date`.
export function weekRange(date: Date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  start.setUTCDate(start.getUTCDate() - start.getUTCDay())
  const end = new Date(start)
  end.setUTCDate(start.getUTCDate() + 6)
  return { start, end }
}

export function gridDays(gridStart: Date, gridEnd: Date): Date[] {
  const days: Date[] = []
  const cur = new Date(gridStart)
  while (cur <= gridEnd) {
    days.push(new Date(cur))
    cur.setUTCDate(cur.getUTCDate() + 1)
  }
  return days
}

export function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

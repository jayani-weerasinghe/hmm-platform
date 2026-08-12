// Monday-start month grid, computed in UTC so the grid boundaries and the
// events queried/bucketed into it always agree regardless of server timezone.

export function monthGridRange(year: number, month1to12: number) {
  const firstOfMonth = new Date(Date.UTC(year, month1to12 - 1, 1))
  const lastOfMonth = new Date(Date.UTC(year, month1to12, 0))

  const firstWeekday = (firstOfMonth.getUTCDay() + 6) % 7 // 0 = Monday
  const gridStart = new Date(firstOfMonth)
  gridStart.setUTCDate(firstOfMonth.getUTCDate() - firstWeekday)

  const lastWeekday = (lastOfMonth.getUTCDay() + 6) % 7
  const gridEnd = new Date(lastOfMonth)
  gridEnd.setUTCDate(lastOfMonth.getUTCDate() + (6 - lastWeekday))

  return { gridStart, gridEnd, firstOfMonth, lastOfMonth }
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

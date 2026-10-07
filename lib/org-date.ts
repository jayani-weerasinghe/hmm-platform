// "Today" for HMM is Sri Lanka's date, not the server's: the live site runs
// on UTC, so between midnight and 05:30 in Sri Lanka a server-UTC "today"
// would still be yesterday. Used wherever a date is compared with "today"
// (certification dates, resource publication dates).

const ORG_TIME_ZONE = 'Asia/Colombo'

export function todayDateString(): string {
  // en-CA formats as YYYY-MM-DD, the same form a date input uses.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ORG_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

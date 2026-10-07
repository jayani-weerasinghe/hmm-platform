// What will happen to a resource's visibility when the Edit Resource form is
// saved, given its publication date — shown under the date field and updated
// as the date changes, so rescheduling is never a surprise. Mirrors the
// server rules in actions/resources.ts (resolvePublicationDate).
//
// All dates are YYYY-MM-DD strings; `today` is Sri Lanka's date
// (lib/org-date.ts), so plain string comparison orders them correctly.

export type PublicationMessage = {
  tone: 'info' | 'warning' | 'error'
  text: string
}

export const PAST_DATE_MESSAGE = "Publication date can't be in the past."

export function formatPublicationDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(y, m - 1, d)))
}

// Published and its date has already arrived (i.e. visible to users now).
export function isLive(isDraft: boolean, originalDate: string, today: string): boolean {
  return !isDraft && originalDate <= today
}

// The one change that hides content from users right away: a live resource
// moved to a future date. Saving it needs an explicit confirmation.
export function needsRescheduleConfirmation(
  isDraft: boolean, originalDate: string, newDate: string, today: string
): boolean {
  return isLive(isDraft, originalDate, today) && newDate > today
}

export function publicationMessage(
  isDraft: boolean, originalDate: string, newDate: string, today: string
): PublicationMessage | null {
  const fmt = formatPublicationDate

  if (isDraft) {
    if (!newDate || newDate === today) {
      return { tone: 'info', text: 'When you click Publish, this resource goes live today.' }
    }
    if (newDate < today) return { tone: 'error', text: PAST_DATE_MESSAGE }
    return {
      tone: 'info',
      text: `When you click Publish, this resource is scheduled: hidden until ${fmt(newDate)}, then live automatically.`,
    }
  }

  // Published resource.
  const wasLive = originalDate <= today
  if (!newDate) return null // required field — the browser asks for it
  if (newDate === originalDate) {
    return wasLive
      ? { tone: 'info', text: `Live since ${fmt(originalDate)}.` }
      : { tone: 'info', text: `Scheduled to go live on ${fmt(originalDate)}.` }
  }
  if (newDate < today) return { tone: 'error', text: PAST_DATE_MESSAGE }

  if (wasLive) {
    return newDate > today
      ? {
          tone: 'warning',
          text: `This resource is live now. Saving will hide it from Champions and Gatekeepers immediately, and it will reappear on ${fmt(newDate)}.`,
        }
      : { tone: 'info', text: 'It stays live; its publication date will change to today.' }
  }

  return newDate > today
    ? {
        tone: 'info',
        text: `Rescheduling: it will go live on ${fmt(newDate)} instead of ${fmt(originalDate)}, and stays hidden until then.`,
      }
    : {
        tone: 'info',
        text: `Publishing now: it will go live as soon as you save, instead of on ${fmt(originalDate)}.`,
      }
}

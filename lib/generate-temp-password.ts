import 'server-only'
import { randomInt } from 'crypto'

// Excludes visually-ambiguous characters (0/O, 1/l/I) since this password is
// meant to be read from an email and typed in, not just pasted. Special
// chars are limited to the exact set validatePassword() accepts
// (!@#$%^&*) — anything outside that set would make the generated
// password fail the app's own complexity check.
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const LOWER = 'abcdefghjkmnpqrstuvwxyz'
const DIGITS = '23456789'
const SPECIAL = '!@#$%^&*'
const ALL = UPPER + LOWER + DIGITS + SPECIAL

function pick(pool: string): string {
  return pool[randomInt(pool.length)]
}

function shuffle(chars: string[]): string[] {
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars
}

// Guarantees at least one char from each required class (matching
// validatePassword's rules exactly) rather than hoping a fully random draw
// happens to include one of each — with a 12-char password a random draw
// almost always would, but "almost always" isn't good enough for a value
// that's about to be emailed as someone's real (if temporary) credential.
export function generateTempPassword(length = 12): string {
  const required = [pick(UPPER), pick(LOWER), pick(DIGITS), pick(SPECIAL)]
  const rest = Array.from({ length: length - required.length }, () => pick(ALL))
  return shuffle([...required, ...rest]).join('')
}

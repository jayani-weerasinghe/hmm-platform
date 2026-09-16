// @supabase/auth-js's AuthRetryableFetchError (thrown for 5xx-class failures,
// e.g. an email provider rejecting a send) sets `.message` to the raw
// JSON-stringified response body — literally the string "{}" in this
// project's case, since that error class doesn't parse the body's
// `msg`/`error_code` fields. Surface something actually useful instead of
// relaying that unhelpful literal to the user. Shared by every action that
// calls admin.auth.admin.inviteUserByEmail (Champions, Gatekeepers).
export function describeInviteError(err: { message?: string; status?: number }): string {
  const msg = err.message?.trim()
  const isUseless = !msg || msg === '{}' || msg.startsWith('{')
  if (!isUseless) return msg
  if (err.status === 500) {
    return 'Failed to send the invite email — the email provider returned a server error. This usually means the address could not be delivered to (e.g. an unverified sender domain in test mode). Try again, or verify the email provider configuration.'
  }
  return `Failed to send invite (unexpected error${err.status ? `, status ${err.status}` : ''}).`
}

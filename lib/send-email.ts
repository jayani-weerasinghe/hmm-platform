import 'server-only'

// SendGrid Web API (not Supabase's SMTP-relayed mailer) — needed here
// specifically because Supabase's own invite/magic-link email templates
// have no way to embed arbitrary custom content like a generated
// temporary password. Every other transactional email in this app
// (password-changed notifications, the reset-password link itself) still
// goes through Supabase's existing SMTP config unchanged; this is a
// separate, narrow path used only for the account-created email below.
async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<{ error?: string }> {
  const apiKey = process.env.SENDGRID_API_KEY
  if (!apiKey) return { error: 'SENDGRID_API_KEY is not configured.' }

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      // Matches the SendGrid Single Sender already verified for this
      // project's Supabase SMTP config (see CLAUDE.md) — reusing the same
      // verified identity rather than a second, unverified sender.
      from: { email: 'jayani@ensiz.com', name: 'Healing Minds Matter' },
      subject,
      content: [
        { type: 'text/plain', value: text },
        { type: 'text/html', value: html },
      ],
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    return { error: `SendGrid returned ${res.status}: ${body.slice(0, 500)}` }
  }

  return {}
}

export async function sendTemporaryPasswordEmail(params: {
  to: string
  fullName: string
  tempPassword: string
  roleLabel: 'Champion' | 'Gatekeeper'
  loginUrl: string
}): Promise<{ error?: string }> {
  const { to, fullName, tempPassword, roleLabel, loginUrl } = params

  const subject = 'Your Healing Minds Matter account is ready'

  const text = `Hi ${fullName},

Your Healing Minds Matter ${roleLabel} account has been created.

Sign in here: ${loginUrl}
Email: ${to}
Temporary password: ${tempPassword}

You'll be asked to set your own password the first time you sign in — this
temporary one stops working as soon as you do, and this is your only copy
of it.

If you weren't expecting this account, you can ignore this email.`

  const html = `
<div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #0F172A;">
  <p>Hi ${escapeHtml(fullName)},</p>
  <p>Your Healing Minds Matter <strong>${roleLabel}</strong> account has been created.</p>
  <table style="width: 100%; background: #F8FAFC; border-radius: 8px; padding: 16px; margin: 20px 0;" cellpadding="6">
    <tr><td style="color: #64748B; font-size: 13px;">Email</td><td style="font-weight: 600;">${escapeHtml(to)}</td></tr>
    <tr><td style="color: #64748B; font-size: 13px;">Temporary password</td><td style="font-weight: 600; font-family: monospace;">${escapeHtml(tempPassword)}</td></tr>
  </table>
  <p>
    <a href="${loginUrl}" style="display: inline-block; background: #F4AC1E; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
      Sign in
    </a>
  </p>
  <p style="font-size: 13px; color: #475569;">
    You'll be asked to set your own password the first time you sign in — this temporary one stops working
    as soon as you do, and this is your only copy of it.
  </p>
  <p style="font-size: 12px; color: #94A3B8;">If you weren't expecting this account, you can ignore this email.</p>
</div>`

  return sendEmail({ to, subject, html, text })
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

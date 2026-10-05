import { ConfirmEmailChangeForm } from './confirm-email-change-form'

export const metadata = { title: 'Confirm Email Change — HMM Platform' }

// Opened from the "Change Email Address" email. Opening it changes nothing —
// only the Confirm button does (see confirmEmailChangeAction), so an email
// security scanner that opens links automatically can't complete a change.
export default async function ConfirmEmailChangePage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string }>
}) {
  const { token_hash, type } = await searchParams
  const valid = Boolean(token_hash) && type === 'email_change'

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-4 font-[family-name:var(--font-inter)]">
      <ConfirmEmailChangeForm tokenHash={valid ? token_hash! : null} />
    </main>
  )
}

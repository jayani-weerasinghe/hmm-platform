import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from './profile-form'

export const metadata = { title: 'My Profile — HMM Super Admin' }

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  champion:    'Champion',
  gatekeeper:  'Gatekeeper',
}

const ACCESS_LEVEL_LABELS: Record<string, string> = {
  super_admin: 'Full system access (Super Admin)',
  champion:    'Club-level access (Champion)',
  gatekeeper:  'Mobile app access (Gatekeeper)',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  if (profile.role !== 'super_admin') redirect(profile.role === 'champion' ? '/champion' : '/login')

  return (
    <div className="p-8">
      <div className="mx-auto max-w-2xl space-y-5">

        {/* Personal details card */}
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-base font-bold text-[#1B2B4A]">Personal details</h2>
          <ProfileForm
            initialFullName={profile.full_name}
            initialPhone={profile.phone ?? ''}
          />
        </div>

        {/* Read-only account info card — Scenario 01 & 03 */}
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-base font-bold text-[#1B2B4A]">Account information</h2>
          <div className="space-y-5">

            <div>
              <label className="block text-sm font-semibold text-[#1B2B4A]">
                Login email
              </label>
              <p className="mt-1 text-xs text-gray-400">Used for sign-in — contact your system administrator to change this.</p>
              <input
                readOnly
                value={profile.email}
                className="mt-2 w-full cursor-not-allowed rounded-xl border border-[#E2E8F0] bg-gray-50 px-4 py-3 text-sm text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1B2B4A]">
                Role
              </label>
              <p className="mt-1 text-xs text-gray-400">Assigned by the system — cannot be changed here.</p>
              <input
                readOnly
                value={ROLE_LABELS[profile.role] ?? profile.role}
                className="mt-2 w-full cursor-not-allowed rounded-xl border border-[#E2E8F0] bg-gray-50 px-4 py-3 text-sm text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1B2B4A]">
                Access level
              </label>
              <input
                readOnly
                value={ACCESS_LEVEL_LABELS[profile.role] ?? profile.role}
                className="mt-2 w-full cursor-not-allowed rounded-xl border border-[#E2E8F0] bg-gray-50 px-4 py-3 text-sm text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Password card — links to existing Story 1.3 page */}
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="mb-1 text-base font-bold text-[#1B2B4A]">Password</h2>
          <p className="mb-5 text-sm text-gray-500">
            Change your password from the dedicated security page.
          </p>
          <a
            href="/settings/change-password"
            className="inline-block rounded-xl border border-[#E2E8F0] px-5 py-2.5 text-sm font-semibold text-[#1B2B4A] transition-colors hover:bg-gray-50"
          >
            Change password →
          </a>
        </div>

      </div>
    </div>
  )
}

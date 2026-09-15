import { redirect } from 'next/navigation'

// Retired 2026-09-15: Change Password now lives exclusively inside the Admin
// Profile view (/super-admin/profile), not as an independent standalone
// page or a global-menu entry point. This redirect exists only so old
// bookmarks/links don't 404.
export default function LegacyChangePasswordRedirect() {
  redirect('/super-admin/profile/change-password')
}

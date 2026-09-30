// The two web portals (Super Admin and Champion). Safe to import from both
// client and server code — no secrets here.
export type Portal = 'super_admin' | 'champion'

export function parsePortal(value: unknown): Portal {
  return value === 'champion' ? 'champion' : 'super_admin'
}

export const LOGIN_PATH: Record<Portal, string> = {
  super_admin: '/login',
  champion: '/champion/login',
}

export const FORGOT_PASSWORD_PATH: Record<Portal, string> = {
  super_admin: '/forgot-password',
  champion: '/champion/forgot-password',
}

// Which portal an account role signs in through. Gatekeepers are
// mobile-only, so they have no web portal at all.
export function portalForRole(role: string | null | undefined): Portal | null {
  if (role === 'super_admin') return 'super_admin'
  if (role === 'champion') return 'champion'
  return null
}

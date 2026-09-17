import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PREFIXES = ['/login', '/forgot-password', '/reset-password', '/auth/']

export async function middleware(request: NextRequest) {
  // Must be created before any other logic so cookie refresh always runs
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — MUST be called before any redirects
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PREFIXES.some(p => pathname.startsWith(p))

  // Root → login
  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Protected route, not authenticated → login
  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  const needsRole =
    user &&
    (pathname === '/login' || pathname === '/forgot-password' ||
     pathname.startsWith('/super-admin') || pathname.startsWith('/champion') ||
     pathname === '/set-password')

  if (needsRole) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, must_change_password')
      .eq('id', user.id)
      .single()

    const destination = profile?.role === 'champion' ? '/champion' : '/super-admin'
    const mustSetPassword = profile?.must_change_password === true

    // Authenticated user hitting auth pages → send to their dashboard, or
    // to the forced password screen first if they haven't set a real
    // password yet.
    if (pathname === '/login' || pathname === '/forgot-password') {
      return NextResponse.redirect(new URL(mustSetPassword ? '/set-password' : destination, request.url))
    }

    // Forced first-login password change (Champions/Gatekeepers created
    // with a temporary password) — blocks every dashboard route until
    // must_change_password is cleared. /reset-password and /auth/* stay
    // reachable throughout (PUBLIC_PREFIXES, checked earlier above) since
    // "Forgot Password" is a legitimate way to satisfy this same
    // requirement without knowing the temporary password.
    if (mustSetPassword && pathname !== '/set-password') {
      return NextResponse.redirect(new URL('/set-password', request.url))
    }
    if (!mustSetPassword && pathname === '/set-password') {
      return NextResponse.redirect(new URL(destination, request.url))
    }

    // Role-gate the dashboard route groups themselves — RLS already scopes
    // the underlying data per role, but pages under the wrong role's route
    // group have no other guard, so a Champion could otherwise browse
    // straight into Super Admin screens (and vice versa) by URL.
    if (pathname.startsWith('/super-admin') && profile?.role !== 'super_admin') {
      return NextResponse.redirect(new URL(destination, request.url))
    }
    if (pathname.startsWith('/champion') && profile?.role !== 'champion') {
      return NextResponse.redirect(new URL(destination, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

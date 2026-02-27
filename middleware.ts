import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — do not remove this
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const publicPaths = ['/login', '/register']
  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p))

  // Not logged in → redirect to login (unless on a public path)
  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Logged in on a public path → redirect away
  if (user && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Authenticated — check profile for role-based routing
  if (user && !isPublicPath && pathname !== '/onboarding') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('user_id', user.id)
      .single()

    // No profile or profile incomplete → onboarding
    if (!profile || !profile.full_name) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // Students trying to access teacher routes
    if (pathname.startsWith('/teacher') && profile.role !== 'teacher') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Teachers trying to access student-only routes
    const studentOnlyPaths = ['/dashboard', '/practice', '/submission']
    if (
      studentOnlyPaths.some((p) => pathname.startsWith(p)) &&
      profile.role === 'teacher'
    ) {
      return NextResponse.redirect(new URL('/teacher', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

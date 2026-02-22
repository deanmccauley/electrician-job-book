import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  console.log('🚀 Proxy running for path:', request.nextUrl.pathname);
  
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            supabaseResponse = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            supabaseResponse.cookies.set({
              name,
              value,
              ...options,
            })
          })
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()
  
  console.log('👤 Proxy user:', user?.email || 'No user');

  // Important: Don't redirect API routes or static files
  const isPublicPath = request.nextUrl.pathname.startsWith('/_next') || 
                      request.nextUrl.pathname.includes('.');

  if (!isPublicPath) {
    // Protect job routes
    if (!user && request.nextUrl.pathname.startsWith('/jobs')) {
      console.log('➡️ No user, redirecting to /');
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    // Redirect from home to jobs if logged in
    if (user && request.nextUrl.pathname === '/') {
      console.log('➡️ User exists on home, redirecting to /jobs');
      const url = request.nextUrl.clone()
      url.pathname = '/jobs'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}
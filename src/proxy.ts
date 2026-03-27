import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/auth'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Admin routes
  if (pathname.startsWith('/admin') && session?.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login?redirect=/admin', req.url))
  }

  // Driver routes
  if (pathname.startsWith('/driver') && session?.user?.role !== 'DRIVER') {
    return NextResponse.redirect(new URL('/login?redirect=/driver', req.url))
  }

  // My bookings requires login
  if (pathname.startsWith('/my-bookings') && !session?.user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/driver/:path*', '/my-bookings/:path*'],
}

import { NextResponse } from 'next/server'

const ADMIN_PASSWORD = 'shopkaro@admin123'

export function middleware(req) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin') && 
      !pathname.startsWith('/admin-login') && 
      !pathname.startsWith('/api/admin')) {
    const auth = req.cookies.get('admin_auth')?.value
    if (auth !== ADMIN_PASSWORD) {
      return NextResponse.redirect(new URL('/admin-login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
}
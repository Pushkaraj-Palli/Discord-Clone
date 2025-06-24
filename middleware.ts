import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/|login|register|api/auth|api/register).*)'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Exclude public routes from authentication
  if (
    pathname.startsWith('/login') || 
    pathname.startsWith('/register') || 
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/register')
  ) {
    return NextResponse.next()
  }

  // Check for token in cookies or Authorization header
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('Authorization')?.split(' ')[1]

  if (!token) {
    // For API routes, return 401 Unauthorized
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    // For page routes, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Verify the token
    await verifyToken(token)
    return NextResponse.next()
  } catch (error) {
    // For API routes, return 401 Unauthorized
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    // For page routes, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }
} 
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  
  const protectedPaths = ['/admin', '/planning', '/dashboard', '/profile'];
  
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Si on est sur login/register avec un token, on redirige vers le dashboard
  const authPaths = ['/login', '/register'];
  const isAuthPath = authPaths.some(path => request.nextUrl.pathname.startsWith(path));
  
  if (isAuthPath && token) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/planning/:path*', '/dashboard/:path*', '/profile/:path*', '/login', '/register'],
};

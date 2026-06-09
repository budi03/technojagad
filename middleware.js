import { NextResponse } from 'next/server';
import { verifyToken } from './lib/jwt';

const PROTECTED_PATHS = ['/kalkulator', '/pengaturan'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // verifyToken sekarang async (jose) — harus di-await
  const payload = await verifyToken(token);
  if (!payload) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth_token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/kalkulator/:path*', '/pengaturan/:path*'],
};
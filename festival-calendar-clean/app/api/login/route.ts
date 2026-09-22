import { NextResponse } from 'next/server';
export async function POST(request: Request) {
  const { password } = await request.json();
  const correctPassword = process.env.ADMIN_PASSWORD || 'Jg20080701';
  if (password === correctPassword) {
    const response = NextResponse.json({ ok: true });
    response.cookies.set('admin_auth', 'true', { httpOnly: true, path: '/', maxAge: 60*60*24*7 });
    return response;
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}

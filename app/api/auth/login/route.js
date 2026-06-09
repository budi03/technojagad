import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { signToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute(
      'SELECT id, username, password FROM users WHERE username = ? LIMIT 1',
      [username]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: 'Username atau password salah.' },
        { status: 401 }
      );
    }

    const user = rows[0];

    let isValid = false;
    if (user.password.startsWith('$2')) {
      isValid = await bcrypt.compare(password, user.password);
    } else {
      isValid = password === user.password;
    }

    if (!isValid) {
      return NextResponse.json(
        { message: 'Username atau password salah.' },
        { status: 401 }
      );
    }

    // signToken sekarang async (jose)
    const token = await signToken({ id: user.id, username: user.username });

    const response = NextResponse.json(
      { message: 'Login berhasil.', username: user.username },
      { status: 200 }
    );

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 jam
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
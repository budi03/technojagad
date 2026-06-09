import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const user = token ? await verifyToken(token) : null; // await karena jose async

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, nama_kategori FROM kategori_jasa ORDER BY nama_kategori ASC'
    );
    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (error) {
    console.error('[GET KATEGORI ERROR]', error);
    return NextResponse.json({ message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
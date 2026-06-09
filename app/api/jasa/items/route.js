import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const user = token ? await verifyToken(token) : null; // await karena jose async

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const kategoriId = searchParams.get('kategori_id');

    if (!kategoriId || isNaN(Number(kategoriId))) {
      return NextResponse.json({ message: 'kategori_id tidak valid.' }, { status: 400 });
    }

    const [rows] = await pool.execute(
      'SELECT id, nama_jasa, tarif, deskripsi FROM item_jasa WHERE kategori_id = ? ORDER BY nama_jasa ASC',
      [Number(kategoriId)]
    );

    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (error) {
    console.error('[GET ITEMS ERROR]', error);
    return NextResponse.json({ message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
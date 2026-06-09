import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  return await verifyToken(token); // await karena jose async
}

export async function GET() {
  const user = await checkAuth();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const [rows] = await pool.execute(
      "SELECT nilai_setting FROM pengaturan WHERE nama_setting = ? LIMIT 1",
      ['template_chat']
    );

    if (rows.length === 0) {
      return NextResponse.json({ template: '' }, { status: 200 });
    }

    return NextResponse.json({ template: rows[0].nilai_setting }, { status: 200 });
  } catch (error) {
    console.error('[GET TEMPLATE ERROR]', error);
    return NextResponse.json({ message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

export async function PUT(request) {
  const user = await checkAuth();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { template } = body;

    if (template === undefined || template === null) {
      return NextResponse.json({ message: 'Data template tidak valid.' }, { status: 400 });
    }

    const [existing] = await pool.execute(
      "SELECT id FROM pengaturan WHERE nama_setting = ? LIMIT 1",
      ['template_chat']
    );

    if (existing.length === 0) {
      await pool.execute(
        "INSERT INTO pengaturan (nama_setting, nilai_setting) VALUES (?, ?)",
        ['template_chat', template]
      );
    } else {
      await pool.execute(
        "UPDATE pengaturan SET nilai_setting = ? WHERE nama_setting = ?",
        [template, 'template_chat']
      );
    }

    return NextResponse.json({ message: 'Template berhasil disimpan.' }, { status: 200 });
  } catch (error) {
    console.error('[PUT TEMPLATE ERROR]', error);
    return NextResponse.json({ message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
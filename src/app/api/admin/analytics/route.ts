import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken, getAnalytics } from '@/lib/db';

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  return verifyAdminToken(token);
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 401 });
  }

  const analytics = await getAnalytics();
  return NextResponse.json(analytics);
}

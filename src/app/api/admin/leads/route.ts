import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken, getLeads, updateLeadStatus, deleteLead } from '@/lib/db';

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  return verifyAdminToken(token);
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 401 });
  }

  const leads = await getLeads();
  return NextResponse.json({ leads });
}

export async function PATCH(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID и статус обязательны' }, { status: 400 });
    }

    const updated = await updateLeadStatus(id, status, notes);
    if (!updated) {
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка обновления заявки' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID заявки обязателен' }, { status: 400 });
    }

    const deleted = await deleteLead(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка удаления заявки' }, { status: 500 });
  }
}

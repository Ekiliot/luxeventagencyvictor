import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  verifyAdminToken,
  getPortfolio,
  addPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
} from '@/lib/db';

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  return verifyAdminToken(token);
}

// GET portfolio items
export async function GET() {
  try {
    const items = await getPortfolio();
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Portfolio GET error:', error);
    return NextResponse.json({ error: 'Ошибка загрузки портфолио' }, { status: 500 });
  }
}

// POST: Add new portfolio item (supports Base64 image)
export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body?.title?.ru || !body?.image) {
      return NextResponse.json({ error: 'Название и изображение обязательны' }, { status: 400 });
    }

    const item = await addPortfolioItem({
      title: {
        ru: body.title.ru,
        ro: body.title.ro || body.title.ru,
        en: body.title.en || body.title.ru,
      },
      category: {
        ru: body.category?.ru || 'Портфолио',
        ro: body.category?.ro || body.category?.ru || 'Portofoliu',
        en: body.category?.en || body.category?.ru || 'Portfolio',
      },
      image: body.image,
      order: Number(body.order) || 0,
      active: body.active !== false,
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error('Portfolio POST error:', error);
    return NextResponse.json({ error: 'Ошибка добавления в портфолио' }, { status: 500 });
  }
}

// PUT: Update portfolio item
export async function PUT(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({ error: 'Параметры id и updates обязательны' }, { status: 400 });
    }

    const updated = await updatePortfolioItem(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Элемент не найден' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error('Portfolio PUT error:', error);
    return NextResponse.json({ error: 'Ошибка обновления портфолио' }, { status: 500 });
  }
}

// DELETE: Remove portfolio item
export async function DELETE(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Параметр id обязателен' }, { status: 400 });
    }

    await deletePortfolioItem(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Portfolio DELETE error:', error);
    return NextResponse.json({ error: 'Ошибка удаления из портфолио' }, { status: 500 });
  }
}

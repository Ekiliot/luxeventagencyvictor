import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { 
  verifyAdminToken, 
  getCatalog, 
  saveCatalog,
  addCatalogCategory, 
  updateCatalogCategory, 
  deleteCatalogCategory,
  addCatalogItem,
  updateCatalogItem,
  deleteCatalogItem
} from '@/lib/db';

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  return verifyAdminToken(token);
}

// GET catalog (allowed for admin or public view)
export async function GET() {
  const catalog = await getCatalog();
  return NextResponse.json(catalog);
}

// POST: Add new category or item
export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, data } = body; // type: 'category' | 'item' | 'bulk'

    if (type === 'category') {
      const category = await addCatalogCategory(data);
      return NextResponse.json({ success: true, category }, { status: 201 });
    } else if (type === 'item') {
      const item = await addCatalogItem(data);
      return NextResponse.json({ success: true, item }, { status: 201 });
    } else if (type === 'bulk') {
      await saveCatalog(data);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Неверный тип операции' }, { status: 400 });
  } catch (error) {
    console.error('Catalog POST error:', error);
    return NextResponse.json({ error: 'Ошибка сохранения каталога' }, { status: 500 });
  }
}

// PUT: Update category or item
export async function PUT(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, id, updates } = body;

    if (!type || !id || !updates) {
      return NextResponse.json({ error: 'Параметры type, id и updates обязательны' }, { status: 400 });
    }

    if (type === 'category') {
      const updated = await updateCatalogCategory(id, updates);
      return NextResponse.json({ success: true, category: updated });
    } else if (type === 'item') {
      const updated = await updateCatalogItem(id, updates);
      return NextResponse.json({ success: true, item: updated });
    }

    return NextResponse.json({ error: 'Неверный тип' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 });
  }
}

// DELETE: Remove category or item
export async function DELETE(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ error: 'Параметры type и id обязательны' }, { status: 400 });
    }

    if (type === 'category') {
      await deleteCatalogCategory(id);
      return NextResponse.json({ success: true });
    } else if (type === 'item') {
      await deleteCatalogItem(id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Неверный тип' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 });
  }
}

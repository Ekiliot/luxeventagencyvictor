import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { verifyAdminToken, getCatalog, getLeads } from '@/lib/db';

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  return verifyAdminToken(token);
}

export async function POST() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 401 });
  }

  try {
    const catalog = await getCatalog();
    const leads = await getLeads();

    // 1. Sync Categories
    for (const cat of catalog.categories) {
      await supabase.from('categories').upsert({
        id: cat.id,
        name_ru: cat.name.ru,
        name_ro: cat.name.ro,
        name_en: cat.name.en,
        order_index: cat.order || 0
      });
    }

    // 2. Sync Catalog Items
    for (const item of catalog.items) {
      await supabase.from('catalog_items').upsert({
        id: item.id,
        category_id: item.categoryId,
        title_ru: item.title.ru,
        title_ro: item.title.ro,
        title_en: item.title.en,
        description_ru: item.description.ru,
        description_ro: item.description.ro,
        description_en: item.description.en,
        price: item.price,
        image: item.image,
        badge: item.badge || '',
        features: item.features || [],
        order_index: item.order || 0,
        active: item.active !== false
      });
    }

    // 3. Sync Leads
    for (const lead of leads) {
      await supabase.from('leads').upsert({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        service: lead.service,
        message: lead.message,
        status: lead.status,
        notes: lead.notes || ''
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Все категории, услуги и заявки успешно синхронизированы с Supabase!'
    });
  } catch (err: any) {
    console.error('Supabase sync error:', err);
    return NextResponse.json(
      { error: 'Ошибка синхронизации: ' + (err.message || 'Проверьте, созданы ли таблицы в Supabase') },
      { status: 500 }
    );
  }
}

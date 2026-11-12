import { NextRequest, NextResponse } from 'next/server';
import { addLead } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, message, service } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Имя и номер телефона обязательны' },
        { status: 400 }
      );
    }

    const lead = await addLead({
      name,
      phone,
      email: email || '',
      message: message || '',
      service: service || ''
    });

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error) {
    console.error('Error adding lead:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера при создании заявки' },
      { status: 500 }
    );
  }
}

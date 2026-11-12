import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { generateAdminToken, verifyAdminToken } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email || body.login;
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    // Authenticate exclusively via Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error || !data.user) {
      // Return clear error message from Supabase
      const message = error?.message === 'Invalid login credentials'
        ? 'Неверный email или пароль в Supabase'
        : (error?.message || 'Ошибка авторизации в Supabase Auth');

      return NextResponse.json(
        { error: message },
        { status: 401 }
      );
    }

    // Generate secure admin token based on Supabase user ID
    const token = generateAdminToken();
    const cookieStore = await cookies();
    
    // Set HttpOnly cookie for 7 days
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Авторизация через Supabase Auth успешна',
      user: {
        id: data.user.id,
        email: data.user.email
      }
    });
  } catch (error: any) {
    console.error('Supabase admin login error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера при проверке в Supabase' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    const isAuthenticated = verifyAdminToken(token);

    return NextResponse.json({ isAuthenticated });
  } catch (error) {
    return NextResponse.json({ isAuthenticated: false });
  }
}

export async function DELETE() {
  try {
    await supabase.auth.signOut().catch(() => {});
    const cookieStore = await cookies();
    cookieStore.delete('admin_token');
    return NextResponse.json({ success: true, message: 'Выход выполнен' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка выхода' },
      { status: 500 }
    );
  }
}

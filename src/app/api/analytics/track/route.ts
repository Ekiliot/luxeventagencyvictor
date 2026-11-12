import { NextRequest, NextResponse } from 'next/server';
import { recordVisit } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { path, referrer, isUnique, browser, device, screenWidth } = body;

    // Detect client IP
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1';

    // Detect country header (Cloudflare, Vercel, or custom)
    const countryHeader = 
      request.headers.get('cf-ipcountry') || 
      request.headers.get('x-vercel-ip-country') || 
      request.headers.get('x-country');
      
    const cityHeader = 
      request.headers.get('x-vercel-ip-city') || 
      request.headers.get('cf-ipcity');

    let country = countryHeader || 'Молдова (MD)';
    if (country === 'MD') country = 'Молдова (MD)';
    else if (country === 'RO') country = 'Румыния (RO)';
    else if (country === 'UA') country = 'Украина (UA)';
    else if (country === 'US') country = 'США (US)';
    else if (country === 'DE') country = 'Германия (DE)';
    else if (country === 'RU') country = 'Россия (RU)';

    // Device detection fallback
    let detectedDevice = device || 'Desktop';
    if (!device) {
      const ua = request.headers.get('user-agent') || '';
      if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
        detectedDevice = 'Mobile';
      } else if (/tablet|ipad/i.test(ua)) {
        detectedDevice = 'Tablet';
      }
    }

    // Record in database
    await recordVisit({
      path: path || '/',
      referrer: referrer || '',
      country: country,
      city: cityHeader || 'Chişinău',
      device: detectedDevice,
      browser: browser || 'Browser',
      ip: ip,
      isUnique: !!isUnique
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics track error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

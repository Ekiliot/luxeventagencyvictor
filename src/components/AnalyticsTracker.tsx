'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Skip tracking for admin panel or api calls
    if (!pathname || pathname.startsWith('/logadmin') || pathname.startsWith('/api')) {
      return;
    }

    // Avoid duplicate tracks on quick re-renders of the same page
    if (lastTrackedPath.current === pathname) {
      return;
    }
    lastTrackedPath.current = pathname;

    try {
      // Check if unique visitor session
      const hasSession = sessionStorage.getItem('lux_visited_session');
      const isUnique = !hasSession;
      if (isUnique) {
        sessionStorage.setItem('lux_visited_session', 'true');
      }

      // Device detection
      const ua = navigator.userAgent;
      let device = 'Desktop';
      if (/tablet|ipad/i.test(ua)) {
        device = 'Tablet';
      } else if (/mobile|iphone|android|phone/i.test(ua) || window.innerWidth < 768) {
        device = 'Mobile';
      }

      // Browser detection
      let browser = 'Browser';
      if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser';
      else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
      else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Edge';
      else if (ua.includes('Chrome')) browser = 'Chrome';
      else if (ua.includes('Safari')) browser = 'Safari';

      const payload = {
        path: pathname,
        referrer: document.referrer || '',
        isUnique,
        device,
        browser,
        screenWidth: window.innerWidth
      };

      // Send tracking data
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon('/api/analytics/track', blob);
      } else {
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(() => {});
      }
    } catch {
      // Ignore client tracking errors
    }
  }, [pathname]);

  return null;
}

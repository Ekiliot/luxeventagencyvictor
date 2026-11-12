'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { AdminLang } from '@/lib/adminDict';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminLang, setAdminLang] = useState<AdminLang>('ru');

  useEffect(() => {
    // Check saved language
    const saved = localStorage.getItem('luxe_admin_lang') as AdminLang;
    if (saved && (saved === 'ru' || saved === 'ro' || saved === 'en')) {
      setAdminLang(saved);
    }
  }, []);

  const handleLangChange = (l: AdminLang) => {
    setAdminLang(l);
    localStorage.setItem('luxe_admin_lang', l);
  };

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth');
      const data = await res.json();
      setIsAuthenticated(!!data.isAuthenticated);
    } catch {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0c' }}>
        <Loader2 size={36} color="#d4af37" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLogin 
        onSuccess={() => setIsAuthenticated(true)} 
        lang={adminLang}
        onLangChange={handleLangChange}
      />
    );
  }

  return (
    <AdminDashboard 
      onLogout={() => setIsAuthenticated(false)} 
      lang={adminLang}
      onLangChange={handleLangChange}
    />
  );
}

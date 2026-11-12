'use client';

import { useState } from 'react';
import { Shield, Eye, EyeOff, Loader2, ArrowRight, Mail } from 'lucide-react';
import { adminDict, AdminLang } from '@/lib/adminDict';
import styles from './admin.module.css';

interface AdminLoginProps {
  onSuccess: () => void;
  lang: AdminLang;
  onLangChange: (l: AdminLang) => void;
}

export function AdminLogin({ onSuccess, lang, onLangChange }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const t = adminDict[lang] || adminDict.ru;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t.errorAuth);
      }

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || t.errorAuth);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      {/* Top right language switcher */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.4rem', zIndex: 10 }}>
        {(['ru', 'ro', 'en'] as AdminLang[]).map((l) => (
          <button
            key={l}
            onClick={() => onLangChange(l)}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              border: '1px solid #232836',
              background: lang === l ? '#232a39' : '#141720',
              color: lang === l ? '#ffffff' : '#94a3b8',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            {l}
          </button>
        ))}
      </div>

      <div className={styles.loginCard}>
        <div className={styles.shieldIcon}>
          <Shield size={26} />
        </div>

        <h1 className={styles.loginTitle}>{t.title}</h1>
        <p className={styles.loginSubtitle}>{t.subtitle}</p>

        {errorMsg && (
          <div className={styles.loginError}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          {/* Email input */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.35rem' }}>
              {t.loginLabel}
            </label>
            <input
              type="email"
              required
              placeholder={t.emailPlaceholder}
              className={styles.loginInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>

          {/* Password input */}
          <div style={{ marginBottom: '1.4rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.35rem' }}>
              {t.passwordLabel}
            </label>
            <div className={styles.loginInputGroup} style={{ marginBottom: 0 }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={t.passwordPlaceholder}
                className={styles.loginInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={styles.togglePassBtn}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Скрыть' : 'Показать'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={styles.loginBtn}
          >
            {isLoading ? (
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                <span>{t.loginBtn}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className={styles.envTip}>
          {t.envTip}
        </div>
      </div>
    </div>
  );
}

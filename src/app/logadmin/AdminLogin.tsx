'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
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
        body: JSON.stringify({ email: email.trim(), password }),
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
      <div className={styles.loginTopBar}>
        <Link href={`/${lang}`} className={styles.backSiteLink}>
          {t.backToSite}
        </Link>

        <div className={styles.langSwitchWrap}>
          {(['ru', 'ro'] as AdminLang[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => onLangChange(l)}
              className={`${styles.langBtn} ${lang === l ? styles.activeLangBtn : ''}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.loginCard}>
        <div className={styles.shieldIcon}>
          <Shield size={24} />
        </div>

        <h1 className={styles.loginTitle}>
          LUXE<span className={styles.brandGold}>.</span>
        </h1>
        <p className={styles.loginSubtitle}>{t.subtitle}</p>

        {errorMsg && <div className={styles.loginError}>{errorMsg}</div>}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label className={styles.loginFieldLabel}>{t.loginLabel}</label>
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

          <div style={{ marginBottom: '1.35rem' }}>
            <label className={styles.loginFieldLabel}>{t.passwordLabel}</label>
            <div className={styles.loginInputGroup}>
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
                aria-label={showPassword ? t.hidePassword : t.showPassword}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className={styles.loginBtn}>
            {isLoading ? (
              <>
                <Loader2 size={18} className={styles.spinIcon} />
                <span>{t.loggingIn}</span>
              </>
            ) : (
              <>
                <span>{t.loginBtn}</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <div className={styles.envTip}>{t.envTip}</div>
      </div>
    </div>
  );
}

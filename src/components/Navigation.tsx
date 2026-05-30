'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Navigation.module.css';

export function Navigation({ lang, dict }: { lang: string, dict: any }) {
  const pathname = usePathname();
  const router = useRouter();

  const switchLanguage = (newLang: string) => {
    const pathWithoutLang = pathname.replace(`/${lang}`, '');
    router.push(`/${newLang}${pathWithoutLang}`);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <nav className={styles.nav}>
          <Link href={`/${lang}`} className={styles.logo}>
            LUX<span className={styles.goldDot}>.</span>
          </Link>
          
          <div className={styles.links}>
            <a href="#about" className={styles.link}>{dict.about}</a>
            <a href="#services" className={styles.link}>{dict.services}</a>
            <a href="#contact" className={styles.link}>{dict.contact}</a>
            
            <div className={styles.rightGroup}>
              <a href="tel:+37360123456" className={styles.navPhone}>
                +373 60 123 456
              </a>
              
              <div className={styles.langSwitcher}>
                {['en', 'ro', 'ru'].map((l) => (
                  <button 
                    key={l}
                    onClick={() => switchLanguage(l)}
                    className={`${styles.langBtn} ${lang === l ? styles.active : ''}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

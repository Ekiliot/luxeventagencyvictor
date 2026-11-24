'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Menu, X, Phone } from 'lucide-react';
import styles from './Navigation.module.css';

const navVariants: Variants = {
  hidden: { y: -100, x: "-50%", opacity: 0 },
  visible: { 
    y: 0, 
    x: "-50%",
    opacity: 1, 
    transition: { 
      duration: 1.2, 
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.1,
      delayChildren: 0.2
    } 
  }
};

const itemVariants: Variants = {
  hidden: { y: -20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

export function Navigation({ lang, dict }: { lang: string, dict: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const switchLanguage = (newLang: string) => {
    const pathWithoutLang = pathname.replace(`/${lang}`, '');
    setMobileMenuOpen(false);
    router.push(`/${newLang}${pathWithoutLang}`);
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* SVG filter for the liquid glass effect */}
      <svg style={{ display: 'none' }}>
        <filter id="glass-distortion">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="1" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <motion.header 
        className={styles.liquidGlassWrapper}
        variants={navVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Liquid Glass Layers */}
        <div className={styles.liquidGlassEffect}></div>
        <div className={styles.liquidGlassTint}></div>
        <div className={styles.liquidGlassShine}></div>

        <div className={styles.container}>
          <nav className={styles.nav}>
            <motion.div variants={itemVariants}>
              <Link href={`/${lang}`} className={styles.logo} onClick={() => setMobileMenuOpen(false)}>
                LUXE<span className={styles.goldDot}>.</span>
              </Link>
            </motion.div>
            
            <div className={styles.links}>
              <motion.a variants={itemVariants} href={`/${lang}#services`} className={styles.link}>{dict.services}</motion.a>
              <motion.div variants={itemVariants}>
                <Link href={`/${lang}/prices`} className={styles.link}>
                  {dict.prices || 'Прайс'}
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link href={`/${lang}/portfolio`} className={styles.link}>
                  {dict.portfolio || 'Портфолио'}
                </Link>
              </motion.div>
              <motion.a variants={itemVariants} href={`/${lang}#contact`} className={styles.link}>{dict.contact}</motion.a>
              
              <motion.div variants={itemVariants} className={styles.rightGroup}>
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
              </motion.div>
            </div>

            {/* Mobile Controls (hidden on desktop > 900px) */}
            <div className={styles.mobileControls}>
              <div className={styles.mobileLangSwitcher}>
                {['en', 'ro', 'ru'].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => switchLanguage(l)}
                    className={`${styles.mobileLangBtn} ${lang === l ? styles.mobileLangActive : ''}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={styles.menuToggleBtn}
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Glass Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className={styles.mobileMenuBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              className={styles.mobileMenuPanel}
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.mobileNavLinks}>
                <a
                  href={`/${lang}#services`}
                  className={styles.mobileNavLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {dict.services}
                </a>
                <Link
                  href={`/${lang}/prices`}
                  className={styles.mobileNavLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {dict.prices || 'Прайс'}
                </Link>
                <Link
                  href={`/${lang}/portfolio`}
                  className={styles.mobileNavLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {dict.portfolio || 'Портфолио'}
                </Link>
                <a
                  href={`/${lang}#contact`}
                  className={styles.mobileNavLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {dict.contact}
                </a>
              </div>

              <div className={styles.mobileMenuDivider} />

              <a href="tel:+37360123456" className={styles.mobilePhoneBtn}>
                <Phone size={15} />
                <span>+373 60 123 456</span>
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
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

  const switchLanguage = (newLang: string) => {
    const pathWithoutLang = pathname.replace(`/${lang}`, '');
    router.push(`/${newLang}${pathWithoutLang}`);
  };

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
              <Link href={`/${lang}`} className={styles.logo}>
                LUX<span className={styles.goldDot}>.</span>
              </Link>
            </motion.div>
            
            <div className={styles.links}>
              <motion.a variants={itemVariants} href="#about" className={styles.link}>{dict.about}</motion.a>
              <motion.a variants={itemVariants} href="#services" className={styles.link}>{dict.services}</motion.a>
              <motion.a variants={itemVariants} href="#contact" className={styles.link}>{dict.contact}</motion.a>
              
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
          </nav>
        </div>
      </motion.header>
    </>
  );
}

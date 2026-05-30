'use client';

import { motion } from 'framer-motion';
import styles from './Hero.module.css';

export function Hero({ dict }: { dict: any }) {
  return (
    <section className={styles.hero}>
      <div className={styles.background}></div>
      <div className={styles.overlay}></div>
      
      <div className={styles.content}>
        <motion.div
          className={styles.titleWrapper}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h1 className="heading-hero">
            {dict.title}
          </h1>
        </motion.div>
        
        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        >
          {dict.subtitle}
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
        >
          <a href="#services" className={styles.cta}>
            {dict.cta}
          </a>
        </motion.div>
      </div>
    </section>
  );
}

'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import styles from './Hero.module.css';

const FALLBACK_IMAGES = [
  '/photozones/1f4ebfa4-34af-4cbd-8059-3186ce818cb0.jpg',
  '/photozones/469f67a3-025a-4daf-a1ab-1bd0d9ec4152.jpg',
  '/photozones/5faa47a8-0b4a-48aa-ac82-82cf344d45c4.jpg',
  '/photozones/69d7745b-2db8-4487-b068-08ec1351a862.jpg',
];

interface HeroProps {
  dict: any;
  images?: string[];
}

export function Hero({ dict, images }: HeroProps) {
  const trackImages = useMemo(() => {
    const source = images && images.length > 0 ? images : FALLBACK_IMAGES;
    // Ensure at least 6 images in a single group so the loop is wide & seamless
    const expanded: string[] = [];
    while (expanded.length < 6) {
      expanded.push(...source);
    }
    return expanded;
  }, [images]);

  const reversedImages = useMemo(() => [...trackImages].reverse(), [trackImages]);

  return (
    <section className={styles.hero}>
      {/* Ultra-subtle slow-drifting portfolio backdrop */}
      <div className={styles.ambientBackdrop} aria-hidden="true">
        <div className={`${styles.ambientRow} ${styles.rowSlowLeft}`}>
          {[...trackImages, ...trackImages].map((src, idx) => (
            <div key={`top-${idx}`} className={styles.ambientFrame}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className={styles.ambientImg}
                loading="eager"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>

        <div className={`${styles.ambientRow} ${styles.rowSlowRight}`}>
          {[...reversedImages, ...reversedImages].map((src, idx) => (
            <div key={`bot-${idx}`} className={styles.ambientFrame}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className={styles.ambientImg}
                loading="eager"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>

        {/* Soft radial & edge veil so typography stays razor-sharp */}
        <div className={styles.ambientVeil} />
      </div>

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

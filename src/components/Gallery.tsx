'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Expand, ArrowRight } from 'lucide-react';
import { PortfolioItem } from '@/lib/types';
import styles from './Gallery.module.css';

const fallbackImages: Record<string, string> = {
  corporate: 'https://static.tildacdn.com/tild3237-3161-4437-a361-383537333038/Screenshot_-_2025-10.png',
  candybar: 'https://catering-muscat.ru/img/blog/blog_candy_6.jpg',
  birthdays: 'https://optim.tildacdn.com/tild3961-6363-4562-b862-356434613264/-/resize/824x/-/format/webp/DSC07101.jpg.webp',
  decor: 'https://img.freepik.com/free-photo/pink-chrysanthemums-hang-threads-from-ceiling-dinner-hall_1304-3325.jpg?semt=ais_related_payload_trends&w=740&q=80',
  photozones: 'https://solaair.ru/upload/iblock/93b/i0dm3pdols5q3paylyrd4hmulhirxm82.JPG',
};

interface GalleryProps {
  dict: any;
  items?: PortfolioItem[];
  lang?: 'en' | 'ro' | 'ru';
}

export function Gallery({ dict, items, lang = 'ru' }: GalleryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [lightboxItem, setLightboxItem] = useState<{ title: string; category: string; image: string } | null>(null);

  const getLoc = (obj: any): string => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj['ru'] || obj['ro'] || obj['en'] || '';
  };

  const activeDbItems = (items || []).filter((i) => i.active !== false);

  const galleryItems =
    activeDbItems.length > 0
      ? activeDbItems.map((i) => ({
          id: i.id,
          title: getLoc(i.title),
          category: getLoc(i.category),
          image: i.image || fallbackImages[i.id] || '/photozones/1f4ebfa4-34af-4cbd-8059-3186ce818cb0.jpg',
        }))
      : (dict.items || []).map((i: any) => ({
          id: i.id,
          title: i.title,
          category: i.category,
          image: fallbackImages[i.id] || '/photozones/1f4ebfa4-34af-4cbd-8059-3186ce818cb0.jpg',
        }));

  return (
    <section id="gallery" className={`section-padding ${styles.gallerySection}`}>
      <div className="container">
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className={styles.title}>{dict.title}</h2>
          <p className={styles.subtitle}>{dict.filters?.all}</p>
        </motion.div>

        <div className={styles.accordionContainer}>
          {galleryItems.map((item: { id: string; title: string; category: string; image: string }, index: number) => {
            const isHovered = hoveredIndex === index;
            const isAnyHovered = hoveredIndex !== null;

            return (
              <motion.div
                key={item.id}
                className={styles.panel}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {
                  if (isHovered) {
                    setLightboxItem(item);
                  } else {
                    setHoveredIndex(index);
                  }
                }}
                animate={{
                  flex: isHovered ? 4 : isAnyHovered ? 1 : 2,
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={styles.imageWrapper}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className={styles.image}
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        '/photozones/1f4ebfa4-34af-4cbd-8059-3186ce818cb0.jpg';
                    }}
                  />
                  <div className={styles.overlay} />
                </div>

                <button
                  type="button"
                  className={styles.zoomBtn}
                  aria-label={item.title}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxItem(item);
                  }}
                >
                  <Expand size={15} />
                </button>

                <div className={styles.content}>
                  <motion.span
                    className={styles.category}
                    animate={{ opacity: isHovered ? 1 : 0.65 }}
                  >
                    {item.category}
                  </motion.span>
                  <motion.h3
                    className={styles.itemTitle}
                    animate={{
                      opacity: isHovered ? 1 : 0,
                      y: isHovered ? 0 : 20,
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    {item.title}
                  </motion.h3>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className={styles.footerAction}>
          <Link href={`/${lang}/portfolio`} className={styles.viewAllLink}>
            <span>
              {lang === 'ro'
                ? 'Vezi tot portofoliul'
                : lang === 'en'
                  ? 'Explore Full Portfolio'
                  : 'Смотреть всё портфолио'}
            </span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            className={styles.lightboxOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxItem(null)}
          >
            <motion.div
              className={styles.lightboxContent}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={styles.lightboxClose}
                onClick={() => setLightboxItem(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lightboxItem.image} alt={lightboxItem.title} className={styles.lightboxImg} />
              <div className={styles.lightboxCaption}>
                <span className={styles.lightboxCat}>{lightboxItem.category}</span>
                <h3 className={styles.lightboxTitle}>{lightboxItem.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

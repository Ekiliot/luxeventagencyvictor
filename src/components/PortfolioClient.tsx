'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Expand, ArrowRight, Images } from 'lucide-react';
import { PortfolioItem } from '@/lib/types';
import styles from './PortfolioClient.module.css';

interface PortfolioClientProps {
  items: PortfolioItem[];
  lang: 'en' | 'ro' | 'ru';
  dict: any;
}

export function PortfolioClient({ items, lang, dict }: PortfolioClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const getLoc = (obj: any): string => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj['ru'] || obj['ro'] || obj['en'] || '';
  };

  const activeItems = useMemo(
    () =>
      (items || [])
        .filter((item) => item.active !== false)
        .map((item) => ({
          id: item.id,
          title: getLoc(item.title),
          category: getLoc(item.category),
          image: item.image || '/photozones/1f4ebfa4-34af-4cbd-8059-3186ce818cb0.jpg',
        })),
    [items, lang]
  );

  const categories = useMemo(() => {
    const unique = new Set<string>();
    activeItems.forEach((item) => {
      if (item.category) unique.add(item.category);
    });
    return Array.from(unique);
  }, [activeItems]);

  const filteredItems = useMemo(
    () =>
      activeCategory === 'all'
        ? activeItems
        : activeItems.filter((item) => item.category === activeCategory),
    [activeItems, activeCategory]
  );

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % filteredItems.length
        );
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev - 1 + filteredItems.length) % filteredItems.length
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredItems.length]);

  const ui = {
    ru: {
      eyebrow: 'LUXE PORTFOLIO',
      title: dict?.title || 'Портфолио',
      subtitle: 'Избранные проекты: авторский декор, эффектные фотозоны, кэнди-бары и безупречно организованные события.',
      all: dict?.filters?.all || 'Все работы',
      empty: 'В этой категории пока нет фотографий.',
      ctaTitle: 'Хотите так же красиво на вашем событии?',
      ctaSubtitle: 'Ознакомьтесь с нашими пакетами и ценами или оставьте заявку на индивидуальную концепцию.',
      pricesBtn: 'Смотреть прайс-лист',
      contactBtn: 'Обсудить проект',
    },
    ro: {
      eyebrow: 'LUXE PORTFOLIO',
      title: dict?.title || 'Portofoliu',
      subtitle: 'Proiecte selectate: decor de autor, fotozone spectaculoase, candy bar-uri și evenimente organizate impecabil.',
      all: dict?.filters?.all || 'Toate lucrările',
      empty: 'Nu există fotografii în această categorie încă.',
      ctaTitle: 'Îți dorești un decor la fel de spectaculos?',
      ctaSubtitle: 'Descoperă pachetele și prețurile noastre sau contactează-ne pentru un concept personalizat.',
      pricesBtn: 'Vezi lista de prețuri',
      contactBtn: 'Discută proiectul',
    },
    en: {
      eyebrow: 'LUXE PORTFOLIO',
      title: dict?.title || 'Portfolio',
      subtitle: 'Curated signature projects: bespoke decor, statement photozones, artisan candy bars, and luxury celebrations.',
      all: dict?.filters?.all || 'All Work',
      empty: 'No photos in this category yet.',
      ctaTitle: 'Want this aesthetic for your celebration?',
      ctaSubtitle: 'Explore our transparent packages and pricing or get in touch for a custom concept.',
      pricesBtn: 'Explore Pricing',
      contactBtn: 'Start a Project',
    },
  }[lang];

  const currentLightboxItem =
    lightboxIndex !== null && filteredItems[lightboxIndex]
      ? filteredItems[lightboxIndex]
      : null;

  return (
    <section className={styles.portfolioSection}>
      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.eyebrow}>{ui.eyebrow}</div>
        <h1 className={styles.title}>{ui.title}</h1>
        <p className={styles.subtitle}>{ui.subtitle}</p>
      </motion.div>

      {/* Category Filter Tabs */}
      {categories.length > 0 && (
        <motion.div
          className={styles.tabsContainer}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveCategory('all');
              setLightboxIndex(null);
            }}
            className={`${styles.tabBtn} ${activeCategory === 'all' ? styles.activeTab : ''}`}
          >
            {ui.all} ({activeItems.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setActiveCategory(cat);
                setLightboxIndex(null);
              }}
              className={`${styles.tabBtn} ${activeCategory === cat ? styles.activeTab : ''}`}
            >
              {cat}
            </button>
          ))}
        </motion.div>
      )}

      {/* Portfolio Grid */}
      {filteredItems.length === 0 ? (
        <div className={styles.emptyState}>
          <Images size={40} style={{ opacity: 0.35, marginBottom: '0.8rem' }} />
          <p>{ui.empty}</p>
        </div>
      ) : (
        <motion.div className={styles.grid} layout transition={{ duration: 0.35 }}>
          <AnimatePresence>
            {filteredItems.map((item, idx) => (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.45, delay: idx * 0.04 }}
                className={styles.card}
                onClick={() => setLightboxIndex(idx)}
              >
                <div className={styles.imageWrapper}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className={styles.cardImage}
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        '/photozones/1f4ebfa4-34af-4cbd-8059-3186ce818cb0.jpg';
                    }}
                  />
                  <div className={styles.cardOverlay} />

                  <div className={styles.expandBadge}>
                    <Expand size={15} />
                  </div>

                  <div className={styles.cardInfo}>
                    {item.category && <span className={styles.cardCategory}>{item.category}</span>}
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Bottom CTA Banner */}
      <motion.div
        className={styles.ctaBanner}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7 }}
      >
        <h2 className={styles.ctaTitle}>{ui.ctaTitle}</h2>
        <p className={styles.ctaSubtitle}>{ui.ctaSubtitle}</p>
        <div className={styles.ctaActions}>
          <Link href={`/${lang}/prices`} className={styles.primaryCta}>
            <span>{ui.pricesBtn}</span>
            <ArrowRight size={15} />
          </Link>
          <a href={`/${lang}#contact`} className={styles.secondaryCta}>
            <span>{ui.contactBtn}</span>
          </a>
        </div>
      </motion.div>

      {/* Lightbox with Prev / Next Navigation */}
      <AnimatePresence>
        {currentLightboxItem && lightboxIndex !== null && (
          <motion.div
            className={styles.lightboxOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
          >
            <motion.div
              className={styles.lightboxModal}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={styles.lightboxClose}
                onClick={() => setLightboxIndex(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>

              {filteredItems.length > 1 && (
                <>
                  <button
                    type="button"
                    className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
                    onClick={() =>
                      setLightboxIndex(
                        (lightboxIndex - 1 + filteredItems.length) % filteredItems.length
                      )
                    }
                    aria-label="Previous"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                    onClick={() => setLightboxIndex((lightboxIndex + 1) % filteredItems.length)}
                    aria-label="Next"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}

              <div className={styles.lightboxImgWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentLightboxItem.image}
                  alt={currentLightboxItem.title}
                  className={styles.lightboxImg}
                />
              </div>

              <div className={styles.lightboxFooter}>
                <div>
                  <span className={styles.lightboxCategory}>{currentLightboxItem.category}</span>
                  <h3 className={styles.lightboxTitle}>{currentLightboxItem.title}</h3>
                </div>
                <span className={styles.lightboxCounter}>
                  {lightboxIndex + 1} / {filteredItems.length}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

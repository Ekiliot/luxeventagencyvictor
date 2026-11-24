'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Sparkles, GlassWater, Gift, Briefcase, Cake } from 'lucide-react';
import styles from './Services.module.css';

const ICONS: Record<string, React.ElementType> = {
  decor: Sparkles,
  planning: CalendarDays,
  private: GlassWater,
  surprises: Gift,
  corporate: Briefcase,
  candybar: Cake,
};

export function Services({ dict }: { dict: any }) {
  const items = dict.items as { id: string; title: string; description: string }[];
  const [activeIndex, setActiveIndex] = useState(0);

  const activeItem = items[activeIndex];
  const Icon = ICONS[activeItem.id];

  return (
    <section id="services" className={styles.section}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.eyebrow}>02</span>
        <h2 className={styles.title}>{dict.title}</h2>
      </div>

      {/* Tab pills */}
      <div className={styles.tabs}>
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            className={`${styles.tab} ${i === activeIndex ? styles.tabActive : ''}`}
            onClick={() => setActiveIndex(i)}
          >
            <span className={styles.tabNum}>0{i + 1}</span>
            <span className={styles.tabLabel}>{item.title}</span>
            {i === activeIndex && (
              <motion.div
                layoutId="pill"
                className={styles.pill}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content panel */}
      <div className={styles.panel}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.id}
            className={styles.content}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Watermark number */}
            <span className={styles.watermark}>0{activeIndex + 1}</span>

            {/* Icon */}
            <motion.div
              className={styles.icon}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.35 }}
            >
              <Icon size={56} strokeWidth={0.8} />
            </motion.div>

            {/* Title */}
            <motion.h3
              className={styles.itemTitle}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08, duration: 0.35 }}
            >
              {activeItem.title}
            </motion.h3>

            {/* Description */}
            <motion.p
              className={styles.itemDesc}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12, duration: 0.35 }}
            >
              {activeItem.description}
            </motion.p>

            {/* Clickable progress dots */}
            <div className={styles.dots}>
              {items.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.title}
                  onClick={() => setActiveIndex(i)}
                  className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

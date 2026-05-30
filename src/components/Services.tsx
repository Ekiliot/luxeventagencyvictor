'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
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
  const count = items.length;
  const [activeIndex, setActiveIndex] = useState(0);

  // The outer tall div is our scroll container target
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress THROUGH the tall container
  // offset: "start start" = when container top hits viewport top
  //         "end end"     = when container bottom hits viewport bottom
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    // Map 0..1 progress across N items
    const idx = Math.min(count - 1, Math.floor(latest * count));
    setActiveIndex(idx);
  });

  const activeItem = items[activeIndex];
  const Icon = ICONS[activeItem.id];

  return (
    /*
     * The wrapper is (count + 0.5) screens tall so:
     *  - sticky panel has enough space to pin for each tab
     *  - 0.5 extra gives a smooth "unstick" exit at the end
     */
    <div
      ref={containerRef}
      style={{ height: `${(count + 0.5) * 100}vh` }}
      className={styles.wrapper}
    >
      {/* Sticky panel */}
      <div className={styles.sticky}>
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
                className={`${styles.tab} ${i === activeIndex ? styles.tabActive : ''}`}
                onClick={() => {
                  if (!containerRef.current) return;
                  const rect = containerRef.current.getBoundingClientRect();
                  const containerTop = window.scrollY + rect.top;
                  const scrollableDistance = containerRef.current.offsetHeight - window.innerHeight;
                  const targetScrollY = containerTop + (i / count) * scrollableDistance;
                  window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
                }}
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Watermark number */}
                <span className={styles.watermark}>0{activeIndex + 1}</span>

                {/* Icon */}
                <motion.div
                  className={styles.icon}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.45 }}
                >
                  <Icon size={56} strokeWidth={0.8} />
                </motion.div>

                {/* Title */}
                <motion.h3
                  className={styles.itemTitle}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.45 }}
                >
                  {activeItem.title}
                </motion.h3>

                {/* Description */}
                <motion.p
                  className={styles.itemDesc}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.22, duration: 0.45 }}
                >
                  {activeItem.description}
                </motion.p>

                {/* Progress dots */}
                <div className={styles.dots}>
                  {items.map((_, i) => (
                    <span
                      key={i}
                      className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Scroll hint */}
          <AnimatePresence>
            {activeIndex === 0 && (
              <motion.div
                className={styles.scrollHint}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.8 }}
              >
                <motion.span
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                >
                  ↓
                </motion.span>
                <span>Прокрутите, чтобы увидеть все</span>
              </motion.div>
            )}
          </AnimatePresence>

        </section>
      </div>
    </div>
  );
}

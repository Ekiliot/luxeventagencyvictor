'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Sparkles, PartyPopper } from 'lucide-react';
import styles from './Services.module.css';

const icons: Record<string, React.ReactNode> = {
  planning: <CalendarDays size={64} strokeWidth={1} />,
  decor: <Sparkles size={64} strokeWidth={1} />,
  events: <PartyPopper size={64} strokeWidth={1} />
};

export function Services({ dict }: { dict: any }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeItem = dict.items[activeIndex];
  const ActiveIcon = icons[activeItem.id];

  return (
    <section id="services" className={`section-padding ${styles.services}`}>
      <div className={styles.blob1}></div>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <motion.h2 
          className="heading-section"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {dict.title}
        </motion.h2>

        <motion.div 
          className="silver-divider"
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        ></motion.div>

        <motion.div 
          className={styles.showcase}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.displayArea}>
            <AnimatePresence>
              <motion.div
                key={activeIndex}
                className={styles.displayContent}
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 0.3 } }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className={styles.displayIcon}>
                  {ActiveIcon}
                </div>
                <div className={styles.displayNumber}>0{activeIndex + 1}</div>
                <h3 className={styles.displayTitle}>{activeItem.title}</h3>
                <p className={styles.displayDesc}>{activeItem.description}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className={styles.listArea}>
            {dict.items.map((item: any, index: number) => (
              <div 
                key={item.id}
                className={`${styles.listItem} ${index === activeIndex ? styles.active : ''}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
              >
                <span className={styles.listNumber}>0{index + 1}</span>
                <span className={styles.listTitle}>{item.title}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

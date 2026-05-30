'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './Gallery.module.css';

const images: Record<string, string> = {
  corporate: 'https://static.tildacdn.com/tild3237-3161-4437-a361-383537333038/Screenshot_-_2025-10.png',
  candybar: 'https://catering-muscat.ru/img/blog/blog_candy_6.jpg',
  birthdays: 'https://optim.tildacdn.com/tild3961-6363-4562-b862-356434613264/-/resize/824x/-/format/webp/DSC07101.jpg.webp',
  decor: 'https://img.freepik.com/free-photo/pink-chrysanthemums-hang-threads-from-ceiling-dinner-hall_1304-3325.jpg?semt=ais_related_payload_trends&w=740&q=80',
  photozones: 'https://solaair.ru/upload/iblock/93b/i0dm3pdols5q3paylyrd4hmulhirxm82.JPG',
};

export function Gallery({ dict }: { dict: any }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const galleryItems = dict.items || [];

  return (
    <section className={`section-padding ${styles.gallerySection}`}>
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
          {galleryItems.map((item: any, index: number) => {
            const isHovered = hoveredIndex === index;
            const isAnyHovered = hoveredIndex !== null;

            return (
              <motion.div
                key={item.id}
                className={styles.panel}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                animate={{
                  flex: isHovered ? 4 : isAnyHovered ? 1 : 2,
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={styles.imageWrapper}>
                  <img src={images[item.id]} alt={item.title} className={styles.image} />
                  <div className={styles.overlay} />
                </div>
                
                <div className={styles.content}>
                  <motion.span 
                    className={styles.category}
                    animate={{ opacity: isHovered ? 1 : 0.6 }}
                  >
                    {item.category}
                  </motion.span>
                  <motion.h3 
                    className={styles.itemTitle}
                    animate={{ 
                      opacity: isHovered ? 1 : 0,
                      y: isHovered ? 0 : 20 
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
      </div>
    </section>
  );
}

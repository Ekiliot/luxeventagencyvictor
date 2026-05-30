'use client';

import styles from './Marquee.module.css';

export function Marquee({ dict }: { dict: any }) {
  const items = dict.items || [];
  return (
    <div className={styles.marqueeContainer}>
      <div className={styles.marqueeTrack}>
        {/* We duplicate the items to ensure infinite smooth scrolling without gaps */}
        {[...Array(4)].map((_, arrayIndex) => (
          <div key={arrayIndex} className={styles.marqueeGroup}>
            {items.map((item: string, index: number) => (
              <div key={`${arrayIndex}-${index}`} className={styles.marqueeItem}>
                <span className={styles.dot}>✦</span>
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

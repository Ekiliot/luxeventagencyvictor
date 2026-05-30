'use client';

import { motion } from 'framer-motion';
import styles from './About.module.css';
import teamImage from '../team-nobg.png';

export function About({ dict }: { dict: any }) {
  return (
    <section id="about" className={`section-padding ${styles.about}`}>
      <div className={styles.glow}></div>
      <div className="container">
        <div className={styles.grid}>
          {/* Spinning Circular Emblem Background */}
          <div className={styles.backgroundEmblem}>
            <motion.div
              className={styles.spinningEmblem}
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            >
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                {Array.from({ length: 60 }).map((_, i) => (
                  <circle 
                    key={i} 
                    cx="50" 
                    cy="1.5" 
                    r="0.4" 
                    fill="currentColor"
                    transform={`rotate(${i * (360/60)} 50 50)`}
                  />
                ))}
              </svg>
            </motion.div>
          </div>

          {/* Left Column: High-Fashion Wavy Masked Team Image */}
          <div className={styles.imageContainer}>
            <motion.div 
              className={styles.imageWrapper}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Backing morphing gold glow */}
              <div className={styles.blobBacking}></div>
              
              {/* Foreground morphing masked image frame */}
              <div className={styles.blobContainer}>
                <img src={teamImage.src} alt="Lux Event Agency Team" className={styles.image} />
              </div>
            </motion.div>
          </div>

          {/* Right Column: Copy Panel */}
          <div className={styles.content}>
            <motion.h2 
              className={styles.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {dict.title}
            </motion.h2>
            
            <motion.div 
              className={styles.accentLine}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            ></motion.div>

            <motion.h3 
              className={styles.subtitle}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              {dict.subtitle}
            </motion.h3>

            <motion.p 
              className={styles.text}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {dict.description1}
            </motion.p>
            
            <motion.p 
              className={styles.text}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {dict.description2}
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
